import sys
import json
import urllib.request
import urllib.parse

data = urllib.parse.urlencode({"username": "admin", "password": "password123"}).encode("utf-8")
req = urllib.request.Request("http://192.168.0.16:8000/api/auth/login", data=data)
try:
    with urllib.request.urlopen(req) as response:
        token = json.loads(response.read().decode())["access_token"]

    req2 = urllib.request.Request("http://192.168.0.16:8000/api/items/?limit=5000", method="GET")
    req2.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req2) as response:
        items = json.loads(response.read().decode())
        # Sort by ID descending
        items.sort(key=lambda x: x['id'], reverse=True)
        for item in items[:10]:
            print(f"Item {item['id']}: {item['title']}")
            print(f"Tags: {json.dumps(item.get('tags'), indent=2)}")
            print("-" * 40)
except Exception as e:
    print(e)
