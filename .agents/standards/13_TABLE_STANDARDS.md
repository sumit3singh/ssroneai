# Table Standards – BAITHAK ERP Charter #13

## Data Table Guidelines
- Built-in search input, category filters, and active/inactive status toggles.
- Pagination / infinite scroll for large datasets.
- Safe array fallbacks (`(items || []).map(...)`) to prevent runtime crashes.
- Currency and date formatting using shared formatters (`formatCurrency`, `formatDate`).
