import asyncio
from bs4 import BeautifulSoup
import json
from datetime import datetime

html = """
    <div id="auctionListViewCurrent" class="w-100" >
        <table id="auctionTableView" class="ps-table table table-responsive-md ">
            <thead>
                <tr>
                    <th scope="col">Auction</th>
                    <th scope="col">Description</th>
                    <th scope="col">&nbsp;</th>
                    <th nowrap scope="col">Time Left</th>
                        <td class="show-auc-pct" style="display:none"></td>
                    <th scope="col">Current Price</th>
                    <th scope="col">Bid</th>
                    <th nowrap scope="col">Proxy Bid</th>
                    <th scope="col">Qty.</th>
                </tr>
            </thead>
            <tbody>
	<tr id="4005533currList">
		<td>4005533</td>
		<td class="text-start">
			<a href="/sms/auction/view?auc=4005533"> HP Z2 Mini G9 Workstation i7-12700 16GB RAM - Free Shipping!</a>
<img src="/sms/20240825/images/auction/winning.gif" title="Winning" alt="Winning" data-bs-toggle="tooltip" data-bs-custom-class="icon-tooltip" class="ms-2" style="" WIDTH="14" HEIGHT="13" />			&nbsp;
		</td>
		<td class="text-center">
    <a href="/sms/auction/ajaxpicloader?auctionId=4005533">
<i aria-hidden="true" class="bi bi-camera-fill " style="color: var(--ps-color-gray); "></i>    </a>

		</td>
		<td nowrap>
	<div id="timeLeft4005533currList" class="d-inline w-100 auction-time_left">
			<span id="timeLeftValue4005533currList" class="">
					2 days 10 hours
			</span>
	</div>
		</td>
			<td class="show-auc-pct" style="display:none"></td>
		<td id="val_4005533currList" class="text-end">$293.00&nbsp;</td>
		<td class="text-end">$293.00&nbsp;</td>
		<td class="text-end">$350.00&nbsp;</td>
		<td class="text-end">
			&nbsp;
		</td>
	</tr>
            </tbody>
        </table>
    </div>
"""

soup = BeautifulSoup(html, "html.parser")
table = soup.find('table', {'class': 'table'})
print("Table found:", table is not None)

bidding_data = []
if table:
    tbody = table.find('tbody')
    if tbody:
        for row in tbody.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) >= 8:
                auc_id = cols[0].get_text(strip=True)
                title_tag = cols[1].find('a')
                title = title_tag.get_text(strip=True) if title_tag else "Unknown Title"
                is_winning = "winning.gif" in str(cols[1])
                
                # In the user's HTML, cols[3] is the Time Left (e.g. "2 days 10 hours")
                # Wait, let's see what cols[3] is.
                end_date = cols[3].get_text(strip=True)
                
                def parse_price(text):
                    cleaned = text.replace('$', '').replace(',', '').strip()
                    try:
                        return float(cleaned)
                    except ValueError:
                        return 0.0
                        
                # Let's see the columns:
                # 0: 4005533
                # 1: title + winning.gif
                # 2: camera icon
                # 3: Time Left ("2 days 10 hours")
                # 4: <td class="show-auc-pct">
                # 5: Current Price ($293.00)
                # 6: Bid ($293.00)
                # 7: Proxy Bid ($350.00)
                # 8: Qty
                
                current_bid = parse_price(cols[5].get_text())
                user_bid = parse_price(cols[6].get_text())
                proxy_bid = parse_price(cols[7].get_text())
                
                bidding_data.append({
                    "id": auc_id,
                    "title": title,
                    "end_date_text": end_date,
                    "current_bid": current_bid,
                    "user_bid": user_bid,
                    "proxy_bid": proxy_bid,
                    "is_winning": is_winning
                })

print(json.dumps(bidding_data, indent=2))
