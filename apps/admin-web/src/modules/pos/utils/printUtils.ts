/**
 * Safe printing utility for POS operations.
 *
 * In Chromium (Google Chrome & Microsoft Edge), opening a modal print preview
 * drops HTML5 Fullscreen mode by design (browser security policy to prevent spoofing).
 * Firefox does not drop fullscreen because it sandboxes the print dialog inside the tab.
 *
 * This utility tracks Fullscreen Kiosk mode, listens for `afterprint`, and immediately
 * restores Fullscreen mode on `afterprint` or the very next user click / keydown.
 */
export function registerFullscreenRestoreAfterPrint(targetWindow?: Window | null): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const wasFullscreen =
    Boolean(document.fullscreenElement) ||
    localStorage.getItem("pos_kiosk_fullscreen") === "true";

  if (!wasFullscreen) return;

  // Persist kiosk flag so POS state retains fullscreen preference
  localStorage.setItem("pos_kiosk_fullscreen", "true");

  const tryRestoreFullscreen = () => {
    try {
      if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  };

  const onPrintFinished = () => {
    // 1. Immediate restore attempt on print dialog close
    tryRestoreFullscreen();

    // 2. Fallback: Chromium may require fresh user gesture token after modal dialog dismisses.
    // Attach one-time capture listener to restore fullscreen on the next click, touch, or key.
    const onNextGesture = () => {
      tryRestoreFullscreen();
      window.removeEventListener("pointerdown", onNextGesture, true);
      window.removeEventListener("click", onNextGesture, true);
      window.removeEventListener("keydown", onNextGesture, true);
    };

    window.addEventListener("pointerdown", onNextGesture, { once: true, capture: true });
    window.addEventListener("click", onNextGesture, { once: true, capture: true });
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

