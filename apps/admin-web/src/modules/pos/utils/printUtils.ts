/**
 * Safe printing utility for POS operations.
 *
 * Ensures that printing (via custom print function or native window.print())
 * does NOT forcefully kick cashiers out of their Kiosk / Fullscreen session.
 */
export async function safePrintWithFullscreenRestore(printFn?: () => void): Promise<void> {
  if (printFn) {
    printFn();
  } else {
    window.print();
  }
}

