# Error Handling & Exception Management Standard

> **Last Reviewed**: August 2026

This document specifies error logging, exception handling, and toast notification rules.

---

## 1. Principles

1. **No Silent Error Swallowing**: Empty catch blocks (`catch (e) {}` or `except: pass`) are strictly forbidden.
2. **Standardized Exception Format**: Backend exceptions return structured JSON payloads:
   ```json
   {
     "error": "ValidationError",
     "message": "Invalid item quantity provided",
     "detail": "Quantity must be greater than 0"
   }
   ```
3. **Frontend Toast Notifications**: Trigger Sonner `toast.error("Failed to complete action")` on API error failures.
