import asyncio
from app.scrapers.auctioneer_software import AuctioneerSoftwareScraper

async def main():
    scraper = AuctioneerSoftwareScraper(base_url="https://bid.rollerauction.com", website_key="rol")
    auctions = await scraper.discover_active_auctions()
    if auctions:
        auction_id = auctions[0].get('auction_id') or auctions[0].get('id')
        print(f"Auction ID: {auction_id}")
        meta, lots = await scraper.fetch_auction_lots(auction_id)
        print(f"Total Lots returned by scraper: {len(lots)}")
    await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
