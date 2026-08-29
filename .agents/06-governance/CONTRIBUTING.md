# Contributing to SSR One AI

Thank you for contributing to SSR One AI. This document explains how to set up the repository, run tests, and submit improvements.

## Getting Started

1. Fork the repository.
2. Clone your fork.
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Branching

- Create feature branches from `develop`.
- Use descriptive branch names: `feature/<short-description>`, `bugfix/<short-description>`.

## Development

- Start the backend:
  ```bash
  cd services/backend
  pip install -r requirements.txt
  python -m uvicorn src.api.app.server:app --host 0.0.0.0 --port 8000
  ```

- Start a frontend app:
  ```bash
  pnpm --filter admin-web dev
  ```

## Testing

- Frontend unit and type-check:
  ```bash
  pnpm run lint
  pnpm run type-check
  ```

- Backend tests:
  ```bash
  cd services/backend
  pytest tests/unit/
  ```

## Standards

- Use the existing code style for TypeScript, Python, and Markdown.
- Keep package imports consistent with workspace package names.
- Update documentation for any structural changes.
