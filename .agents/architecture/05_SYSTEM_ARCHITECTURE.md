# The Baithak — System Architecture Document
**Version:** 1.0  
**Status:** Approved  

---

## 1. Stack Allocation
The Baithak platform is split into a service-oriented monorepo ecosystem.

```
                  [ Frontend (React + Vite) ]
                               │
                       (REST & WebSockets)
                               │
               [ Backend (FastAPI + SQLAlchemy) ]
              /        /       │        \      \
   [ PostgreSQL ] [ Redis ] [ Celery ] [ OpenAI ] [ IoT Gateway ]
```

---

## 2. Component Specifications

### 2.1 Frontend (Admin Web & Client Portal)
- **Engine**: React 18, Vite bundler.
- **Routing & State**: TanStack Router for route isolation, TanStack Query for server-cache synchronizations, and Zustand/Zustand-persist for local state management.
- **Styling**: Tailwind CSS based on CSS custom properties. Absolutely no hardcoded color codes in styles.

### 2.2 Backend (Core API)
- **Framework**: Python 3.11+, FastAPI.
- **ORM & Driver**: SQLAlchemy 2.0 with `asyncpg` async PostgreSQL driver.
- **Logging**: JSON structured logging middleware.

### 2.3 Caching & Pub-Sub (Redis)
- **Session Caching**: User permissions and tenant configuration metadata.
- **Event Bus**: Redis channel for broadcasting real-time KDS state updates via websockets.

### 2.4 Database (PostgreSQL)
- **Version**: PostgreSQL 15+.
- **Isolation**: Row-Level Security (RLS) policies on all tables containing `tenant_id`.

### 2.5 AI & Command Parsing
- **Local Parsing**: Regex, acronym mapping, and token-overlap fuzzy matchers.
- **Deep Parsing**: FastAPI endpoint forwarding to LLM models for complex verbal prompts.
