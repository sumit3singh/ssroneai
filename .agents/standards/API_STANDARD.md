# BAITHAK ERP – API Standard (API_STANDARD.md)

## RESTful Endpoint Contracts
- Base URL: `/api/v1`
- Method conventions: `GET` (fetch), `POST` (create), `PUT` (full update), `PATCH` (partial update), `DELETE` (soft delete).
- Standard Response Wrapper: All responses return strongly-typed JSON data models.
- Errors: Always return structured JSON error payloads with `error`, `message`, and `detail`.
