import urllib.request
import json
import sys, os

sys.path.insert(0, os.path.abspath("."))
from src.modules.auth.service import auth_service

token = auth_service.create_access_token({"sub": "1", "tenant_id": 1, "role": "super_admin"})

headers = {
    "Authorization": f"Bearer {token}",
    "X-Tenant-Slug": "baithak-demo",
}

for endpoint in ["/restaurant/categories", "/restaurant/menu-items"]:
    url = f"http://localhost:8000/api/v1{endpoint}"
    req = urllib.request.Request(url, headers=headers)
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode())
        print(f"SUCCESS {endpoint}: {len(data)} items returned!")
    except Exception as e:
        if hasattr(e, 'read'):
            print(f"ERROR {endpoint}:", e.read().decode())
        else:
            print(f"ERROR {endpoint}:", e)
