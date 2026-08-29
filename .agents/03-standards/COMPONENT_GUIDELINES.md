# Component Library & Design Guidelines

> **Last Reviewed**: August 2026

This document defines usage rules for shared UI primitive components in `@ssrone/ui`.

---

## 1. Shared Primitive Exports (`packages/ui`)

- `<Button>`: Variants `primary`, `secondary`, `outline`, `ghost`, `danger`, `ai`. Supports `isLoading` and `size` props.
- `<Input>`: Text, numeric, and search input controls with icon slot.
- `<Badge>`: Status indicator badges (`success`, `warning`, `danger`, `info`).
- `<Card>`: Content container with tokenized background and border styling.
- `<Modal>`: Accessible dialog component using Radix UI primitives.

---

## 2. Component Usage Law

UI components MUST be imported from `@ssrone/ui` (or `@/shared/ui` aliases). Ad-hoc custom button implementations or un-styled form controls are forbidden.
