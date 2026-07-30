# The Baithak — DevOps Standards
**Version:** 1.0  
**Status:** Approved  

---

## 1. Containerization
- **Backend**: Containerized using multi-stage Dockerfiles leveraging lightweight Alpine or slim Debian python images.
- **Frontend**: Vite assets are built and served using highly optimized Nginx containers.

---

## 2. Infrastructure & Monitoring
- **Health Checks**: Containers must include a `/health` endpoint query resolving status.
- **Logs**: Standard stdout output in structured JSON formats, collected into centralized log managers.

---

## 3. Disaster Recovery (DR)
- **Database Backup**: Automated backups executed hourly.
- **Recovery Metrics**:
  - **RTO (Recovery Time Objective)**: `< 2 hours` to restore core API functionality.
  - **RPO (Recovery Point Objective)**: `< 1 hour` of data loss maximum.
