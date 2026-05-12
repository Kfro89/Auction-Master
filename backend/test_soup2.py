from bs4 import BeautifulSoup
import re

with open("ps_search.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
auction_links = soup.select('a[href*="/sms/all,co/auction/view?auc="]')

seen_aucs = set()
count = 0
for link in auction_links:
    href = link.get("href", "")
    match = re.search(r"auc=(\d+)", href)
    if not match: continue
    auc_id = match.group(1)
    
    title = link.get("title", "").replace(f"#{auc_id} - ", "").strip()
    if not title:
        title = link.get_text(strip=True).replace(f"#{auc_id} - ", "").strip()
        print(f"ID: {auc_id}, TITLE: '{title}', isdigit: {title.isdigit()}")
        if not title or title.isdigit():
            # Sometimes the link is just the image wrapper or the ID
            print(f"Skipping {auc_id} due to bad title")
            continue
    
    if auc_id not in seen_aucs:
        seen_aucs.add(auc_id)
        count += 1
        print(f"Added {auc_id}: {title}")

print(f"Total valid: {count}")
