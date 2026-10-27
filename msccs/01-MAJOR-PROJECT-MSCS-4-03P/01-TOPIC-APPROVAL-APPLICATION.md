# APPLICATION FOR APPROVAL OF MAJOR PROJECT TOPIC
### Course Code: MSCS-4-03P | Course: Major Project (M.Sc. Computer Science, Semester-IV)

**To:**  
The Course Coordinator,  
Department of Computer Science & Applications,  
Jagat Guru Nanak Dev Punjab State Open University (JGND PSOU),  
C/28, The Lower Mall, Patiala - 147001, Punjab.

---

### 1. Student Particulars

* **Name of the Student**: `Sumit Singh`
* **Roll Number / Enrollment No.**: `PSOU/MSCS/2026/042`
* **Program**: Master of Science in Computer Science — M.Sc. (CS)
* **Semester / Academic Cycle**: Semester-IV (Final Semester) / `July 2024 - 2026 Cycle`
* **Study Centre Code / Name**: `JGND PSOU Regional Centre, Patiala`
* **Mobile Number / Email**: `[Student Contact & Email]`

---

### 2. Project Proposal Details

* **Project Category**: Advanced Software Architecture / Distributed Systems / Cloud-Native SaaS
* **Nature of Project**: Individual Study Project
* **Proposed Title of Major Project**:  
  **"Design and Implementation of a High-Throughput, Offline-First, Multi-Tenant SaaS Enterprise POS Architecture with Integrated AI Copilot and Computer Vision OCR"**
* **Short Name / Codename**: SSR ONE AI (Enterprise Hospitality POS & ERP)

---

### 3. Brief Rationale and Motivation for the Selected Topic

Traditional Point of Sale (POS) and Enterprise Resource Planning (ERP) systems in high-volume retail and hospitality suffer from critical operational vulnerabilities:
1. **Network Fragility**: Pure cloud-hosted web applications freeze when internet connectivity fluctuates during peak operational rushes, causing severe business loss.
2. **Multi-Tenant Security Boundaries**: SaaS architectures often risk cross-tenant data leakage if logical boundaries are enforced solely at the application layer rather than at the database kernel.
3. **Hardware Latency Bottlenecks**: Synchronous database writes and printing commands introduce 2 to 4 seconds of cashier UI latency per ticket.

This project addresses these challenges by developing a novel **hybrid offline-first distributed architecture**. By pairing browser-level transactional storage (Dexie.js / IndexedDB) with an asynchronous event-driven backend (FastAPI / PostgreSQL 16 with Row-Level Security), the system achieves sub-millisecond perceived UI responsiveness ($< 0.5\text{ms}$), guarantees 100% operational billing uptime during network outages, and enforces strict tenant isolation at the database level. Furthermore, it integrates a multi-agent Generative AI Copilot and localized Tesseract OCR for automated supplier invoice scanning.

---

### 4. Proposed Technology Stack

* **Frontend**: React 19, TypeScript (Strict), Vite, TanStack Router, Zustand, Dexie.js (IndexedDB), Tailwind CSS.
* **Backend Services**: Python 3.11, FastAPI (ASGI Event Loop), Uvicorn, Pydantic V2, Celery, Redis.
* **Database & Security**: PostgreSQL 16, Row-Level Security (RLS), SQLAlchemy 2.0 AsyncIO, JWT with salted BCrypt hashing.
* **AI & Document Processing**: Tesseract OCR, Anthropic Claude & OpenAI API Adapters, WeasyPrint, OpenPyXL.
* **Containerization & CI/CD**: Docker, Docker Compose, Nginx, Turborepo monorepo management.

---

### 5. Undertaking by the Candidate

I hereby declare that this proposed major project represents original research and development. The work has not been previously submitted to this university or any other institution for the award of any degree, diploma, or fellowship. I undertake to submit the detailed Project Synopsis within 15 days of this topic approval and complete the final project report in accordance with university guidelines.

**Date**: `15/05/2026`  
**Place**: Patiala / `Patiala`  

**Signature of Candidate**: __________________________

---

### 6. For Official Use Only (JGND PSOU Course Coordinator / Department)

* **Status of Topic**: [ ] Approved  /  [ ] Approved with Modifications  /  [ ] Rejected
* **Assigned Academic Supervisor / Guide**: ___________________________________________
* **Remarks / Modifications Recommended**:  
  ____________________________________________________________________________________  
  ____________________________________________________________________________________  

**Signature of Course Coordinator**: __________________________  
**Date**: `15/05/2026`  
**Department Seal**:
