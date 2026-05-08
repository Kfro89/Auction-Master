import asyncio
from backend.app.scrapers.auctioneer_software import AuctioneerSoftwareScraper

async def main():
    scraper = AuctioneerSoftwareScraper(base_url="https://bid.rollerauction.com", website_key="rol")
    auctions = await scraper.discover_active_auctions()
    if auctions:
        auction_id = auctions[0].get('auction_id') or auctions[0].get('id')
        print(f"Auction ID: {auction_id}")
        _, lots = await scraper.fetch_auction_lots(auction_id)
        if lots:
            print(lots[0].keys())
            print({k: v for k, v in lots[0].items() if 'image' in k.lower() or 'photo' in k.lower() or 'media' in k.lower() or 'url' in k.lower() or 'pic' in k.lower()})
    await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
