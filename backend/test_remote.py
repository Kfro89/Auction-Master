import urllib.request
import urllib.parse
import json

data = urllib.parse.urlencode({"username": "admin", "password": "password123"}).encode("utf-8")
req = urllib.request.Request("http://192.168.0.16:8000/api/auth/login", data=data)
try:
    with urllib.request.urlopen(req) as response:
        token = json.loads(response.read().decode())["access_token"]

    req2 = urllib.request.Request("http://192.168.0.16:8000/api/admin/scrape/public-surplus", method="POST")
    req2.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req2) as response:
        print(response.read().decode())
except Exception as e:
    print(e)
