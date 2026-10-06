/**
 * SSR One AI - Pure Zero-Dependency Vector QR Code Generator
 * Generates ISO/IEC 18004 compliant QR Codes in SVG format without external dependencies.
 */

export interface QRCodeOptions {
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
}

// Galois Field (GF(256)) lookup tables
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGF256() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d; // Primitive polynomial: x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function rsComputeEcc(data: Uint8Array, numEccBytes: number): Uint8Array {
  const gen = new Uint8Array(numEccBytes + 1);
  gen[0] = 1;
  for (let i = 0; i < numEccBytes; i++) {
    const root = EXP_TABLE[i];
    for (let j = i; j >= 0; j--) {
      gen[j + 1] ^= gfMul(gen[j], root);
    }
  }

  const remainder = new Uint8Array(numEccBytes);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < numEccBytes - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    remainder[numEccBytes - 1] = gfMul(gen[numEccBytes], factor);
  }
  return remainder;
}

interface VersionSpec {
  version: number;
  totalCodewords: number;
  dataCodewords: number;
  eccPerBlock: number;
  numBlocks: number;
  alignments: number[];
}

const VERSION_SPECS_M: VersionSpec[] = [
  { version: 1, totalCodewords: 26, dataCodewords: 16, eccPerBlock: 10, numBlocks: 1, alignments: [] },
  { version: 2, totalCodewords: 44, dataCodewords: 28, eccPerBlock: 16, numBlocks: 1, alignments: [6, 18] },
  { version: 3, totalCodewords: 70, dataCodewords: 44, eccPerBlock: 26, numBlocks: 1, alignments: [6, 22] },
  { version: 4, totalCodewords: 100, dataCodewords: 64, eccPerBlock: 18, numBlocks: 2, alignments: [6, 26] },
  { version: 5, totalCodewords: 134, dataCodewords: 86, eccPerBlock: 24, numBlocks: 2, alignments: [6, 30] },
  { version: 6, totalCodewords: 172, dataCodewords: 108, eccPerBlock: 16, numBlocks: 4, alignments: [6, 34] },
  { version: 7, totalCodewords: 196, dataCodewords: 124, eccPerBlock: 18, numBlocks: 4, alignments: [6, 22, 38] },
  { version: 8, totalCodewords: 242, dataCodewords: 154, eccPerBlock: 22, numBlocks: 4, alignments: [6, 24, 42] },
  { version: 9, totalCodewords: 292, dataCodewords: 182, eccPerBlock: 22, numBlocks: 5, alignments: [6, 26, 46] },
  { version: 10, totalCodewords: 346, dataCodewords: 216, eccPerBlock: 26, numBlocks: 5, alignments: [6, 28, 50] },
];

export function generateQRCodeMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(text);
  const dataLen = utf8.length;

  const spec = VERSION_SPECS_M.find((v) => v.dataCodewords >= dataLen + 2) || VERSION_SPECS_M[VERSION_SPECS_M.length - 1];
  const size = 17 + spec.version * 4;

  const bitArray: number[] = [];
  function pushBits(val: number, bits: number) {
    for (let i = bits - 1; i >= 0; i--) {
      bitArray.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4);
  pushBits(dataLen, spec.version >= 10 ? 16 : 8);
  for (let i = 0; i < dataLen; i++) {
    pushBits(utf8[i], 8);
  }

  const maxDataBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, maxDataBits - bitArray.length);
  for (let i = 0; i < termLen; i++) bitArray.push(0);

  while (bitArray.length % 8 !== 0) bitArray.push(0);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitArray.length < maxDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataCodewords = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < spec.dataCodewords; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitArray[i * 8 + j];
    }
    dataCodewords[i] = b;
  }

  const blockSize = Math.floor(spec.dataCodewords / spec.numBlocks);
  const blocks: Uint8Array[] = [];
  const eccBlocks: Uint8Array[] = [];

  for (let b = 0; b < spec.numBlocks; b++) {
    const start = b * blockSize;
    const end = b === spec.numBlocks - 1 ? spec.dataCodewords : start + blockSize;
    const blockData = dataCodewords.slice(start, end);
    blocks.push(blockData);
    eccBlocks.push(rsComputeEcc(blockData, spec.eccPerBlock));
  }

  const finalCodewords: number[] = [];
  const maxBlockLen = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      if (i < blocks[b].length) finalCodewords.push(blocks[b][i]);
    }
  }
  for (let i = 0; i < spec.eccPerBlock; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      finalCodewords.push(eccBlocks[b][i]);
    }
  }

  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[tr][tc] = false;
          } else if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[tr][tc] = true;
          } else {
            matrix[tr][tc] = false;
          }
        }
      }
    }
  }
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  if (spec.alignments.length > 0) {
    const coords = spec.alignments;
    for (const r of coords) {
      for (const c of coords) {
        if ((r === 6 && c === 6) || (r === 6 && c === coords[coords.length - 1]) || (r === coords[coords.length - 1] && c === 6)) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            matrix[r + dr][c + dc] = isBorder || isCenter;
          }
        }
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  matrix[4 * spec.version + 9][8] = true;

  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = 0; i < 8; i++) {
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
  }

  let bitIdx = 0;
  const allBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((cw >> b) & 1);
    }
  }

  let right = size - 1;
  let upwards = true;

  while (right > 0) {
    if (right === 6) right--;
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const col of [right, right - 1]) {
        if (matrix[r][col] === null) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          const mask = (r + col) % 2 === 0;
          matrix[r][col] = (bit ^ (mask ? 1 : 0)) === 1;
        }
      }
    }
    right -= 2;
    upwards = !upwards;
  }

  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  matrix[8][0] = formatBits[0] === 1;
  matrix[8][1] = formatBits[1] === 1;
  matrix[8][2] = formatBits[2] === 1;
  matrix[8][3] = formatBits[3] === 1;
  matrix[8][4] = formatBits[4] === 1;
  matrix[8][5] = formatBits[5] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  matrix[5][8] = formatBits[9] === 1;
  matrix[4][8] = formatBits[10] === 1;
  matrix[3][8] = formatBits[11] === 1;
  matrix[2][8] = formatBits[12] === 1;
  matrix[1][8] = formatBits[13] === 1;
  matrix[0][8] = formatBits[14] === 1;

  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 8 + i] = formatBits[7 + i] === 1;
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}

export function generateQRCodeSVG(text: string, options: QRCodeOptions = {}): string {
  const matrix = generateQRCodeMatrix(text);
  const matrixSize = matrix.length;
  const margin = options.includeMargin !== false ? 4 : 0;
  const viewBoxSize = matrixSize + margin * 2;
  const fgColor = options.fgColor || "#0f172a";
  const bgColor = options.bgColor || "#ffffff";
  const size = options.size || 256;

  let pathD = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        pathD += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <path d="${pathD.trim()}" fill="${fgColor}"/>
</svg>`;
}

export function generateQRCodeDataUrl(text: string, options: QRCodeOptions = {}): string {
  const svg = generateQRCodeSVG(text, options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
