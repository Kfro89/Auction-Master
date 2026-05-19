import re

with open('frontend/src/views/StoreView.tsx', 'r') as f:
    content = f.read()

content = content.replace('fetchData();', 'setTimeout(() => { fetchData(); }, 0);')

with open('frontend/src/views/StoreView.tsx', 'w') as f:
    f.write(content)
