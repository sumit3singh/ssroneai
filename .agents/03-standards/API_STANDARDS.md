# REST & WebSocket API Standards

> **Last Reviewed**: August 2026

This document defines REST API design conventions, HTTP status code usage, and WebSocket payload structures for **The ssrone**.

---

## 1. REST API Design Rules

1. **URL Prefixing**: All REST endpoints are prefixed with `/api/v1/<module_name>`.
2. **HTTP Verb Conventions**:
   - `GET`: Read resources (idempotent).
   - `POST`: Create new resources or execute state mutations (e.g. `/orders`, `/checkout`).
   - `PUT` / `PATCH`: Update existing resources.
   - `DELETE`: Soft-delete resources (`is_deleted = True`).
3. **Response Wrappers**:
   - Success: Return JSON object or paginated array (`{ items: [...], total: 100, page: 1, page_size: 20 }`).
   - Error: Return standardized JSON error payload (`{ error: "ErrorType", message: "Human message", detail: ... }`).

---

## 2. Standard HTTP Status Codes

- `200 OK`: Successful retrieval or update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or bad input payload.
- `401 Unauthorized`: Missing or expired JWT authentication token.
- `403 Forbidden`: Insufficient RBAC permissions or invalid tenant access.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unhandled server exception.
