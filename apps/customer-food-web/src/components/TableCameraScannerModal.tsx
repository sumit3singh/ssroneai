import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, SwitchCamera } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    jsQR?: (data: Uint8ClampedArray, width: number, height: number, options?: any) => { data: string } | null;
    BarcodeDetector?: any;
  }
}

interface TableCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableScanned: (tableNumber: string) => void;
}

/**
 * Parses scanned QR text into a clean table number.
 * Supports:
 * - Direct URLs: http://domain/t/cafe/b/101/table/5/menu -> "5"
 * - Route fragments: /table/12 -> "12"
 * - Prefix notations: "TABLE: 3", "Table-4", "T-7" -> "3", "4", "7"
 * - JSON: {"table": "8"} -> "8"
 * - Raw string / number: "5" -> "5"
 */
export function parseTableNumberFromQR(rawText: string): string | null {
  if (!rawText) return null;
  let trimmed = rawText.trim();

  // Try decoding URI-encoded strings (e.g. Table%20C-1 -> Table C-1)
  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    // keep as is
  }

  // 1. JSON payload
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const val = parsed.table || parsed.tableNumber || parsed.table_number || parsed.table_id || parsed.id;
      if (val !== undefined && val !== null) return String(val).trim();
    } catch {
      // not valid json, proceed to regex
    }
  }

  // 2. URL or path containing /table/:number (extract up to next slash, query '?' or hash '#')
  const urlMatch = trimmed.match(/\/table\/([^/?#]+)/i);
  if (urlMatch && urlMatch[1]) {
    let clean = urlMatch[1].trim();
    try {
      clean = decodeURIComponent(clean);
    } catch {}
    if (clean) return clean;
  }

  // 3. Query param ?table=C-1 or ?table_number=C-1 or ?table_id=5
  const queryMatch = trimmed.match(/[?&](?:table|table_number|table_id)=([^&?#]+)/i);
  if (queryMatch && queryMatch[1]) {
    let clean = queryMatch[1].trim();
    try {
      clean = decodeURIComponent(clean);
    } catch {}
    if (clean) return clean;
  }

  // 4. Prefix like "TABLE: 4", "Table-5", "Table C-1", "T-6", "TBL 2"
  const prefixMatch = trimmed.match(/^(?:table|tbl|t)[\s:_#-]*([^\r\n]+)$/i);
  if (prefixMatch && prefixMatch[1]) {
    return prefixMatch[1].trim();
  }

  // 5. Raw number or short identifier (e.g. "1", "12", "C-1", "Table C-1")
  if (trimmed.length > 0 && trimmed.length <= 30 && !trimmed.includes("/") && !trimmed.includes("http")) {
    return trimmed;
  }

  return null;
}

export const TableCameraScannerModal: React.FC<TableCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onTableScanned,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const isScanningActiveRef = useRef<boolean>(false);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    isScanningActiveRef.current = false;
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle successful scan
  const handleSuccessfulScan = useCallback(
    (detectedTable: string) => {
      if (!isScanningActiveRef.current) return;
      isScanningActiveRef.current = false;

      // Haptic feedback if supported on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {
          // ignore
        }
      }

      setScannedResult(detectedTable);
      stopCamera();

      // Brief animation pause so user sees confirmation checkmark
      setTimeout(() => {
        onTableScanned(detectedTable);
        onClose();
        setScannedResult(null);
      }, 700);
    },
    [onTableScanned, onClose, stopCamera]
  );

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);
    setScannedResult(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setErrorMessage("Camera access is not supported by your browser.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }

      // Check for multiple video input devices (switch camera button)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        setHasMultipleCameras(false);
      }

      // Begin detection loop
      isScanningActiveRef.current = true;

      // 1. Check if native BarcodeDetector is available
      let barcodeDetector: any = null;
      if ("BarcodeDetector" in window) {
        try {
          barcodeDetector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        } catch {
          barcodeDetector = null;
        }
      }

      scanIntervalRef.current = window.setInterval(async () => {
        if (!isScanningActiveRef.current || !videoRef.current) return;

        const video = videoRef.current;
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

        // Strategy A: Native BarcodeDetector (hardware accelerated 60fps)
        if (barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              const tableNum = parseTableNumberFromQR(rawValue);
              if (tableNum) {
                handleSuccessfulScan(tableNum);
                return;
              }
            }
          } catch {
            // BarcodeDetector error, fallback to jsQR below
          }
        }

        // Strategy B: jsQR Canvas Frame Grabber
        if (window.jsQR && canvasRef.current) {
          try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
              // Scale down slightly for performance and high-speed detection
              const width = Math.min(640, video.videoWidth);
              const height = Math.round((width / video.videoWidth) * video.videoHeight);

              if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
              }

              ctx.drawImage(video, 0, 0, width, height);
              const imageData = ctx.getImageData(0, 0, width, height);
              const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth",
              });

              if (code && code.data) {
                const tableNum = parseTableNumberFromQR(code.data);
                if (tableNum) {
                  handleSuccessfulScan(tableNum);
                  return;
                }
              }
            }
          } catch {
            // frame extraction error
          }
        }
      }, 150); // Scan every 150ms
    } catch (err: any) {
      console.warn("Camera init exception:", err);
      setHasCameraPermission(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission denied. Please allow camera access in browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No camera detected on this device.");
      } else {
        setErrorMessage("Unable to open camera. Please retry or verify permissions.");
      }
    }
  }, [facingMode, handleSuccessfulScan, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-neutral-950 border border-white/15 rounded-3xl p-5 shadow-2xl text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Camera className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-white tracking-wide">
                  Scan Table QR Code
                </h3>
                <p className="text-[11px] text-white/60">
                  Point camera at the QR code on your table
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner Viewport */}
          <div className="relative mt-4 aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-inner">
            {/* Hidden canvas for image data processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video stream */}
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover",
                hasCameraPermission === false && "hidden"
              )}
              playsInline
              muted
              autoPlay
            />

            {/* Overlay: Success State */}
            {scannedResult ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-center p-4 z-20"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-white font-serif">
                  Table {scannedResult} Verified!
                </h4>
                <p className="text-xs text-emerald-300 font-medium">
                  Connecting to table menu...
                </p>
              </motion.div>
            ) : hasCameraPermission === false ? (
              /* Overlay: Permission Denied / Error State */
              <div className="p-5 text-center flex flex-col items-center justify-center gap-2.5 z-10">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1">
                  <AlertCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-sm font-bold text-white">Camera Access Needed</h4>
                <p className="text-xs text-white/70 max-w-xs leading-relaxed">
                  {errorMessage || "Please allow camera access in your browser settings to scan the table QR code."}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-105 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            ) : (
              /* Overlay: Active Targeting Reticle with Scanning Laser */
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-10">
                {/* Target Frame Box */}
                <div className="relative w-full h-full max-w-[220px] max-h-[220px]">
                  {/* Top-Left Corner Bracket */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  {/* Top-Right Corner Bracket */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  {/* Bottom-Left Corner Bracket */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  {/* Bottom-Right Corner Bracket */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl shadow-[0_0_10px_rgba(251,191,36,0.5)]" />

                  {/* Animated Laser Scanning Line */}
                  <motion.div
                    animate={{
                      y: [0, 200, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b]"
                  />
                </div>
              </div>
            )}

            {/* Switch Camera Button (if device has front/back cameras) */}
            {hasMultipleCameras && hasCameraPermission && !scannedResult && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/90 hover:text-white border border-white/20 z-20 cursor-pointer shadow-md"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-white/60">
              Each table has a QR sticker. Align it in the camera box.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white/90 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TableCameraScannerModal;
