# Form Design Standards – BAITHAK ERP Charter #12

## Master & Transaction Form Rules
- **Creation & Edit**: Modal or slide-over dialogs with real-time validation.
- **Validation**: Schema-based validation using Zod / TypeScript schemas.
- **Submission**: Direct async POST/PUT requests to PostgreSQL REST endpoints.
- **Feedback**: Toast notifications (`sonner`) on clean save or error diagnostics.
