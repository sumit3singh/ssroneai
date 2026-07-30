import urllib.request

try:
    res = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/restaurant/categories")
    print("CATEGORIES OK:", res.read().decode())
except Exception as e:
    if hasattr(e, 'read'):
        print("ERROR BODY:", e.read().decode())
    else:
        print("ERROR:", e)
