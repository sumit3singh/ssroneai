# The Baithak — Security Standards
**Version:** 1.0  
**Status:** Approved  

---

## 1. Data Encryption Standards
- **In-Transit**: All API requests must force HTTPS with TLS 1.3 protocol.
- **At-Rest**: Critical columns (passwords, card credentials) must be hashed using bcrypt or AES-256 encryption.

---

## 2. Authentication & JWT Security
- Access tokens (JWT) must be short-lived (15 minutes).
- Refresh tokens must be stored in HTTP-only, secure, same-site cookies in the client browser, protecting the session from XSS/CSRF vectors.

---

## 3. CORS & Network Defense
- Cross-Origin Resource Sharing (CORS) must be restricted to verified origin domains.
- API routers must implement rate-limiting layers to prevent DDoS or scraping attempts.
