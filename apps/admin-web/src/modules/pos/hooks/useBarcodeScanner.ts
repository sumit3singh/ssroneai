/**
 * SSR One AI - Universal Hardware USB Barcode Scanner Wedge Listener
 * Intercepts rapid character inputs from hardware HID scanners (<30ms inter-character interval)
 * and adds matched menu items directly to cart without requiring manual input focus.
 */

import { useEffect, useRef, useState } from "react";
import { POSMenuItem } from "../types";
import { toast } from "sonner";

export interface UseBarcodeScannerOptions {
  menuItems: POSMenuItem[];
  onScanSuccess: (item: POSMenuItem) => void;
  enabled?: boolean;
}

export function useBarcodeScanner({ menuItems, onScanSuccess, enabled = true }: UseBarcodeScannerOptions) {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // If keystrokes arrive slowly (>35ms), reset buffer
      if (timeDiff > 60 && e.key !== "Enter") {
        bufferRef.current = "";
      }

      // If user is focused on a normal text input (e.g. search input), ignore human typing
      // Only process if keystrokes arrived at hardware scanner speed (<35ms)
      if (isInputFocused && timeDiff > 35 && !isScannerActive) {
        bufferRef.current = "";
        return;
      }

      // Capture single printable character keys
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current += e.key;

        // If characters arrive at scanner speed (< 35ms), flag scanner active
        if (timeDiff < 35 && bufferRef.current.length > 2) {
          setIsScannerActive(true);
        }
      }

      // Handle Enter key (barcode scanner suffix)
      if (e.key === "Enter" && bufferRef.current.length >= 2) {
        if (isInputFocused && !isScannerActive) {
          bufferRef.current = "";
          return;
        }
        const barcodeCode = bufferRef.current.trim().toLowerCase();
        bufferRef.current = "";

        // Look up item in catalog by barcode, sku, shortcode, or id
        const matchedItem = menuItems.find(
          (item) =>
            (item.barcode && item.barcode.toLowerCase() === barcodeCode) ||
            (item.sku && item.sku.toLowerCase() === barcodeCode) ||
            (item.shortcode && item.shortcode.toLowerCase() === barcodeCode) ||
            String(item.id).toLowerCase() === barcodeCode ||
            item.name.toLowerCase() === barcodeCode
        );

        if (matchedItem) {
          if (isInputFocused) {
            e.preventDefault();
            (target as HTMLInputElement).blur?.();
          }
          toast.success(`📦 Scanned: ${matchedItem.name}`, { duration: 2000 });
          onScanSuccess(matchedItem);
          setIsScannerActive(true);
          setTimeout(() => setIsScannerActive(false), 1500);
        } else if (isScannerActive) {
          toast.error(`Unrecognized barcode: "${barcodeCode}"`);
          setIsScannerActive(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuItems, onScanSuccess, enabled, isScannerActive]);

  return { isScannerActive };
}
