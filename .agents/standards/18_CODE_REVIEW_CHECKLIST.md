# The Baithak — Code Review Checklist
**Version:** 1.0  
**Status:** Approved  

---

## 1. Code Review Checks

### 1.1 Architecture & Design
- Does the code adhere to the **Engine-Centric** philosophy? Are we writing modular code instead of specific hardcoded overrides?
- Is there any raw SQL queries? (Must be replaced with SQLAlchemy select/update expressions).

### 1.2 UI & UX Rules
- Are colors retrieved exclusively from semantic CSS classes / design tokens?
- Are dark colors prohibited when in Light Mode? (e.g. no hardcoded `bg-slate-950` or `text-white` on layouts).
- Does the layout adjust correctly to varying screen sizes?

### 1.3 Performance
- Are we avoiding N+1 query patterns in SQLAlchemy (use `selectinload` or `joinedload` on relationships)?
- Are heavy operations handled asynchronously on the server?
- Are search indices being utilized for fast queries?

### 1.4 Security
- Is Row-Level Security (RLS) partition keys present?
- Are inputs validated using Pydantic or frontend schemas?
- Are credentials or private keys hardcoded anywhere?
