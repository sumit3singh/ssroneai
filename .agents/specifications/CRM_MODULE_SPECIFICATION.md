# The Baithak — CRM Module Specification
**Version:** 1.0  
**Status:** Approved  

---

## 1. CRM Workflow Overview
The CRM Module manages customer database profiles, loyalty program triggers, and spending insights.

```
 [Customer Search] ──► [Retrieve Profile Card] ──► [Evaluate Tier Level] 
                                                          │
                                                          ▼
 [Campaign / SMS] ◄── [Record Visit & Spend] ◄── [Process Loyalty Points]
```

---

## 2. Integrated Database Tables
- **customers**: Stores basic names, emails, and mobile numbers.
- **loyalty_logs**: Tracks point additions/deductions.
- **customer_groups**: Categorizes guests for target offers.

---

## 3. Module API Endpoints
- `GET /api/v1/crm/customers`: Search profiles by phone.
- `POST /api/v1/crm/customers`: Register new customer.
- `POST /api/v1/crm/loyalty/redeem`: Apply points to orders.

---

## 4. Key Functional Features
- **Tier Escalation Engine**: Automatically elevates loyalty tier (Bronze, Silver, Gold, Platinum) based on lifetime spend.
- **Preferences Analyzer**: Stores favorite menu items and last order details to assist cashiers in repeating common billing sequences.
