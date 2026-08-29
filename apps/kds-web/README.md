# KDS Web (Kitchen Display System Kiosk)

> **Deployment Target**: Dedicated Kitchen Display Hardware & Touchscreen Kiosks.

---

## Justification for Dedicated Application

While the `@ssrone/pos` module inside `admin-web` includes integrated KDS views for POS operators, `apps/kds-web` is a standalone, lightweight web application specifically engineered and optimized for dedicated kitchen hardware displays (e.g., wall-mounted touchscreen monitors, industrial kitchen tablets, and physical bump bar input controllers).

### Key Architecture Features
1. **Standalone Kiosk Mode**: Runs without top-level ERP admin navigation overhead, maximized for full-screen display in high-heat, high-pace kitchen environments.
2. **Bump Bar & Touch Optimization**: Native key-binding support for physical kitchen bump bars (Order Bump, Recall, Station Filter) alongside large, high-contrast touch targets.
3. **Real-time Order Streaming**: Direct low-latency WebSocket connection to the backend Kitchen Display Engine (`services/backend/src/engines/pos`).
4. **Multi-Station Partitioning**: Station-filtered views (e.g., Grill, Fryer, Salad, Assembly) customizable per physical kitchen display terminal.
