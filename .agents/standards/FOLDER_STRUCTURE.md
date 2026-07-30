# BAITHAK ERP – Folder & Naming Rules (FOLDER_STRUCTURE.md)

## Rules
- All directory and file names MUST use `kebab-case` (`menu-items/`, `payment-modes/`, `pos-billing/`).
- Never use camelCase or PascalCase for folder names.
- Never use standalone singletons (`types.ts`, `hooks.ts`, `permissions.ts`) at module root; export from subdirectories.
