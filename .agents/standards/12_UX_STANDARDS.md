# The Baithak — UX Standards
**Version:** 1.0  
**Status:** Approved  

---

## 1. 3-Click Transaction Policy
No core business transaction (placing an order, checking in a guest, processing a payment) should require more than **3 clicks** or keystrokes from the main workspace view:
- **Click 1**: Search / Focus input.
- **Click 2**: Selection / Add to Cart.
- **Click 3**: Payment Checkout / Confirm.

---

## 2. Keyboard Navigation Standards
The system must support full keyboard shortcuts for all cashier workflows:
- `/` key: Focuses the AI Command Bar instantly.
- `Alt + P` key: Triggers the checkout and prints the receipt.
- `Escape` key: Closes modals, resets search, and clears command box.

---

## 3. Search Behaviour Standards
- Search inputs must trigger filtration instantly (within 100ms) on keypress.
- Acronym and alias parsing must run locally on the client to avoid backend round-trips for high-speed terminal work.

---

## 4. UI State Standards

### 4.1 Loading State
- Large lists and grids must display skeleton wrappers styled with HSL base pulse animations.

### 4.2 Empty State
- Render a clear, descriptive icon (e.g. `ShoppingBag` or `FolderOpen`), a bold label (e.g. "No items in cart"), and a helpful prompt (e.g. "Use the AI Command box or search dishes").

### 4.3 Error State
- Inform the user of the exact error reason, display a primary action button (e.g., "Retry"), and fall back gracefully (e.g., to local storage cache).
