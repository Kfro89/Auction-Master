import asyncio
from app.scrapers.auctioneer_software import AuctioneerSoftwareScraper

async def main():
    scraper = AuctioneerSoftwareScraper(base_url="https://bid.rollerauction.com", website_key="rol")
    auctions = await scraper.discover_active_auctions()
    if auctions:
        auction_id = auctions[0].get('auction_id') or auctions[0].get('id')
        print(f"Auction ID: {auction_id}")
        
        resp = await scraper.client.get(f"{scraper.base_url}/auctions/{auction_id}?page=2")
        state = scraper._extract_apollo_state(resp.text)
        lots = scraper._extract_lots_from_state(state)
        print(f"Lots with page=2: {len(lots)}")
        if lots:
            print(f"First lot on page 2: {lots[0]['id']}")

        resp2 = await scraper.client.get(f"{scraper.base_url}/auctions/{auction_id}")
        state2 = scraper._extract_apollo_state(resp2.text)
        lots2 = scraper._extract_lots_from_state(state2)
        print(f"Lots with standard: {len(lots2)}")
        if lots2:
            print(f"First lot on standard: {lots2[0]['id']}")

    await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
