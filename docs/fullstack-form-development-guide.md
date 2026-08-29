# Full-Stack Form Development Guide for This Project

This guide is written for a new developer who wants to understand how forms are built in this repository, from the very basics to advanced full-stack implementation. It uses the restaurant category form as the example because it is a simple but complete pattern: frontend form, API call, backend validation, database model, and SQLAlchemy persistence.

The goal is to make the project easy to understand, even if you are starting from scratch.

---

## 1) What this project is built with

This monorepo uses multiple layers and multiple languages. You do not need to master everything at once, but you should understand the purpose of each layer.

### Frontend

- TypeScript
  - Main language for React apps.
  - Gives types, safer code, and better editor support.
- React
  - UI building library.
  - Used for pages, components, forms, tables, dashboards.
- Vite
  - Local dev server and build tool for frontend apps.
- Tailwind CSS
  - Utility-based styling framework.
- React Hook Form
  - Standard pattern for form state and validation.
- Zod
  - Schema validation for form data.
- Axios / shared API client
  - Sends requests to backend endpoints.

### Backend

- Python
  - Main backend language.
- FastAPI
  - API framework for creating routes and request validation.
- SQLAlchemy
  - ORM layer that maps Python classes to database tables.
- PostgreSQL
  - Primary database.
- Pydantic
  - Request/response validation and schema serialization.

### Database / schema layer

- SQL
  - Structured query language for tables, relations, and data access.
- DDL
  - Data Definition Language for creating tables and columns.
- migrations
  - Versioned DB change management.

### Project tooling

- pnpm
  - Monorepo package manager.
- Turbo repo
  - Runs multiple apps in one workspace.
- ESLint / Prettier
  - Code quality and formatting.

---

## 2) How the repository is organized

This repository is a monorepo, meaning many apps and packages live in one codebase.

### Main folders

- [apps](../apps)
  - Frontend applications
- [packages](../packages)
  - Reusable UI and shared logic packages
- [services/backend](../services/backend)
  - Python FastAPI backend
- [database](../database)
  - Database design and migration-related resources
- [docs](../docs)
  - Project documentation and engineering notes

### Relevant app for this example

- Frontend form example: [apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx](../apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx)
- API wrapper example: [apps/admin-web/src/modules/pos/api/categories.api.ts](../apps/admin-web/src/modules/pos/api/categories.api.ts)
- Backend categories route: [services/backend/src/modules/restaurant/router.py](../services/backend/src/modules/restaurant/router.py)
- Backend schemas: [services/backend/src/modules/restaurant/schemas.py](../services/backend/src/modules/restaurant/schemas.py)
- Backend model: [services/backend/src/modules/restaurant/models.py](../services/backend/src/modules/restaurant/models.py)

---

## 3) The full form lifecycle in this project

A form usually moves through these layers:

1. Frontend form state is created in React.
2. User fills fields and clicks Save.
3. Frontend sends HTTP request to the backend API.
4. Backend validates the payload with Pydantic.
5. Backend converts the request into a database model object.
6. SQLAlchemy adds the object to a database session.
7. Session is committed.
8. Response is returned to the frontend.
9. Frontend updates UI state and table/list.

This is the basic architecture of almost every CRUD form in this repo.

---

## 4) Important reality check for this project

This repository is powerful, but it is not yet fully uniform. There are still architecture gaps that any AI assistant or developer must understand before claiming the project is complete.

### Reality check

The real rule is: PostgreSQL and the backend schema are the source of truth. The frontend must not invent or silently fake data. If the UI shows an empty list, the real question is not “Why is the list empty?” but “Did the request fail, did the tenant filter exclude the records, or did the database not return data?”

The project still has places where this rule is weakly enforced:

- API client methods catch errors and return `[]`
- some routes default to tenant, company, or branch IDs like `1` or `2`
- some backend endpoints allow broader visibility than others
- some UI flows interpret an empty API response as a valid empty state rather than a failure state

This means the codebase is a good learning environment, but the production quality standard should be stricter than the current implementation. A form is not complete just because the frontend renders on screen; it is complete only when the database contract, API payload, and UI state agree under real runtime conditions.

---

## 4) The category form example

The restaurant category form is a perfect example of a complete CRUD flow.

### The frontend side

The admin page contains a full master-data screen that handles multiple modules, including categories.

See:

- [apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx](../apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx)

Important pieces:

- form state:
  - categoryForm
- load list:
  - refreshData()
- create/update submit:
  - handleSubmit()
- delete:
  - handleDelete()

The category branch of the form looks like this conceptually:

```tsx
const [categoryForm, setCategoryForm] = useState({
  name: "",
  sort_order: 1,
  is_active: true,
});
```

When the user submits:

```tsx
if (activeTab === "categories") {
  if (editRecord) {
    await api.put(`/restaurant/categories/${editRecord.id}`, categoryForm);
  } else {
    await api.post("/restaurant/categories", categoryForm);
  }
}
```

This means:

- UI creates a JavaScript object from form fields
- HTTP request sends JSON to backend
- backend handles insert or update logic

---

## 5) API wrapper pattern

The codebase often separates direct API requests into dedicated files.

See:

- [apps/admin-web/src/modules/pos/api/categories.api.ts](../apps/admin-web/src/modules/pos/api/categories.api.ts)

Example:

```ts
export const categoriesApi = {
  getCategories: async (): Promise<POSCategory[]> => {
    const res = await api.get<POSCategory[]>("/restaurant/categories");
    return res || [];
  },

  createCategory: async (name: string, icon: string): Promise<POSCategory> => {
    const res = await api.post<POSCategory>("/restaurant/categories", {
      name,
      icon,
      slug: name.toLowerCase().replace(/\s+/g, "-")
    });
    return res;
  },
};
```

This is a clean pattern because:

- API logic is centralized
- components stay cleaner
- same endpoint logic is reused
- testing becomes simpler

---

## 6) Backend route pattern

The server-side main logic lives in the restaurant router.

See:

- [services/backend/src/modules/restaurant/router.py](../services/backend/src/modules/restaurant/router.py)

The category routes include:

- list categories
- create category
- update category
- delete category

The important functions are:

- list_categories
- create_category
- update_category
- delete_category

### Create category flow

```python
@router.post("/categories", response_model=CategoryResponseSchema, status_code=201)
async def create_category(
    body: CategoryCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> CategoryResponseSchema:
    category = MenuCategory(
        tenant_id=current_user.tenant_id if current_user and current_user.tenant_id else 2,
        company_id=body.company_id or 1,
        branch_id=body.branch_id or 1,
        name=body.name,
        icon=body.icon or "🍛",
        slug=body.slug or body.name.lower().replace(" ", "-"),
        parent_id=body.parent_id,
        level=body.level or 1,
        sort_order=body.sort_order or 1,
        created_by=current_user.id if current_user else 1
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return CategoryResponseSchema.model_validate(category)
```

This shows the key flow:

- request body enters as schema instance
- Python object is created from the schema
- object is inserted into DB session
- commit writes to database
- response is returned in JSON-safe form

---

## 7) Schema validation layer

The schema layer defines what the API accepts and returns.

See:

- [services/backend/src/modules/restaurant/schemas.py](../services/backend/src/modules/restaurant/schemas.py)

Category schema:

```python
class CategoryCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    icon: str | None = None
    slug: str | None = None
    parent_id: int | None = None
    level: int = 1
    sort_order: int = 1
    company_id: int | None = None
    branch_id: int | None = None
```

This is the contract for the API. It says:

- name is required
- name must be at least 1 char and max 100
- optional icon and slug fields are allowed
- parent_id, level, sort_order are optional or defaulted

This is important because it prevents garbage data from reaching the database.

---

## 8) Database model layer and DDL pattern

The actual PostgreSQL table representation is defined as a SQLAlchemy model.

See:

- [services/backend/src/modules/restaurant/models.py](../services/backend/src/modules/restaurant/models.py)

Category model:

```python
class MenuCategory(BigIntTenantBaseModel):
    __tablename__ = "menu_categories"

    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("menu_categories.id", ondelete="SET NULL"), nullable=True)
    level: Mapped[int] = mapped_column(Integer, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)
```

This is the database definition in Python form.

### What this means

When this model runs, SQLAlchemy knows the table structure, column names, relationships, and constraints.

The DDL is effectively generated from the model, so you are building the database schema in Python instead of writing raw SQL manually in every place.

---

## 9) How frontend and backend connect in this project

This is the most important concept for understanding the architecture.

### Request flow

1. User opens form in [apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx](../apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx)
2. Form field state is captured in React state
3. Code calls: `api.post(...)` or `api.put(...)`
4. The API client sends a request to backend URL like `/restaurant/categories`
5. FastAPI route catches request in [services/backend/src/modules/restaurant/router.py](../services/backend/src/modules/restaurant/router.py)
6. Pydantic schema validates request body
7. SQLAlchemy model is created
8. DB is committed
9. Response model is returned
10. Frontend updates screen

### Example URL mapping

- Frontend request: `/restaurant/categories`
- Backend route: `@router.post("/categories")`
- Router prefix: `@router = APIRouter(prefix="/restaurant")`

That is why one frontend URL maps to one backend route group.

---

## 10) What each language is doing here

### TypeScript in the frontend

TypeScript is responsible for:

- UI rendering
- form state
- user interaction
- API calls
- validation before submission
- list rendering and table updates

### Python in the backend

Python is responsible for:

- route definitions
- authentication and user access
- request validation
- business rules
- database queries
- CRUD operations

### SQLAlchemy model layer

This layer is responsible for:

- mapping models to database tables
- query generation
- ORM object handling
- relationships between connected entities

### SQL / DDL

SQL and DDL are responsible for:

- actual table creation
- primary keys
- foreign keys
- indexes
- constraints

### Tailwind / CSS

Tailwind is responsible for:

- layout
- spacing
- colors
- buttons
- modal forms
- cards
- tables

---

## 11) The real developer pattern to follow when creating a new form

When you build a new form, follow this sequence.

### Step 1: define the database model

Create the entity in the backend model layer.

Example concept:

```python
class MenuCategory(BigIntTenantBaseModel):
    __tablename__ = "menu_categories"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)
```

This defines the database structure.

### Step 2: define Pydantic schema

Create request and response schemas.

```python
class CategoryCreateSchema(BaseModel):
    name: str
    sort_order: int = 1
```

This defines how the frontend sends data and how the backend returns it.

### Step 3: define API routes

Create the CRUD endpoints in the router.

```python
@router.post("/categories")
async def create_category(...):
    ...
```

### Step 4: create frontend form state

In React, define the state object.

```tsx
const [categoryForm, setCategoryForm] = useState({
  name: "",
  sort_order: 1,
});
```

### Step 5: create API wrapper

Use a reusable API file or function.

```ts
await api.post("/restaurant/categories", categoryForm)
```

### Step 6: connect button and submit logic

On submit, call the API and refresh the list.

```tsx
await api.post("/restaurant/categories", categoryForm);
refreshData();
```

### Step 7: render table and form

Show data from backend in the table, and allow edit/delete actions.

---

## 12) How to build this type of form from scratch

If you want to create a new form like category management, the recommended pattern is:

### Backend first

- Create DB model
- Create schema
- Create router endpoints
- Validate behavior with tests

### Frontend second

- Create form UI
- Connect API calls
- Update list and state
- Add edit and delete actions

### Then polish

- Add loading states
- Add validation errors
- Add toast notifications
- Add search/filter
- Add permission checks

---

## 13) Typical CRUD pattern used in this project

This repo follows a common CRUD design.

### Read

```ts
const res = await api.get("/restaurant/categories");
```

```python
result = await db.execute(select(MenuCategory))
```

### Create

```ts
await api.post("/restaurant/categories", formData)
```

```python
category = MenuCategory(...)
db.add(category)
await db.commit()
```

### Update

```ts
await api.put(`/restaurant/categories/${id}`, formData)
```

```python
category = result.scalar_one_or_none()
category.name = body.name
await db.commit()
```

### Delete

```ts
await api.delete(`/restaurant/categories/${id}`)
```

```python
category.is_deleted = True
await db.commit()
```

This is a soft-delete pattern, which is common in this project.

---

## 14) Important patterns to understand in this repo

### A. Soft delete

The app often does soft deletes instead of hard deletes.

```python
category.is_deleted = True
```

This means the record is not physically removed from the database. It is hidden from normal queries.

### B. Tenant-aware data

The models use tenant fields such as `tenant_id` and often `branch_id`.

This is essential in multi-tenant systems.

### C. Response model translation

Backend returns a schema model, not raw SQLAlchemy objects.

```python
return CategoryResponseSchema.model_validate(category)
```

This keeps responses consistent and safe.

### D. API-client abstraction

Frontend apps do not call raw fetch everywhere. They use the shared API layer.

### E. Route prefixing

The app groups resources by domain such as `/restaurant`, `/auth`, `/masters`.

This is important when you create a new module.

---

## 15) Example: building a category form from basic idea to working feature

Here is a simple development flow.

### Goal

Create a category management form with these fields:

- category name
- icon
- order / sort position
- optional branch / company association

### Step 1 - create DB model

```python
class MenuCategory(BigIntTenantBaseModel):
    __tablename__ = "menu_categories"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)
```

### Step 2 - create schema

```python
class CategoryCreateSchema(BaseModel):
    name: str
    icon: str | None = None
    slug: str | None = None
    sort_order: int = 1
```

### Step 3 - create route

```python
@router.post("/categories")
async def create_category(body: CategoryCreateSchema, db: AsyncSession = Depends(get_db_session)):
    category = MenuCategory(
        name=body.name,
        icon=body.icon,
        slug=body.slug or body.name.lower().replace(" ", "-"),
        sort_order=body.sort_order,
    )
    db.add(category)
    await db.commit()
    return {"message": "Category created"}
```

### Step 4 - frontend form

```tsx
const [form, setForm] = useState({
  name: "",
  icon: "🍛",
  sort_order: 1,
});
```

### Step 5 - submit button

```tsx
const handleSubmit = async () => {
  await api.post("/restaurant/categories", form);
  refreshData();
};
```

### Step 6 - display list

```tsx
{categories.map((cat) => (
  <div key={cat.id}>
    {cat.icon} {cat.name}
  </div>
))}
```

This is the exact pattern used across this repo.

---

## 16) Frontend form best practices used in this project

Here are the patterns to follow:

- use local state for form values
- use clear naming such as `categoryForm`
- separate read and write logic
- keep API calls in dedicated modules when possible
- use toast messages for success and failure
- refresh data after create/update/delete
- use consistent object shape for API payloads
- avoid mixing database logic into UI components

---

## 17) Backend best practices used in this project

- validate request input before touching DB
- use SQLAlchemy models for persistence
- use `async` DB sessions for async API routes
- use response schemas for safe output
- use explicit exceptions for not-found and server failures
- keep tenant and branch logic consistent
- prefer soft delete over hard delete for business records

---

## 18) Common mistakes beginners make

Here are the most common errors when making forms in this project.

### 1. Sending wrong field names

The frontend may send `sortOrder` while the backend expects `sort_order`.

### 2. Forgetting schema validation

If the schema is not defined, the backend may accept invalid data.

### 3. Missing `await` on async database calls

This causes unpredictable behavior in FastAPI routes.

### 4. Not refreshing UI after create/update/delete

The form may appear to work but the list does not update.

### 5. Hard-coding tenant or branch values

This creates wrong data assignment in multi-tenant systems.

### 6. Not checking permissions

Some routes depend on `current_user` and tenant IDs.

### 7. Returning raw ORM objects

Always convert to schema response objects before returning to frontend.

---

## 19) Recommended folder pattern for future modules

When creating a new form/module, a good pattern is:

- Frontend
  - page component under app module
  - API file under module api folder
  - types or schema file if needed
- Backend
  - model under module models
  - schema under module schemas
  - route under module router
  - optional service/repository layer

Example pattern:

- [apps/admin-web/src/modules/settings/pages](../apps/admin-web/src/modules/settings/pages)
- [apps/admin-web/src/modules/pos/api](../apps/admin-web/src/modules/pos/api)
- [services/backend/src/modules/restaurant](../services/backend/src/modules/restaurant)

---

## 20) Practical next steps for you

If you want to create more forms like this, use this checklist.

### For any new form:

1. Define the DB table/model.
2. Add the schema.
3. Add FastAPI route.
4. Test the backend in Python.
5. Add frontend form state.
6. Connect API calls.
7. Add validation and success/error messages.
8. Refresh list after save.
9. Add edit and delete flow.
10. Test end-to-end.

---

## 21) Summary

The category form is a complete example of how the project works:

- the frontend uses React state and API calls
- the backend uses FastAPI + Pydantic + SQLAlchemy
- the database uses ORM models that become real tables
- the connection is built by a clear flow of request and response objects

If you understand this category example, you can build almost any CRUD form in this project.

The most important idea is this:

A full-stack form is not just a UI. It is a flow across layers:

UI -> API -> schema -> model -> database -> response -> UI refresh.

Once you understand this pattern, building modules becomes much easier and much more predictable.

---

## 22) Useful links in this repository

- [apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx](../apps/admin-web/src/modules/settings/pages/MasterStudioPage.tsx)
- [apps/admin-web/src/modules/pos/api/categories.api.ts](../apps/admin-web/src/modules/pos/api/categories.api.ts)
- [services/backend/src/modules/restaurant/router.py](../services/backend/src/modules/restaurant/router.py)
- [services/backend/src/modules/restaurant/models.py](../services/backend/src/modules/restaurant/models.py)
- [services/backend/src/modules/restaurant/schemas.py](../services/backend/src/modules/restaurant/schemas.py)
- [package.json](../package.json)
- [apps/admin-web/package.json](../apps/admin-web/package.json)
- [README.md](../README.md)

This is the project map for building forms in this repo.
