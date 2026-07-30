# BAITHAK ERP – Shared Engine Standard (ENGINE_STANDARD.md)

## Shared Platform Engines
Business modules MUST consume shared engines located under `shared/`:
- **Tax Engine**: Computes CGST/SGST/IGST tax rates.
- **Pricing Engine**: Resolves dish portion variant prices.
- **Audit Engine**: Records tenant, user, and payload audit entries.
- **Notification Engine**: Dispatches live KDS and system alerts.
