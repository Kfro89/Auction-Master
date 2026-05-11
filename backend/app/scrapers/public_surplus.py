import re
import asyncio
import random
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
from urllib.parse import urlencode

import httpx
from bs4 import BeautifulSoup

from .base import BaseScraper

logger = logging.getLogger(__name__)

# The 26 Public Surplus categories — used as the universal app taxonomy.
PS_CATEGORIES = {
    22: "Airport", 24: "Animals and Livestock", 19: "Aviation",
    10: "Building", 16: "Clothing", 18: "Collectibles",
    1: "Computers", 2: "Electronics", 8: "Food Supply",
    28: "For Children", 14: "Furniture", 17: "Heavy Equipment",
    29: "Heavy Equipment Parts", 27: "Housewares", 6: "Industrial Equipment",
    11: "Jewelry", 20: "Marine", 23: "Medical",
    4: "Motor Pool", 21: "Motor Pool Parts", 13: "Music and Arts",
    3: "Office Equipment", 12: "Outdoor Equipment", 15: "Real Estate",
    9: "School Supplies", 25: "Scrap", 5: "Sporting Goods", 26: "Storage",
}


class PublicSurplusScraper(BaseScraper):
    """
    HTML scraper for publicsurplus.com.
    Parses server-rendered search result pages and individual auction detail pages.
    """

    BASE_URL = "https://www.publicsurplus.com"
    ITEMS_PER_PAGE = 20

    # Regex to extract end-time epoch-ms from the inline JS:
    #   updateTimeLeftSpan(timeLeftInfoMap, AUCTION_ID, "...", CURRENT_MS, END_MS, ...)
    _TIME_JS_RE = re.compile(
        r'updateTimeLeftSpan\(\s*timeLeftInfoMap\s*,\s*(\d+)\s*,'
        r'\s*"[^"]*"\s*,\s*(\d+)\s*,\s*(\d+)',
    )

    def __init__(
        self,
        zip_code: str = "",
        radius_miles: int = 200,
        region: str = "",
        end_hours: int = 240,
        category_id: int = -1,
    ):
        self.zip_code = zip_code
        self.radius_miles = radius_miles
        self.region = region
        self.end_hours = end_hours
        self.category_id = category_id
        self.client = httpx.AsyncClient(
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept": (
                    "text/html,application/xhtml+xml,"
                    "application/xml;q=0.9,image/webp,*/*;q=0.8"
                ),
                "Accept-Language": "en-US,en;q=0.5",
            },
            follow_redirects=True,
            timeout=30.0,
        )

    # ------------------------------------------------------------------
    # URL construction
    # ------------------------------------------------------------------

    def _build_search_url(self, page: int = 0) -> str:
        region_path = self.region if self.region else "browse"
        base = f"{self.BASE_URL}/sms/{region_path}/browse/search"
        params = {
            "posting": "y",
            "page": str(page),
            "keyWord": "",
            "catId": str(self.category_id),
            "endHours": str(self.end_hours),
            "startHours": "-1",
            "lowerPrice": "0",
            "higherPrice": "0",
            "milesLocation": str(self.radius_miles),
            "zipCode": self.zip_code,
            "sortBy": "",
            "sortDesc": "N",
        }
        return f"{base}?{urlencode(params)}"

    # ------------------------------------------------------------------
    # Search-results parsing
    # ------------------------------------------------------------------

    def _parse_search_results(self, html: str) -> List[Dict[str, Any]]:
        """Parse items from the search results table rows."""
        soup = BeautifulSoup(html, "html.parser")
        end_times = self._extract_end_times_from_js(html)

        items: List[Dict[str, Any]] = []

        # Grid view: each row is a <tr> with id like "4000349searchGrid" or "4000349searchList"
        rows = soup.select("tr[id]")
        for row in rows:
            row_id = row.get("id", "")
            # Strip suffixes to get the auction ID
            external_id = re.sub(r"(searchGrid|searchList)$", "", row_id)
            if not external_id or not external_id.isdigit():
                continue

            # Title: <a href="/sms/all,co/auction/view?auc=...">Title</a>
            title_link = row.select_one('a[href*="/auction/view?auc="]')
            title = title_link.get_text(strip=True) if title_link else ""
            url = title_link["href"] if title_link else ""
            if url and not url.startswith("http"):
                url = f"{self.BASE_URL}{url}"

            # Current bid: <td id="val_XXXXsearchList"> or similar
            bid_td = row.select_one(f'td[id^="val_"]')
            current_bid = 0.0
            if bid_td:
                bid_text = bid_td.get_text(strip=True)
                current_bid = self._parse_price(bid_text)

            # Image URL
            img = row.select_one("img.lazy-img-loading")
            image_url = img["src"] if img and img.get("src") else ""

            # State (e.g., "CO")
            state_td = row.select_one("td.text-center.text-success")
            state = state_td.get_text(strip=True) if state_td else ""

            # End time from JS
            end_time_ms = end_times.get(external_id)
            end_time = None
            if end_time_ms:
                end_time = datetime.fromtimestamp(end_time_ms / 1000, tz=timezone.utc)

            # Dutch auction indicator
            is_dutch = bool(row.select_one('img[src*="dutch"]'))

            items.append({
                "external_id": external_id,
                "title": title,
                "current_bid": current_bid,
                "end_time": end_time,
                "image_url": image_url,
                "url": url,
                "state": state,
                "is_dutch": is_dutch,
            })

        return items

    def _extract_end_times_from_js(self, html: str) -> Dict[str, int]:
        """Parse updateTimeLeftSpan() JS calls to get epoch-ms end times."""
        result: Dict[str, int] = {}
        for match in self._TIME_JS_RE.finditer(html):
            auction_id = match.group(1)
            end_ms = int(match.group(3))
            result[auction_id] = end_ms
        return result

    def _get_total_pages(self, html: str) -> int:
        """Determine total pages from the pagination controls."""
        soup = BeautifulSoup(html, "html.parser")
        # Pagination spans: srchPage('N') calls. Find the highest page number.
        page_spans = soup.select('span[onclick*="srchPage"]')
        max_page = 0
        for span in page_spans:
            onclick = span.get("onclick", "")
            page_match = re.search(r"srchPage\('(\d+)'\)", onclick)
            if page_match:
                page_num = int(page_match.group(1))
                if page_num > max_page:
                    max_page = page_num
        # Pages are 0-indexed in the URL, but srchPage uses 0-indexed values too.
        # The current page (bold) + max linked page gives us the total.
        # If no pagination links found, there's only 1 page.
        return max_page + 1 if max_page > 0 else 1

    # ------------------------------------------------------------------
    # Detail page parsing
    # ------------------------------------------------------------------

    async def fetch_item_detail(self, external_id: str) -> Dict[str, Any]:
        """Fetch and parse a single auction's detail page for rich data."""
        url = f"{self.BASE_URL}/sms/all,co/auction/view?auc={external_id}"
        response = await self.client.get(url)
        response.raise_for_status()
        return self._parse_detail_page(response.text, external_id)

    def _parse_detail_page(self, html: str, external_id: str) -> Dict[str, Any]:
        """Extract rich data from a detail page."""
        soup = BeautifulSoup(html, "html.parser")
        result: Dict[str, Any] = {}

        # Description: <section class="description"> > first div > first div
        desc_section = soup.select_one("section.description")
        if desc_section:
            # The first <div><div> inside contains the actual item description.
            inner_divs = desc_section.select("div > div")
            if inner_divs:
                result["description"] = inner_divs[0].get_text(separator="\n", strip=True)

        # Agency name from meta tag: <meta name="description" content="TITLE - AGENCY Surplus"/>
        meta_desc = soup.select_one('meta[name="description"]')
        if meta_desc:
            content = meta_desc.get("content", "")
            # Pattern: "TITLE - AGENCY Surplus"
            parts = content.rsplit(" - ", 1)
            if len(parts) == 2:
                agency = parts[1].replace(" Surplus", "").strip()
                result["agency_name"] = agency

        # Bid count: <span id="noOfBids">19</span>
        bid_count_el = soup.select_one("#noOfBids")
        if bid_count_el:
            try:
                result["bid_count"] = int(bid_count_el.get_text(strip=True))
            except ValueError:
                pass

        # Current price: <strong id="val_XXXXXXX">$1,050.00</strong>
        price_el = soup.select_one(f"#val_{external_id}")
        if price_el:
            result["current_bid"] = self._parse_price(price_el.get_text(strip=True))

        # Pickup location: block after bi-geo-alt icon
        geo_icon = soup.select_one("i.bi-geo-alt")
        if geo_icon:
            # Walk up to the containing div, then find the address content
            container = geo_icon.find_parent("div", class_="icon-info-common")
            if container:
                result.update(self._parse_pickup_location(container))

        # May extend flag
        extend_text = soup.find(string=re.compile(r"This auction might extend"))
        result["may_extend"] = bool(extend_text)

        # Region/state from bid-info
        region_strong = None
        region_labels = soup.find_all(string=re.compile(r"Region:"))
        for label in region_labels:
            parent = label.find_parent("div", class_="bid-info")
            if parent:
                strong = parent.select_one("strong")
                if strong:
                    region_strong = strong.get_text(strip=True)
                    break
        if region_strong:
            result["location_state"] = region_strong

        # Category: extract from breadcrumb or category link on the detail page
        # Pattern: link containing "catId=" in the href
        cat_link = soup.select_one('a[href*="catId="]')
        if cat_link:
            href = cat_link.get("href", "")
            cat_match = re.search(r'catId=(\d+)', href)
            if cat_match:
                cat_id = int(cat_match.group(1))
                if cat_id in PS_CATEGORIES:
                    result["category"] = PS_CATEGORIES[cat_id]

        return result

    def _parse_pickup_location(self, container) -> Dict[str, str]:
        """Extract pickup address fields from the geo-alt icon block."""
        result: Dict[str, str] = {}

        # Pickup name: first div after "Pick-up Location" heading
        auctitle_divs = container.select("div.auctitle")
        for title_div in auctitle_divs:
            if "Pick-up Location" in title_div.get_text():
                # The sibling div contains the name and address
                parent = title_div.find_parent("div", class_="align-items-start")
                if parent:
                    # First non-auctitle child div is the content
                    content_divs = [
                        d for d in parent.find_all("div", recursive=False)
                        if "auctitle" not in (d.get("class") or [])
                    ]
                    if content_divs:
                        content = content_divs[0]
                        # First child div is the pickup name
                        name_div = content.select_one("div:first-child")
                        if name_div and not name_div.select_one("button"):
                            result["pickup_name"] = name_div.get_text(strip=True)

                        # Address is in the button text
                        btn = content.select_one("button")
                        if btn:
                            addr_text = btn.get_text(separator="\n", strip=True)
                            # Remove bracket markers
                            addr_text = addr_text.replace("[", "").replace("]", "").strip()
                            lines = [l.strip() for l in addr_text.split("\n") if l.strip()]
                            # Typical: ["2222 Devereux Road", "Glenwood Springs,", "CO", "81601"]
                            if lines:
                                result["pickup_address"] = lines[0] if len(lines) > 0 else ""
                                result["pickup_city"] = lines[1].rstrip(",") if len(lines) > 1 else ""
                                result["pickup_state"] = lines[2] if len(lines) > 2 else ""
                                result["pickup_zip"] = lines[3] if len(lines) > 3 else ""
                break

        return result

    # ------------------------------------------------------------------
    # BaseScraper interface
    # ------------------------------------------------------------------

    async def discover_active_auctions(self) -> List[Dict[str, Any]]:
        """PS items are individually listed — return a synthetic wrapper."""
        return [{"id": "public_surplus_search", "title": "Public Surplus Active Listings"}]

    async def fetch_auction_lots(
        self, auction_id: str
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Paginate through PS search results.
        Returns (metadata, list_of_items).
        """
        all_items: List[Dict[str, Any]] = []
        page = 0

        while True:
            url = self._build_search_url(page)
            logger.info(f"Fetching PS search page {page}: {url}")
            response = await self.client.get(url)
            response.raise_for_status()

            items = self._parse_search_results(response.text)
            if not items:
                break
            all_items.extend(items)

            total_pages = self._get_total_pages(response.text)
            page += 1
            if page >= total_pages:
                break

            # Rate limiting: jittered delay between page requests
            await asyncio.sleep(random.uniform(1.5, 3.0))

        metadata = {
            "source": "public_surplus",
            "total_items": len(all_items),
            "zip_code": self.zip_code,
            "radius_miles": self.radius_miles,
        }
        return metadata, all_items

    async def health_check(self) -> bool:
        """Verify PS search page loads and has the expected structure."""
        try:
            url = self._build_search_url(page=0)
            response = await self.client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            # Expect either result rows or a "No auctions found" message
            has_rows = bool(soup.select("tr[id]"))
            has_no_results = bool(soup.select_one("#noAuctionsFound"))
            return has_rows or has_no_results
        except Exception:
            return False

    async def close(self):
        await self.client.aclose()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_price(text: str) -> float:
        """Parse '$1,050.00' -> 1050.0"""
        cleaned = text.replace("$", "").replace(",", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
