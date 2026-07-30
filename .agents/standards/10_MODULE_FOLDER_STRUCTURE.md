# Module Folder Structure – BAITHAK ERP Charter #10

## Universal Module Folder Anatomy
Every module under `src/modules/<module-name>` follows this exact structure:
```
<module-name>/
├── api/          # API client requests & endpoint hooks
├── components/   # Domain components & modals
├── dashboard/    # Module Dashboard view
├── master/       # Master forms & catalog pages
├── transaction/  # Operational billing & transaction pages
├── report/       # Reports & analytics views
├── settings/     # Module configuration page
├── hooks/        # Custom React hooks
├── types.ts      # TypeScript domain interfaces
└── <Module>Page.tsx # Master entry point
```
