# UI Inventory & Redesign Checklist (Swiggy / Zepto / Zomato Level)

> **Document Status**: COMPLETED & PRODUCTION-VERIFIED (Vite 0 Errors, Zero Radius Purged, Inter Font, Design Tokens Pure)  
> **Target**: `apps/customer-food-web`  
> **Design Language**: Swiggy/Zepto/Zomato Ultra-Modern PWA (Inter font, Radius 16 cards, Radius 12 inputs, Radius 28 bottom sheets, Pill buttons, Neutral #FAFAFA / #FFFFFF, Tenant brand CSS tokens, 44px tap targets, 0ms latency perception).

---

## 1. Pages & Routes Checklist
- [x] **Home / Discovery (`/`, `/t/:tenantSlug`, `/t/:tenantSlug/b/:branchCode`)** - [Welcome.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/Welcome.tsx)
  - Hero banner with tenant branding & badges
  - Dining Mode Selector (Dine-In, Takeaway, Delivery) with touch-friendly cards
  - Table selection status / badge with switch trigger
  - Quick Category Carousel with pill chips
  - Popular / Chef's Recommendation food items grid
  - Sticky bottom action / explore menu CTA
- [x] **Menu & Discovery (`/menu`, `/t/:tenantSlug/menu`, etc.)** - [Menu.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/Menu.tsx)
  - Sticky blurred top search and filter header
  - Horizontal scrollable Category Chips with active pill indicators
  - Diet Filter Toggle (All, Pure Veg, Non-Veg)
  - Food Item Cards with high-resolution image, veg/non-veg indicator, price, descriptions
  - Dynamic Add Button turning into Quantity Stepper (`- [count] +`)
  - Floating Cart Bar with item count, total price, view cart arrow CTA
  - Vertical Category Quick Jump Sheet / Sidebar with Lucide icons (emojis replaced)
- [x] **Checkout & Payment (`/checkout`)** - [Checkout.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/Checkout.tsx)
  - Dining Mode status card with seamless mode switch
  - Table number card / delivery address picker
  - Items in Cart list with quantity steppers and add-ons display
  - Cooking instructions / notes input (no trailing ellipsis)
  - Delivery tip selection chips (₹10, ₹20, ₹30, ₹50, Custom)
  - Bill details (Item total, Taxes & GST, Delivery fee, Platform fee, Discounts)
  - Razorpay Digital Payment trigger & sandbox fallback modal
  - Sticky bottom "Place Order & Pay" pill CTA with price snapshot
- [x] **Order Tracking & Live Status (`/order-status`)** - [OrderStatus.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/OrderStatus.tsx)
  - Live animated order status timeline (Received -> Kitchen Preparing -> Ready -> Delivered)
  - Estimated time counter with pulse animation
  - Live KOT token number / Table badge
  - Branch call / help contact card
  - Detailed item breakdown & invoice receipt summary
- [x] **Order History (`/my-orders`)** - [MyOrders.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/MyOrders.tsx)
  - Filter tabs (All, Active, Completed, Cancelled)
  - Order summary cards with order ID, date, time, total amount, status badge
  - "Track Order" and "Repeat / Reorder" quick action buttons
  - Empty state with friendly food illustration and "Order Now" button
- [x] **Customer Profile (`/profile`)** - [Profile.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/Profile.tsx)
  - Customer avatar, name, and phone number header
  - Saved addresses manager preview card
  - App preferences (Dark mode toggle, Language toggle)
  - Quick links (My Orders, Help & Support, Terms, Privacy)
  - Clean Logout confirmation trigger
- [x] **Customer Auth Login Guard (`/login` or guarded screens)** - [CustomerAuthGuard.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/CustomerAuthGuard.tsx)
  - Mobile phone number entry with Indian flag & +91 prefix
  - Real OTP 6-box input with auto-focus and resend timer
  - Guest checkout option
  - Full mobile responsiveness without scrollbars
  - Zero trailing ellipsis on button loading states
- [x] **Admin QR Generator (`/admin/qr`)** - [AdminQR.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/AdminQR.tsx)
  - Printable high-resolution QR cards with table numbers
  - Download / Print action buttons
- [x] **404 Not Found (`*`)** - [NotFound.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/pages/NotFound.tsx)
  - Clean food illustration, friendly message, and "Back to Home" pill CTA

---

## 2. Modals, Sheets, Drawers & Popups
- [x] **Item Detail & Customization Sheet** - [ItemDetailModal.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/ItemDetailModal.tsx)
  - Large rounded product image banner with gradient overlay
  - Veg / Non-Veg badge with item name and description
  - Variant options (Radio pill groups, e.g., Half / Full)
  - Add-ons checklist (Checkbox pills with prices)
  - Sticky bottom footer with quantity stepper and "Add Item ₹XX" button
- [x] **Cart Bottom Sheet** - [CartSheet.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/CartSheet.tsx)
  - Drag handle dismiss bar
  - Cart item list with variant details and inline quantity steppers
  - Bill summary calculation
  - Proceed to Checkout sticky button
  - Chef notes placeholder without trailing ellipsis
- [x] **Dining Mode Change Confirmation Dialog** - [ChangeOrderModeDialog.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/ChangeOrderModeDialog.tsx)
  - Clean cards for Dine-In, Takeaway, and Delivery
  - Cart clearing warning alert if switching modes
- [x] **Table Switch / QR Scanner Dialog** - [TableSwitchDialog.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/TableSwitchDialog.tsx)
  - Active table badge & input for changing table number
  - Viewfinder with animated laser scan
  - Quick action buttons to confirm or cancel
- [x] **Delivery Address Selection Dialog** - [AddressSelectDialog.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/AddressSelectDialog.tsx)
  - List of saved addresses with Home, Work, Other tag pills
  - Add new address form with Street, City, Pincode
  - Button text: "Saving Address" (zero trailing ellipsis)
- [x] **Branch Switch Dialog** - [BranchSwitchDialog.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/BranchSwitchDialog.tsx)
  - List of available restaurant branches with address and status
- [x] **Customer Profile & Address Edit Modal** - [CustomerProfileModal.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/CustomerProfileModal.tsx)
  - Name, email, and address editing form with Lucide icons (emojis purged)
- [x] **Auth Modal Sheet** - [AuthModal.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/AuthModal.tsx)
  - Mobile number + OTP verification inside bottom sheet
  - Button text: "Verifying Code" (zero trailing ellipsis)
- [x] **Location Guard Modal** - [SelectLocationModal.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/SelectLocationModal.tsx)
  - Prompt user to pick Dine-in table or delivery branch upon first arrival

---

## 3. Feedback, States & Notifications
- [x] **Toast Notifications**: Modern Sonner toasts with rounded pill styles and Lucide icons.
- [x] **Loading Skeletons**: [LoadingSkeleton.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/LoadingSkeleton.tsx) with shimmering gradient wave (no harsh spinners).
- [x] **Empty States**: Cart empty, orders empty, search no results with clear action buttons.
- [x] **Error States & Boundaries**: [App.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/App.tsx) error boundary with reload action and clean rounded card.
- [x] **PWA Install Banner**: [PWAInstallBanner.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/PWAInstallBanner.tsx) with tenant brand icon and install button.

---

## 4. Navigation & Layout
- [x] **Top App Bar**: [TopNavbar.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/TopNavbar.tsx) with frosted glass blur (`backdrop-blur-md`), tenant brand logo/name, location/table pill, language toggle, and cart badge.
- [x] **Bottom Navigation Bar**: [BottomNav.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/BottomNav.tsx) with active indicator pills, Lucide icons, and thumb-friendly touch targets.
- [x] **Category Quick Sidebar**: [CategorySidebar.tsx](file:///e:/2026/ssr_one_ai/apps/customer-food-web/src/components/CategorySidebar.tsx) with smooth scroll-spy and Lucide React icons.
