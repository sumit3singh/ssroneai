# The Baithak — Backend Constitution
**Version:** 1.0  
**Status:** Frozen  

---

## 1. FastAPI Standards
- **Routing**: Group routers by module and prefix them appropriately (e.g. `/api/v1/restaurant`, `/api/v1/auth`).
- **Dependencies**: Use FastAPI dependency injection (`Depends`) for db sessions, user authentication, and tenant validation.
- **Request Validation**: Use Pydantic V2 models for input serialization, validation, and output filtering. Do not return SQLAlchemy objects directly.

---

## 2. database Operations (SQLAlchemy 2.0)
- **Async Execution**: Use async session management exclusively:
  `async with AsyncSessionLocal() as session:`
- **Query Syntax**: Use SQLAlchemy 2.0 select objects. Raw SQL text execution must be avoided unless performing system-wide updates:
  `result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))`
- **Explicit Commits**: Never use autocommit. Always use explicit commits:
  `await db.commit()`

---

## 3. Architecture Separation
- **Router Layer**: Handles HTTP requests, parameter validations, and calls the service layer.
- **Service Layer**: Handles core business logic, validations, tax calculations, and event emissions.
- **Repository / Database Models**: Defines tables and primary schema relationships.
- **No Circular Imports**: Keep module imports isolated. Use lazy imports where required.
