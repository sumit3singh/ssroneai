# The Baithak — API Design Specification
**Version:** 1.0  
**Status:** Approved  

---

## 1. Global API Standards
- **Protocol**: HTTP/1.1 REST using JSON payloads. WebSockets for real-time KDS notifications.
- **Prefix**: All endpoints are prefixed with `/api/v1`.
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `X-Tenant-Slug: <tenant_slug>`

---

## 2. Authentication Flow

### 2.1 Login Endpoint
- **Path**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "tenant_slug": "baithak-demo",
    "email": "admin@baithak.com",
    "password": "Admin@123",
    "device_info": {}
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "expires_in": 3600
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "error": "tenant_not_found",
    "message": "Tenant not found or inactive."
  }
  ```

---

## 3. POS Operations Endpoints

### 3.1 Fetch Menu Items
- **Path**: `GET /api/v1/restaurant/menu-items`
- **Query Params**: `branch_id` (Integer)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "prod-cuh02-1",
      "name": "Veg Steam Momos",
      "category": "Veg.Momo's",
      "base_price": 60.0,
      "is_vegetarian": true,
      "variant_groups": [...],
      "addon_groups": [...]
    }
  ]
  ```

### 3.2 Create Order
- **Path**: `POST /api/v1/orders`
- **Request Body**:
  ```json
  {
    "branch_id": "CUH02",
    "order_type": "dine_in",
    "items": [
      {
        "product_id": "prod-cuh02-1",
        "product_name": "Veg Steam Momos (Half)",
        "quantity": 1,
        "unit_price": 60.0
      }
    ],
    "notes": "Sumit Singh"
  }
  ```
