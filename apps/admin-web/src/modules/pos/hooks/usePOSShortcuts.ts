/**
 * SSR One AI - Zero-Wait POS Keyboard Shortcuts Engine
 * High-speed cashier keyboard navigation (F1-F4, F11, /, Ctrl+K, Ctrl+T, Ctrl+O, Ctrl+H, Esc, +, -, Del).
 */

import { useEffect, useRef } from "react";

export interface POSShortcutHandlers {
  onHoldBill?: () => void;
  onSendKOT?: () => void;
  onSettleBill?: () => void;
  onFocusDiscount?: () => void;
  onToggleFullscreen?: () => void;
  onFocusSearch?: () => void;
  onSearchFocus?: () => void;
  onNavigateTables?: () => void;
  onFocusTable?: () => void;
  onFocusCategory?: () => void;
  onGenerateToken?: () => void;
  onNavigateOrders?: () => void;
  onOpenHeldBills?: () => void;
  onEscape?: () => void;
  onAdjustQuantity?: (delta: number) => void;
  onRemoveItem?: () => void;
  onSetOrderMode?: (mode: "dine_in" | "takeaway" | "delivery") => void;
  onCyclePayment?: () => void;
  onFocusCustomer?: () => void;
  onFocusRemark?: () => void;
  onQuickPay?: () => void;
  onClearCart?: () => void;
  onRemoveLastItem?: () => void;
  onViewHeldBills?: () => void;
  onViewActiveOrders?: () => void;
  onToggleKioskFullScreen?: () => void;
  onAddExpressItem?: (index: number) => void;
}

export function usePOSShortcuts(handlers: POSShortcutHandlers, enabled = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputActive =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      const key = event.key;
      const isCtrl = event.ctrlKey || event.metaKey;
      const h = handlersRef.current;

      const triggerSearchFocus = () => {
        if (h.onFocusSearch) h.onFocusSearch();
        if (h.onSearchFocus) h.onSearchFocus();
      };

      // Shift + F1..F12 -> Express Hotbar 1-Touch Add
      if (event.shiftKey && /^F([1-9]|1[0-2])$/i.test(key)) {
        event.preventDefault();
        const fIdx = parseInt(key.slice(1), 10) - 1;
        h.onAddExpressItem?.(fIdx);
        return;
      }

      // Alt + 1 -> Dine-In Mode
      if (event.altKey && key === "1") {
        event.preventDefault();
        h.onSetOrderMode?.("dine_in");
        return;
      }

      // Alt + 2 -> Takeaway Mode
      if (event.altKey && key === "2") {
        event.preventDefault();
        h.onSetOrderMode?.("takeaway");
        return;
      }

      // Alt + 3 -> Delivery Mode
      if (event.altKey && key === "3") {
        event.preventDefault();
        h.onSetOrderMode?.("delivery");
        return;
      }

      // Alt + C -> Focus Customer Combobox
      if (event.altKey && key.toLowerCase() === "c") {
        event.preventDefault();
        h.onFocusCustomer?.();
        return;
      }

      // Alt + R -> Focus Kitchen Order Remark Input
      if (event.altKey && key.toLowerCase() === "r") {
        event.preventDefault();
        h.onFocusRemark?.();
        return;
      }

      // Alt + P -> Cycle Payment Method (Cash -> UPI -> Card)
      if (event.altKey && key.toLowerCase() === "p") {
        event.preventDefault();
        h.onCyclePayment?.();
        return;
      }

      // F1 -> Hold Bill
      if (key === "F1") {
        event.preventDefault();
        h.onHoldBill?.();
        return;
      }

      // F2 -> Send KOT / Update KOT
      if (key === "F2") {
        event.preventDefault();
        h.onSendKOT?.();
        return;
      }

      // F3 -> Pay & Settle / Quick Pay
      if (key === "F3") {
        event.preventDefault();
        if (h.onQuickPay) h.onQuickPay();
        else h.onSettleBill?.();
        return;
      }

      // F4 -> Focus Discount Input
      if (key === "F4") {
        event.preventDefault();
        h.onFocusDiscount?.();
        return;
      }

      // F11 -> Toggle Kiosk Fullscreen Mode
      if (key === "F11") {
        event.preventDefault();
        if (h.onToggleKioskFullScreen) h.onToggleKioskFullScreen();
        else h.onToggleFullscreen?.();
        return;
      }

      // Ctrl + K -> Focus Search
      if (isCtrl && key.toLowerCase() === "k") {
        event.preventDefault();
        triggerSearchFocus();
        return;
      }

      // Alt + T or Ctrl + T -> Focus Table Selection / Jump to Table Floor Grid
      if ((event.altKey || isCtrl) && (key.toLowerCase() === "t" || event.code === "KeyT")) {
        event.preventDefault();
        if (h.onFocusTable) h.onFocusTable();
        else h.onNavigateTables?.();
        return;
      }

      // Alt + / -> Focus Category Search Filter
      if (event.altKey && (key === "/" || key === "?" || event.code === "Slash")) {
        event.preventDefault();
        h.onFocusCategory?.();
        return;
      }

      // Alt + Q -> Quick Token Generation
      if (event.altKey && (key.toLowerCase() === "q" || event.code === "KeyQ")) {
        event.preventDefault();
        h.onGenerateToken?.();
        return;
      }

      // Alt + O or Ctrl + O -> Jump to Order Tracking & Edit
      if ((event.altKey || isCtrl) && (key.toLowerCase() === "o" || event.code === "KeyO")) {
        event.preventDefault();
        h.onNavigateOrders?.();
        return;
      }

      // Alt + H or Ctrl + H -> Open Held Bills Modal
      if ((event.altKey || isCtrl) && (key.toLowerCase() === "h" || event.code === "KeyH")) {
        event.preventDefault();
        if (h.onViewHeldBills) h.onViewHeldBills();
        else h.onOpenHeldBills?.();
        return;
      }

      // Esc -> Dismiss Modal or Blur Search
      if (key === "Escape") {
        h.onEscape?.();
        if (isInputActive && target) {
          target.blur();
        }
        return;
      }

      // Non-input contextual shortcuts
      if (!isInputActive) {
        // '/' -> Focus Search
        if (key === "/") {
          event.preventDefault();
          triggerSearchFocus();
          return;
        }

        // '+' or '=' -> Increase Quantity
        if (key === "+" || key === "=") {
          event.preventDefault();
          h.onAdjustQuantity?.(1);
          return;
        }

        // '-' or '_' -> Decrease Quantity
        if (key === "-" || key === "_") {
          event.preventDefault();
          h.onAdjustQuantity?.(-1);
          return;
        }

        // Delete -> Remove selected cart item
        if (key === "Delete") {
          event.preventDefault();
          h.onRemoveItem?.();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
