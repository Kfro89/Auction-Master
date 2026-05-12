from bs4 import BeautifulSoup
import re

with open("ps_search.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

print("Find using CSS selector:")
auction_links = soup.select('a[href*="/sms/all,co/auction/view?auc="]')
print("Count:", len(auction_links))

if len(auction_links) == 0:
    print("Let's try finding all 'a' tags with 'auc='")
    all_a = soup.find_all("a", href=re.compile(r"auc=\d+"))
    print("Regex 'auc=\\d+' count:", len(all_a))
    if len(all_a) > 0:
        print("Example href:", all_a[0].get("href"))
