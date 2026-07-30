# The Baithak — Component Library Specification
**Version:** 1.0  
**Status:** Approved  

---

## 1. Button Components
All buttons must inherit behavior from the base `Button` component in `@/shared/ui/primitives/Button`:
- **Default Variant**: Primary color background, white text.
- **Outline Variant**: Transparent background, border-border, text-foreground.
- **Destructive Variant**: Red background, white text.
- **States**: Every button must implement distinct loading, hover, focus-visible, and disabled states.

---

## 2. Card Components
Cards must be styled using the standard `Card` wrappers:
- **Style Rules**:
  - Class: `bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all`
  - Internal Padding: `p-4` or `p-5` depending on content density.

---

## 3. Modal & Overlay Dialogs
- **Structure**: An overlay wrapper (`bg-black/60 backdrop-blur-xs`), containing a centered content container (`bg-card rounded-2xl border-border shadow-xl`).
- **Dismissal**: Must be closable via the `Escape` key or by clicking outside the container (unless marked as non-dismissible).

---

## 4. Input & Control Elements
- **Structure**: Flex container with labels placed above inputs.
- **Classes**: `bg-background border border-border text-foreground rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary`
- **Error States**: Red border (`border-destructive`), and error label displayed directly below.
