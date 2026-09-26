import { cleanTableName, formatItemWithVariantAndAddons } from "./posPrintFormatters";

export const POS_KIOSK_FULLSCREEN_KEY = "pos_kiosk_fullscreen";

/**
 * Checks if Kiosk Fullscreen mode is preferred/active for POS.
 */
export function isKioskFullscreenActive(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(POS_KIOSK_FULLSCREEN_KEY) === "true";
}

/**
 * Requests native HTML5 fullscreen and marks kiosk mode preference as true.
 */
export function requestKioskFullscreen(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    localStorage.setItem(POS_KIOSK_FULLSCREEN_KEY, "true");
    if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } catch {}
}

/**
 * Exits native HTML5 fullscreen and marks kiosk mode preference as false.
 * Only called on explicit user exit (Exit button, Esc key, F11 toggle).
 */
export function exitKioskFullscreen(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    localStorage.setItem(POS_KIOSK_FULLSCREEN_KEY, "false");
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch {}
}

/**
 * Tracks Fullscreen Kiosk mode, listens for `afterprint`, and immediately
 * restores Fullscreen mode on `afterprint` or the very next user click / keydown.
 */
export function registerFullscreenRestoreAfterPrint(targetWindow?: Window | null): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const wasFullscreen =
    Boolean(document.fullscreenElement) || isKioskFullscreenActive();

  if (!wasFullscreen) return;

  localStorage.setItem(POS_KIOSK_FULLSCREEN_KEY, "true");

  const tryRestoreFullscreen = () => {
    try {
      if (isKioskFullscreenActive() && !document.fullscreenElement && document.documentElement?.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  };

  const onPrintFinished = () => {
    // 1. Immediate restore attempt on print dialog close
    tryRestoreFullscreen();

    // 2. Attach one-time capture listener to restore fullscreen on the next click, touch, or key.
    const onNextGesture = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-exit-fullscreen="true"]')) return;
      tryRestoreFullscreen();
      window.removeEventListener("pointerdown", onNextGesture, true);
      window.removeEventListener("click", onNextGesture, true);
      window.removeEventListener("touchstart", onNextGesture, true);
      window.removeEventListener("keydown", onNextGesture, true);
    };

    window.addEventListener("pointerdown", onNextGesture, { once: true, capture: true });
    window.addEventListener("click", onNextGesture, { once: true, capture: true });
    window.addEventListener("touchstart", onNextGesture, { once: true, capture: true });
    window.addEventListener("keydown", onNextGesture, { once: true, capture: true });
  };

  window.addEventListener("afterprint", onPrintFinished, { once: true });
  if (targetWindow && targetWindow !== window) {
    try {
      targetWindow.addEventListener("afterprint", onPrintFinished, { once: true });
    } catch {}
  }
}

export async function safePrintWithFullscreenRestore(
  printFn?: () => void,
  targetWindow?: Window | null
): Promise<void> {
  registerFullscreenRestoreAfterPrint(targetWindow);
  if (printFn) {
    printFn();
  } else {
    window.print();
  }
}

/**
 * Universal Global Fullscreen Guard for POS.
 * Ensures the app NEVER exits fullscreen unintentionally in Chrome,
 * while allowing intentional exit only via Exit button, Esc button, or F11.
 */
export function initGlobalKioskFullscreenWatcher(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const tryRestoreIfKiosk = () => {
    try {
      if (isKioskFullscreenActive() && !document.fullscreenElement && document.documentElement?.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  };

  // Re-engage fullscreen on any user click or pointer down if kiosk mode is preferred
  const handleUserGesture = (e: Event) => {
    if (!isKioskFullscreenActive() || Boolean(document.fullscreenElement)) {
      return;
    }

    const target = e.target as HTMLElement | null;
    if (target?.closest?.('[data-exit-fullscreen="true"]')) {
      return;
    }

    tryRestoreIfKiosk();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Esc: standard user exit mechanism requested by user
    if (e.key === "Escape") {
      exitKioskFullscreen();
      return;
    }

    // F11: standard toggle mechanism requested by user
    if (e.key === "F11") {
      e.preventDefault();
      if (isKioskFullscreenActive()) {
        exitKioskFullscreen();
      } else {
        requestKioskFullscreen();
      }
      return;
    }

    // Any other key while in kiosk mode: restore fullscreen if dropped
    if (isKioskFullscreenActive() && !document.fullscreenElement) {
      tryRestoreIfKiosk();
    }
  };

  const handleWindowFocus = () => {
    tryRestoreIfKiosk();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      tryRestoreIfKiosk();
    }
  };

  window.addEventListener("pointerdown", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("click", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("touchstart", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("keydown", handleKeyDown, { capture: true });
  window.addEventListener("focus", handleWindowFocus);
  window.addEventListener("afterprint", handleWindowFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  try {
    const mql = window.matchMedia("print");
    const handleMql = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        tryRestoreIfKiosk();
      }
    };
    mql.addEventListener("change", handleMql);
  } catch {}

  return () => {
    window.removeEventListener("pointerdown", handleUserGesture, true);
    window.removeEventListener("click", handleUserGesture, true);
    window.removeEventListener("touchstart", handleUserGesture, true);
    window.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("focus", handleWindowFocus);
    window.removeEventListener("afterprint", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

export interface CustomerReceiptSlipData {
  orderNumber: string;
  orderType: string;
  tableName?: string;
  waiterName?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Array<any>;
  subtotal: number;
  packagingChargeTotal?: number;
  taxAmount: number;
  discountAmount?: number;
  netAmount: number;
  paymentMethod?: string;
  timestamp: string;
  venueName?: string;
  venueAddress?: string;
  venueGstin?: string;
  venuePhone?: string;
  venueFssai?: string;
}

/**
 * Directly prints the 80mm customer receipt slip using a dedicated hidden iframe.
 * Prevents screen flicker, keeps the main window in place, enables immediate modal dismissal,
 * and seamlessly restores fullscreen.
 */
export function printCustomerReceiptDirectly(data: CustomerReceiptSlipData): void {
  if (typeof document === "undefined") return;

  const venueName = (data.venueName || "BAITHAK CAFE CUH").toUpperCase();
  const venueAddress = data.venueAddress || "";
  const venueGstin = data.venueGstin || "";
  const venuePhone = data.venuePhone || "";
  const venueFssai = data.venueFssai || "";

  const orderNumber = data.orderNumber || "";
  const orderType = (data.orderType || "DINE_IN").toUpperCase();
  const cleanTable = data.tableName ? cleanTableName(data.tableName) : "";
  const waiterName = data.waiterName || "";
  const custName = data.customerName || "Walk-in Guest";
  const custPhone = data.customerPhone || "";
  const custAddress = data.customerAddress || "";
  const paymentMethod = (data.paymentMethod || "CASH").toUpperCase();

  const itemsHtml = (data.items || []).map((it) => {
    const rawName = it.name || it.product_name || it.item_name || "Item";
    const variantName = it.variant_name || "";
    const addonsList = it.addons || it.selected_addons || it.addon_options || [];
    const itemTitle = formatItemWithVariantAndAddons(rawName, variantName, addonsList, "compact");
    const qtyPriceStr = `${it.quantity} x ₹${Number(it.unit_price).toFixed(2)}`;
    const amtStr = `₹${(it.quantity * it.unit_price).toFixed(0)}`;

    return `
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; font-weight: bold; margin-bottom: 3px;">
        <span style="flex: 1; padding-right: 6px; word-break: break-word;">${itemTitle}</span>
        <span style="text-align: right; padding: 0 6px; white-space: nowrap; color: #222;">${qtyPriceStr}</span>
        <span style="width: 52px; text-align: right; white-space: nowrap;">${amtStr}</span>
      </div>
    `;
  }).join("");

  const packagingRow = (data.packagingChargeTotal && data.packagingChargeTotal > 0)
    ? `
      <div style="display: flex; justify-content: space-between;">
        <span>Packaging:</span>
        <span>+₹${data.packagingChargeTotal}</span>
      </div>
    `
    : "";

  const discountRow = (data.discountAmount && data.discountAmount > 0)
    ? `
      <div style="display: flex; justify-content: space-between; font-weight: bold;">
        <span>Discount:</span>
        <span>-₹${data.discountAmount}</span>
      </div>
    `
    : "";

  let iframe = document.getElementById("thermal-receipt-silent-frame") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "thermal-receipt-silent-frame";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "80mm";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);
  }

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc) {
    safePrintWithFullscreenRestore();
    return;
  }

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt #${orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          .thermal-receipt-slip {
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm 3mm 8mm 3mm !important;
            box-sizing: border-box !important;
          }
        </style>
      </head>
      <body>
        <div class="thermal-receipt-slip">
          <div style="text-align: center; margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
            <div style="font-size: 14px; font-weight: 900; text-transform: uppercase;">${venueName}</div>
            ${venueAddress ? `<div style="font-size: 9.5px; margin-top: 1px;">Address: ${venueAddress}</div>` : ""}
            ${venueGstin ? `<div style="font-size: 9.5px; font-weight: bold; margin-top: 1px;">Gst: ${venueGstin}</div>` : ""}
            ${venuePhone ? `<div style="font-size: 9.5px; font-weight: bold; margin-top: 1px;">Mobile no. ${venuePhone}</div>` : ""}
            ${venueFssai ? `<div style="font-size: 9.5px; font-weight: bold; margin-top: 1px;">FSSAI: ${venueFssai}</div>` : ""}
          </div>

          <div style="margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px; font-size: 10.5px;">
            <div style="font-weight: bold;">Order No: ${orderNumber} ,Mode: ${orderType}</div>
            <div style="margin-top: 1px;">Date/Time: ${data.timestamp}</div>
            ${cleanTable ? `<div style="font-weight: bold; margin-top: 1px;">Dining Table: ${cleanTable}</div>` : ""}
            ${waiterName ? `<div style="font-size: 9.5px; margin-top: 1px;">Server: ${waiterName}</div>` : ""}
          </div>

          <div style="margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px; font-size: 10.5px;">
            <div style="font-weight: 800;">👤Customer Name: ${custName}</div>
            ${custPhone ? `<div style="font-size: 9.5px; margin-top: 1px;">Mobile Phone: ${custPhone}</div>` : ""}
            ${custAddress ? `<div style="font-size: 9.5px; margin-top: 1px;">Address: ${custAddress}</div>` : ""}
          </div>

          <div style="margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
              <span style="flex: 1;">ITEM & SIZE</span>
              <span style="text-align: right; padding: 0 6px;">QTY X PRICE</span>
              <span style="width: 52px; text-align: right;">AMT</span>
            </div>
            ${itemsHtml}
          </div>

          <div style="margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px; font-size: 10.5px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span>₹${data.subtotal}</span>
            </div>
            ${packagingRow}
            ${discountRow}
            <div style="display: flex; justify-content: space-between;">
              <span>GST:</span>
              <span>₹${data.taxAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; border-top: 1px solid #000; padding-top: 3px; margin-top: 3px;">
              <span>Grand Total:</span>
              <span>₹${data.netAmount}</span>
            </div>
            ${paymentMethod ? `
              <div style="display: flex; justify-content: space-between; font-size: 9.5px; padding-top: 2px;">
                <span>Paid Via:</span>
                <span style="font-weight: bold; text-transform: uppercase;">${paymentMethod}</span>
              </div>
            ` : ""}
          </div>

          <div style="text-align: center; font-size: 9.5px; font-weight: bold; padding-top: 4px;">
            Thank You For Dining With Us! Visit Again
          </div>
        </div>
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    try {
      registerFullscreenRestoreAfterPrint(iframe.contentWindow);
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("Iframe receipt print error, falling back to window.print()", e);
      safePrintWithFullscreenRestore();
    }
  }, 100);
}


