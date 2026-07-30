import urllib.request

try:
    req = urllib.request.Request('http://localhost:8000/api/v1/restaurant/categories')
    res = urllib.request.urlopen(req)
    print("SUCCESS:", res.read().decode())
except Exception as e:
    if hasattr(e, 'read'):
        print("ERROR BODY:", e.read().decode())
    else:
        print("ERROR:", e)
