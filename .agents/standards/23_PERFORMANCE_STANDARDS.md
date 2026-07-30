# The Baithak — Performance Standards
**Version:** 1.0  
**Status:** Approved  

---

## 1. Latency & Response Thresholds
To ensure the ₹1000 Cr product performance standard, operations must meet these constraints under load:

| Operation Type | Target Latency (p95) | Maximum Allowable Latency (p99) |
| :--- | :--- | :--- |
| **POS search matching** | `< 10ms` | `< 50ms` |
| **API checkout response** | `< 100ms` | `< 300ms` |
| **Database query execution** | `< 15ms` | `< 50ms` |
| **Real-time KDS updates** | `< 50ms` | `< 150ms` |

---

## 2. database Query Guidelines
- Every SELECT query targeting tenant/branch data must resolve via index scan. Table scans are prohibited.
- Heavy aggregations (such as daily sales reports) must be pre-calculated in background task queues and served from caching views.

---

## 3. Frontend Bundle Budgets
- Combined Javascript bundle size must not exceed **500kB** (gzipped).
- All images and assets must be compressed and lazily loaded.
- Initial paint (FCP) must occur in less than **1.0 second**.
