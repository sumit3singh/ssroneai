# Lesson 21: The Lead Architect's Universal Debugging & Incident Response Guide

> **Architecture Pillar**: Production Diagnostics, Root Cause Analysis (RCA) & High-Availability Incident Playbooks  
> **Repository Path**: Monorepo-wide diagnostic protocols across `apps/`, `services/backend/`, and `packages/`  
> **Prerequisites**: Lessons 01–20

---

## 1. What It Is (Simple Explanation + Analogy)

As the Lead Software Architect and Main Developer of **The ssrone (SSR INFINITY)**, you are the ultimate technical authority. When a cash register freezes on a Friday night, when a chef shouts that the kitchen screen stopped updating, or when a database connection pool runs out of slots, you do not panic or guess. You diagnose systematically.

### The Real-Life Analogy
Think of this guide as a **Level-1 Trauma Center Surgeon's Handbook**:
* A panicked intern says: *"The patient is dying!"*
* The senior surgeon checks: **Airway, Breathing, Circulation (A-B-C)**.
* In our software architecture:
  * **Airway (Network / Gateway)**: Are DNS, SSL, and Nginx passing packets?
  * **Breathing (FastAPI / Event Loop)**: Is the Python asyncio loop responsive, or is a synchronous task choking the thread?
  * **Circulation (Database Pool & Redis)**: Are PostgreSQL connections exhausted? Is Redis queueing Celery jobs?

```
┌────────────────────────────────────────────────────────────────┐
│           Architectural Incident Triage Hierarchy             │
└───────────────────────────────┬────────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       ┌────────────────────┐        ┌────────────────────┐
       │  Frontend Issues   │        │   Backend Issues   │
       ├────────────────────┤        ├────────────────────┤
       │ • Vite Dedupe      │        │ • Event Loop Block │
       │ • Hydration Crash  │        │ • Pool Exhaustion  │
       │ • Dexie Schema War │        │ • N+1 Cascades     │
       │ • CORS / 401 Auth  │        │ • Async Deadlocks  │
       └────────────────────┘        └────────────────────┘
```

---

## 2. Category 1: Frontend & POS Runtime Breakages

### Symptom 1: "Invalid hook call. Hooks can only be called inside the body of a function component"
* **Where It Strikes**: Happens right after installing a new package in `packages/ui` or importing shared hooks into `admin-web`.
* **Root Cause**: **Duplicate React Instance in Monorepo**. Node/pnpm resolved two different copies of `react` (one in `apps/admin-web/node_modules/react` and another in `node_modules/react`). React strictly forbids having two runtime dispatcher singletons in memory simultaneously.
* **The Diagnostic Command**:
  ```bash
  pnpm why react --recursive
  ```
* **The Lead Architect Fix**:
  Add `resolve.dedupe` in `apps/admin-web/vite.config.ts`:
  ```typescript
  // apps/admin-web/vite.config.ts
  export default defineConfig({
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
  ```

---

### Symptom 2: Dexie.js `DatabaseClosedError` or Schema Upgrade Lock
* **Where It Strikes**: Cashier loads the POS terminal, and the console throws: `Uncaught (in promise) Error: Database has been closed`.
* **Root Cause**: You changed an IndexedDB table schema in `offline-store.ts` (e.g., added an index `++id, branchId, synced`) without bumping the version number (`offlineDB.version(2)`), or two open browser tabs are battling over different versions of the IndexedDB database.
* **The Lead Architect Fix**:
  1. Always bump the schema version explicitly:
     ```typescript
     // shared/utils/offline-store.ts
     this.version(3).stores({
       offlineOrders: "++id, localId, branchId, synced, inFlight, createdAt",
     });
     ```
  2. Add an automated disaster recovery handler:
     ```typescript
     offlineDB.on("blocked", () => {
       logger.warn("Dexie upgrade blocked by another tab. Reloading...");
       window.location.reload();
     });
     ```

---

### Symptom 3: CORS Rejection on Custom Tenant Domains
* **Where It Strikes**: Customer food web loads, but all API requests fail with `CORS policy: No 'Access-Control-Allow-Origin' header is present`.
* **Root Cause**: The tenant's custom domain (e.g., `baithak.ssrit.online`) is not covered by the backend's allowed CORS origins regex in `services/backend/src/main.py`.
* **The Lead Architect Fix**:
  Verify both `services/backend/src/main.py` and `packages/api-client/src/index.ts`:
  ```python
  # services/backend/src/main.py
  app.add_middleware(
      CORSMiddleware,
      allow_origin_regex=r"https?://(localhost|.*\.ssrit\.online|.*\.onrender\.com|.*\.railway\.app)(:\d+)?",
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

## 3. Category 2: Backend Asyncio & Database Bottlenecks

### Symptom 1: "QueuePool limit of size 20 overflow 10 reached, connection timed out"
* **Where It Strikes**: High-traffic dinner rush. All API endpoints start timing out with HTTP 500 errors after 30 seconds of hanging.
* **Root Cause**: **AsyncSession Connection Leak**. Somewhere in the backend code, an engineer created an `AsyncSession` without using `async with AsyncSessionLocal() as session:`, or an exception occurred before `session.close()` was executed. The connections remained checked out forever until the pool of 30 was completely exhausted.
* **The Diagnostic SQL Command** (Run directly in Neon/Postgres console):
  ```sql
  -- Find all open connection states
  SELECT pid, state, query_start, age(now(), query_start), query 
  FROM pg_stat_activity 
  WHERE datname = 'ssrone' AND state != 'idle' 
  ORDER BY query_start ASC;
  ```
* **The Lead Architect Fix**:
  1. Never instantiate bare sessions manually. Always use context managers or FastAPI dependencies:
     ```python
     # CORRECT: Automatically returns connection to pool even on crash
     async with AsyncSessionLocal() as session:
         result = await session.execute(...)
     ```
  2. Enable PgBouncer connection pooling mode using the `-pooler` connection string in `DATABASE_URL`.

---

### Symptom 2: The Silent Event Loop Freeze (WeasyPrint / Tesseract Hang)
* **Where It Strikes**: The CPU usage of Uvicorn spikes to 100%, and ALL concurrent requests freeze for 3 seconds.
* **Root Cause**: An engineer called a synchronous, CPU-intensive C-extension (like `pytesseract.image_to_string` or `HTML().write_pdf()`) directly inside an `async def` route. Because Python's asyncio event loop runs on a **single OS thread**, running synchronous CPU work starves every other coroutine in the entire server.
* **The Lead Architect Fix**:
  Wrap the synchronous function call in `asyncio.to_thread()` or offload to Celery:
  ```python
  # INCORRECT (Freezes server):
  text = pytesseract.image_to_string(img)

  # CORRECT (Runs in background worker thread, loop stays 100% free):
  text = await asyncio.to_thread(pytesseract.image_to_string, img)
  ```

---

### Symptom 3: The N+1 ORM Query Explosion
* **Where It Strikes**: An endpoint like `/api/v1/orders` takes 1,800ms to return 50 orders.
* **Root Cause**: The route iterates over orders and accesses `order.items`. SQLAlchemy is forced to make 51 separate SQL queries to PostgreSQL: 1 query to fetch the 50 orders, and 50 individual queries to fetch items for each order.
* **The Lead Architect Fix**:
  Use `selectinload` to fetch all related records in exactly **2 queries**:
  ```python
  # File: services/backend/src/modules/orders/router.py
  stmt = (
      select(Order)
      .options(selectinload(Order.items)) # Eagerly loads items in ONE extra query
      .where(Order.tenant_id == tenant_id)
      .limit(50)
  )
  ```

---

## 4. The Lead Architect's Diagnostic Tool Arsenal

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    LEAD ARCHITECT COMMAND-LINE ARSENAL                           ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ 1. CHECK MONOREPO DEPENDENCY CONFLICTS:                                          ║
║    pnpm why react --recursive                                                    ║
║    pnpm why @tanstack/react-query --recursive                                    ║
║                                                                                  ║
║ 2. PROFILE CONTAINER RESOURCE USAGE:                                             ║
║    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" ║
║                                                                                  ║
║ 3. INSPECT POSTGRESQL LOCKS & DEADLOCKS:                                         ║
║    SELECT blocked_locks.pid     AS blocked_pid,                                  ║
║           blocking_locks.pid    AS blocking_pid,                                 ║
║           blocked_activity.query AS blocked_statement                            ║
║    FROM  pg_catalog.pg_locks         blocked_locks                               ║
║    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid ║
║    JOIN pg_catalog.pg_locks         blocking_locks                               ║
║    ON blocking_locks.locktype = blocked_locks.locktype AND blocking_locks.database = blocked_locks.database; ║
║                                                                                  ║
║ 4. INSPECT REDIS CELERY QUEUE SIZES:                                             ║
║    docker exec -it ssrone-redis redis-cli llen notifications                     ║
║    docker exec -it ssrone-redis redis-cli llen exports                           ║
║    docker exec -it ssrone-redis redis-cli llen ai                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 5. Production Incident Response Playbooks

### Playbook 1: Severity 1 (S1) — Cashier POS Outage
* **Definition**: Cashiers cannot complete orders or the terminal displays a blank white screen.
* **Immediate Action Checklist**:
  1. **Check Local Offline Mode**: Ask cashier: *"Does the top bar show OFFLINE?"* If yes, inform them to keep taking orders—Dexie.js is saving them locally.
  2. **Inspect Backend Health**: Run `curl -I https://ssrone-backend.onrender.com/health`.
     * If 502/503: Container crashed. Check Docker logs: `docker logs ssrone-backend --tail 100`.
     * If 200 OK: Issue is frontend-specific. Open Chrome DevTools ➡️ Console ➡️ Look for Red Exception.
  3. **Check PostgreSQL Connections**: If logs show `PoolTimeout`, restart the backend service or kill idle connections in PostgreSQL.

---

### Playbook 2: Severity 2 (S2) — KDS Kitchen Screen Disconnected
* **Definition**: Chefs report that new orders are placed at the counter, but the KDS screen is not chiming or displaying tickets.
* **Immediate Action Checklist**:
  1. Open browser DevTools on the KDS iPad/screen.
  2. Inspect the **Network tab ➡️ WS (WebSockets)** filter:
     * Status `101 Switching Protocols`: WebSocket is connected. Verify `branch_id` matches the cashier's terminal.
     * Status `Failed / 403`: Auth token expired. Refresh page to re-authenticate.
  3. Tell the chef to tap the manual **"Refresh Tickets"** button—this falls back to HTTP REST API query (`useQuery(['kds-tickets'])`).

---

## 6. Self-Test (Active Recall & Feynman Technique)

### Active Recall Questions
1. Why does running `pnpm why react --recursive` help diagnose an "Invalid hook call" error in a monorepo?
2. What is the fundamental difference between an async connection leak and a database deadlock?
3. How does executing synchronous C-libraries (like WeasyPrint or Tesseract) inside an `async def` route cause every other user on the server to experience high latency?
4. What SQL query reveals queries that are currently locking tables and blocking other transactions in PostgreSQL?
5. How does the POS offline-first architecture act as an automatic insurance policy during an S1 backend outage?

### Feynman Explanations
1. **Explain the N+1 Problem to a Junior Developer**: Use an analogy of going to the supermarket 50 times to buy 50 individual groceries instead of buying all 50 items in a single shopping cart.
2. **Explain Connection Pool Exhaustion to a Restaurant Owner**: Use an analogy of a bank with 20 teller windows where 20 customers fall asleep at the counter, preventing 200 people in line from being served.

---

## 7. Architect's Cheat Sheet (One-Screen Reference)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║               SSR ONE AI — UNIVERSAL DEBUGGING ARCHITECT'S CHEAT SHEET           ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ 1. REACT MULTI-INSTANCE HOOK ERROR:                                              ║
║    • Fix: Add resolve: { dedupe: ['react', 'react-dom'] } in vite.config.ts      ║
║                                                                                  ║
║ 2. ASYNCIO EVENT LOOP FREEZE:                                                    ║
║    • Symptom: All routes hang simultaneously for 2-4 seconds                     ║
║    • Fix: Wrap sync C-libs in await asyncio.to_thread(sync_func)                 ║
║                                                                                  ║
║ 3. POSTGRESQL CONNECTION POOL TIMEOUT:                                           ║
║    • Symptom: QueuePool limit reached after high traffic                         ║
║    • Fix: Use async with AsyncSessionLocal() context managers                    ║
║    • Fix: Use PgBouncer pooler connection string (-pooler in Neon)               ║
║                                                                                  ║
║ 4. SLOW API QUERIES (N+1 CASCADE):                                              ║
║    • Fix: Add .options(selectinload(Parent.children)) to SQLAlchemy select       ║
║                                                                                  ║
║ 5. CORS REJECTIONS ON NEW DOMAINS:                                               ║
║    • Update allow_origin_regex in services/backend/src/main.py                   ║
║    • Update packages/api-client/src/index.ts baseURL resolver                    ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```
