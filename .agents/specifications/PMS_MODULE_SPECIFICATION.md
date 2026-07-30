# The Baithak — PMS Module Specification
**Version:** 1.0  
**Status:** Approved  

---

## 1. PMS Workflow Overview
The Property Management System (PMS) handles room bookings, guest check-ins/check-outs, and housekeeping tasks.

```
 [Booking Request] ──► [Room Allocation Engine] ──► [Guest Check-In] 
                                                           │
                                                           ▼
 [Housekeeping Queue] ◄── [Checkout & Billing] ◄── [Guest Stays]
```

---

## 2. Integrated Database Tables
- **hotel_rooms**: Tracks room status, size, and category.
- **hotel_bookings**: Tracks booking dates, deposits, and status.
- **guests**: Tracks guest personal details and history.
- **room_charges**: Tracks stay costs and dining orders billed to room.

---

## 3. Module API Endpoints
- `GET /api/v1/hotel/rooms`: Get room availability grid.
- `POST /api/v1/hotel/bookings`: Create guest reservation.
- `PATCH /api/v1/hotel/bookings/{id}/check-in`: Process guest check-in.

---

## 4. Key Functional Features
- **Dynamic Booking Grid**: Visual occupancy calendar showing stay blocks.
- **Room Charge Routing**: Integrates with restaurant POS to route restaurant bills to guest room accounts.
