# SSR One AI — API Versioning & Lifecycle Governance Guide

> **Last Reviewed**: August 2026

This document defines mandatory standards for API endpoint URI versioning, backward compatibility, deprecation headers, and client upgrade strategies across SSR One AI microservices.

---

## 1. URI Scheme & Versioning Strategy

All FastAPI microservice endpoints follow explicit URL prefixing:

```http
https://api.ssrone.ai/api/v1/{module}/{resource}
```

### Versioning Rules:
1. **Frozen API Policy**: `/api/v1/` is strictly frozen once any active production customer depends on it.
2. **Major Version Bump (`/api/v2`)**: Triggered ONLY when introducing breaking changes (e.g., field type changes, mandatory request body fields added, endpoint URL removals).
3. **Minor Updates (`/api/v1`)**: Non-breaking changes (e.g., adding optional response fields, adding optional query parameters) remain within `/api/v1`.
4. **Deprecation Window**: Every `/api/v1` endpoint subject to breaking revisions must maintain a **6-month (180 days)** migration window before total sunset.

---

## 2. Standard HTTP Deprecation & Sunset Headers

When an endpoint or API version is marked for retirement, the response MUST include standard RFC 8594 headers:

```http
HTTP/1.1 200 OK
Deprecation: @1785542400
Sunset: Wed, 01 Mar 2027 00:00:00 GMT
Link: <https://docs.ssrone.ai/api/v2-migration>; rel="successor-version"
X-API-Deprecated: true
```

---

## 3. Database Schema & Migration Backward Compatibility

1. **Non-destructive Alembic Migrations**: Column deletions or renames must be executed in 2 phases:
   - **Phase A**: Add new column alongside old column with double-write trigger or service-layer sync.
   - **Phase B**: Drop old column after all clients upgrade to `/api/v2`.
2. **PostgreSQL RLS Isolation**: `tenant_id` and `branch_id` filtering remains mandatory across all API versions without exception.

---

## 4. Shared SDK Compatibility (`@ssrone/api-client`)

The monorepo `@ssrone/api-client` package maintains runtime backward compatibility helpers:

```typescript
import { apiClient } from "@ssrone/api-client";

// Automatic API version fallback request configuration
export const fetchV1OrV2 = async <T>(v1Path: string, v2Path: string): Promise<T> => {
  try {
    return await apiClient.get<T>(v2Path).then(r => r.data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      return await apiClient.get<T>(v1Path).then(r => r.data);
    }
    throw err;
  }
};
```
