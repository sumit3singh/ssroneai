# Performance Standards – BAITHAK ERP Charter #17

## High-Performance Guidelines
- **Build Target**: Vite production bundle built in under 30s.
- **Code Splitting**: Route-level dynamic `import()` for lazy chunking.
- **Virtualization**: React windowing for tables with > 500 records.
- **Memoization**: `useMemo` and `useCallback` on heavy filters and computed metrics.
