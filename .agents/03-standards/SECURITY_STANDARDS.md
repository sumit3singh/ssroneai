# Enterprise Security & Compliance Standards

> **Last Reviewed**: August 2026

This document specifies security protocols, authentication mechanics, and input sanitization requirements for **The ssrone**.

---

## 1. Security Architecture Rules

1. **Multi-Tenant Isolation**: Enforce Row-Level Security (RLS) on PostgreSQL. Never rely solely on client-side or application-layer tenant filters.
2. **JWT Token Management**: Access tokens expire after 15 minutes; refresh tokens are stored in HTTP-only, Secure, SameSite cookies.
3. **Password Hashing**: Passwords stored using `Argon2id` or `Bcrypt` with high work factors.
4. **Input Sanitization**: All user inputs sanitized to prevent SQL injection and Cross-Site Scripting (XSS).
5. **CORS Policy**: Explicit origins whitelist; wildcard (`*`) CORS headers are strictly prohibited in production deployments.
