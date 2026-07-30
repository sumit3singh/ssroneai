# The Baithak — Frontend Constitution
**Version:** 1.0  
**Status:** Frozen  

---

## 1. React Development Principles
- **Functional Components**: All views must use functional components with standard hooks (`useState`, `useMemo`, `useEffect`, `useRef`). Class components are prohibited.
- **Side Effects**: Side-effect logic must reside within custom React hooks or TanStack Query mutations. Keep component bodies focused solely on rendering.

---

## 2. Server Caching Rules (TanStack Query)
- **Cache Keys**: Query keys must follow the structured array pattern: `["module_name", filter_criteria, optional_identifiers]`.
- **Fallbacks**: Network query functions must catch exceptions and fallback to mock local databases (`mockDB`) or IndexedDB to prevent interface crashes.
- **Cache Invalidation**: On successful mutations (e.g. creating an order), the corresponding queries must be invalidated instantly to trigger automatic refetches:
  `queryClient.invalidateQueries({ queryKey: ["menu-items"] });`

---

## 3. Theme & Styling Compliance
- **Rule**: Hardcoded styling variables or raw hex colors are strictly prohibited.
- **Implementation**: Layout elements must use Tailwind utility classes (e.g., `bg-background text-foreground`). If custom values are needed, they must reference design tokens in CSS variables.
- **Responsive Layout**: Design with mobile-first break points (`sm`, `md`, `lg`) using Tailwind selectors.
