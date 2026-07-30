import urllib.request
import json
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from src.modules.auth.service import auth_service

# Generate superadmin token
token = auth_service.create_access_token({"sub": "1", "tenant_id": 1, "role": "superadmin"})
headers = {"Authorization": f"Bearer {token}"}

req = urllib.request.Request("http://127.0.0.1:8000/api/v1/restaurant/categories", headers=headers)



try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    print("SUCCESS WITH AUTH HEADER!")
    print(f"Loaded {len(data)} categories from DB:")
    for cat in data:
        print(f"  - [{cat['id']}] {cat['name']} ({cat['icon']})")
except Exception as e:
    if hasattr(e, 'read'):
        print("ERROR BODY:", e.read().decode())
    else:
        print("ERROR:", e)
