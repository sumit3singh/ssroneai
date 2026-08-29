# Performance Optimization Standards

> **Last Reviewed**: August 2026

This document defines performance benchmarks, caching strategies, and bundle size constraints.

---

## 1. Performance Target Benchmarks

- **API Response Latency**: p95 < 100ms for read requests; p95 < 200ms for write mutations.
- **Frontend Frame Rate**: Smooth 60fps interaction during POS grid scrolling and table drags.
- **Initial Page Load**: Largest Contentful Paint (LCP) < 1.5s; First Input Delay (FID) < 100ms.

---

## 2. Optimization Rules

1. **Async DB Eager Loading**: Use `selectinload` or `joinedload` on SQLAlchemy queries to eliminate N+1 database queries.
2. **Frontend Code-Splitting**: Lazy load module pages using React `React.lazy` / TanStack Router route code-splitting.
3. **Redis Caching**: Cache static catalog data (Categories, Menu Items, Room Types) in Redis with automatic eviction on mutation.
