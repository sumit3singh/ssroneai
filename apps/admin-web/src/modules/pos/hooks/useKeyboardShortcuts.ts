/**
 * ssrone ERP - POS Keyboard Shortcuts Engine
 * High-speed POS keyboard navigation (F2 = New Bill, F4 = Global Search, Ctrl+P = Fast Print, Esc = Close Modal).
 */

import { useEffect } from "react";

export interface ShortcutHandlers {
  onNewBill?: () => void;
  onSearch?: () => void;
  onPrint?: () => void;
  onCancel?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F2 -> New Bill
      if (event.key === "F2") {
        event.preventDefault();
        handlers.onNewBill?.();
      }
      // F4 -> Focus Search
      else if (event.key === "F4") {
        event.preventDefault();
        handlers.onSearch?.();
      }
      // Ctrl+P / Cmd+P -> Print Bill
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handlers.onPrint?.();
      }
      // Escape -> Cancel / Close
      else if (event.key === "Escape") {
        handlers.onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
