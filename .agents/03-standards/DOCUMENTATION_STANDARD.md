# Documentation Standard

> **Last Reviewed**: August 2026

This standard governs all documentation within the `.agents/` AI-context directory for **The ssrone**. It ensures documentation remains accurate, canonical, and drift-free.

---

## 1. Governance Laws

### Rule 1: One Topic, One File
- Never create duplicate or parallel documents covering the same architectural area.
- Before writing any new document, search `.agents/` to verify if a document on the topic already exists.
- If a document exists, **edit the existing file**. Do NOT create a new file with a prefix or date suffix "to be safe".

### Rule 2: No Product-Name Filename Prefixes
- File names MUST NOT include product or repository prefixes (such as `THEssrone_` or `SSR_ONE_AI_`).
- The directory hierarchy (e.g. `.agents/02-architecture/ARCHITECTURE.md`) provides full contextual scope.

### Rule 3: Uniform Product Name in Prose
- All documentation prose MUST refer to the product as **The ssrone** (or **The ssrone ERP**).
- Literal technical identifiers (e.g. `ssr_one_ai`, `admin-web`, `services/backend`) are reserved exclusively for referencing exact filesystem paths, code packages, or repository names.

### Rule 4: Structural Folder Layout & Numbering
- Folder numbers (`01-foundation/`, `02-architecture/`, etc.) define top-level categories.
- Individual files inside categories MUST NOT be prefixed with arbitrary numbers (e.g., use `VISION.md`, not `01_VISION.md`).

### Rule 5: Separation of Standards vs Tasks
- **Standards** (`03-standards/`, `02-architecture/`) are stable, long-term rules.
- **Tasks** (`09-tasks/`) are living TODO lists that change daily. Never mix task lists into standards documents.

### Rule 6: Mandatory Last-Reviewed Stamp
- Every document in `.agents/` MUST include a one-line review stamp at the very top:
  `> **Last Reviewed**: [Month Year]`

### Rule 7: AI Entry Point Charter
- AI coding assistants and developers MUST read `.agents/AGENTS.md` first as the single entry point index before adding or modifying codebase features or documentation.

---

## 2. Directory Structure

```
.agents/
├── AGENTS.md                          # Entry point index linking to all canonical files
├── DO_NOT.md                          # Comprehensive anti-pattern & audit checklist
├── 01-foundation/                     # Vision, PRDs, Tech Stack & Feature Matrix
├── 02-architecture/                   # Architecture, ADRs, Frontend, Backend & Multi-tenancy
├── 03-standards/                      # Coding, API, DB, Security & Documentation Standards
├── 04-design/                         # Design Tokens, UI Patterns & Navigation
├── 05-quality/                        # Definition of Done & Code Review Checklist
├── 06-governance/                     # Change & Release Management
├── 07-modules/                        # Domain Specifications (CRM, PMS, POS)
├── 08-ai-rules/                       # Machine-readable & AI Development Rules
├── 09-tasks/                          # Active Living Tasks & Routing TODOs
└── archive/                           # Historical One-off Prompts & Audit Reports
```
