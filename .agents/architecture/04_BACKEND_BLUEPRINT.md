# Backend Architecture Blueprint – BAITHAK ERP Charter #04

## 1. Stack & Controller Rules
- **Framework**: FastAPI (Python 3.11+).
- **ORM / Database**: SQLAlchemy 2.0 async / AsyncPG + Alembic migrations.
- **Validation**: Pydantic v2 schemas.
- **Security**: OAuth2 with Password Bearer flow + JWT.
