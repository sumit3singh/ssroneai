## Summary of Changes

Brief description of what this PR introduces or fixes.

## Pull Request Checklist

- [ ] Automated tests added or updated (`pnpm run typecheck`, `pytest`)
- [ ] Documentation updated in `.agents/` if architecture/routes changed
- [ ] Database migration reviewed for RLS / multi-tenancy rules (if applicable)
- [ ] `module.json` updated if new routes or permissions were added
- [ ] Zero duplicate implementations created; shared code placed in `@ssrone/*` packages

## Verification Checklist

- [ ] Tested locally on dev server (`pnpm dev`)
- [ ] Verified non-breaking changes across all monorepo apps
