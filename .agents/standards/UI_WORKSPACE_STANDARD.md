# The Baithak — UI Workspace Standard
**Version:** 1.0  
**Status:** Frozen  

Every module workspace (POS, PMS, PG, CRM, HRMS, etc.) developed for **The Baithak** must conform to this visual and behavioral layout. Developers are prohibited from coding custom layouts outside this structure.

---

## 1. Unified Grid Layout Sections

```
+-----------------------------------------------------------------------+
|  1. Workspace Header                                                  |
+-----------------------------------------------------------------------+
|  2. Global Command Bar (Ctrl + K Search)                              |
+-----------------------------------------------------------------------+
|  3. KPI Card Row (4 - 6 key metrics)                                  |
+-----------------------------------------------------------------------+
|  4. Quick Actions Toolbar                                             |
+-----------------------------------------------------------------------+
|  5. AI Insights & Alerts   | 6. Radial Overview   | 7. Activity Log   |
+----------------------------+----------------------+-------------------+
|  8. Main Data Grid (Ledger and Action dropdowns)                      |
+-----------------------------------------------------------------------+
```

---

## 2. Grid Section Specifications

### 2.1 Section 1: Workspace Header
- **Contents**: Module name, active outlet selector, breadcrumbs, sync status indicator, system time, and logged-in user profile.
- **Rule**: Must adjust dynamically between Light Mode and Dark Mode.

### 2.2 Section 2: Global Command Bar (`Ctrl+K`)
- **Interaction**: Pressing `Ctrl + K` or `/` focuses a floating command search dialog.
- **Search Scope**: Search queries must match categories, forms, resident records, items, room numbers, and reports instantly.

### 2.3 Section 3: KPI Card Row
- **Density**: Strictly 4 to 6 high-density cards.
- **Details**: Every card must display a metric label, the current value in large font, a comparison percentage (e.g. `+12.4% vs last month`), and a color-coded icon wrapper.

### 2.4 Section 4: Quick Actions Toolbar
- **Purpose**: Buttons providing single-click routing to primary transactional modals (e.g. `+ Add Resident`, `+ Bed Shift`, `+ Collect Payment`).
- **Styling**: Standard borders, subtle transition hover scales.

### 2.5 Section 5: AI Insights & Alerts
- **Details**: Red, yellow, and blue alert banners summarizing overdue rent payments, expiring agreements, or performance drops.
- **Rule**: Hardcoded alert thresholds are prohibited; alerts must be derived from database rules.

### 2.6 Section 6: Radial Overview Chart
- **Contents**: A circular SVG progress indicator (e.g. Occupancy Overview showing occupied beds vs vacant beds).

### 2.7 Section 7: Activity Timeline Stream
- **Purpose**: Renders recent audit actions in a chronological vertical timeline.
- **Details**: Lists action types (Create, Update, Receipt, Settle), author, target resource, and time stamp (e.g., `2 mins ago`).

### 2.8 Section 8: Main Data Grid
- **Details**: High-density responsive tables with pagination, sorting headers, state badges (Paid, Overdue, Active), and inline action buttons.
