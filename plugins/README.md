# SSR One AI – Plugin Ecosystem Directory (`plugins/`)

## Architecture
The `plugins/` directory houses modular, hot-pluggable extensions that extend the core ERP capabilities without modifying the core codebase.

## Available Plugins
1. **`plugins/spa`**: Spa & Wellness Appointment Booking, Therapist Schedules, Treatment Rooms.
2. **`plugins/banquet`**: Event Hall Reservations, Wedding/Conference Catering, Layout Management.
3. **`plugins/laundry`**: Guest Laundry Tracking, Garment Tagging, Dry Cleaning Billing.
4. **`plugins/parking`**: Valet Parking, Vehicle Tracking, Automated Slot Allocation.
5. **`plugins/franchise`**: Multi-unit Franchise Management, Royalty Fee Reporting, Global Menu Pushes.

## Licensing & Entitlement
Plugins are dynamically enabled per tenant via Database Subscription Feature Flags (`platform/licensing`).
