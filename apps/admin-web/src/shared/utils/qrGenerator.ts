/**
 * SSR One AI - Pure Zero-Dependency Vector QR Code Generator
 * Re-exports the canonical ISO/IEC 18004 compliant QR generator from @ssrone/utils.
 */

export {
  generateQRCodeMatrix,
  generateQRCodeSVG,
  generateQRCodeDataUrl,
} from "@ssrone/utils";

export type { QRCodeOptions } from "@ssrone/utils";
