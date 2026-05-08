import asyncio
from app.scrapers.auctioneer_software import AuctioneerSoftwareScraper

async def main():
    scraper = AuctioneerSoftwareScraper(base_url="https://bid.rollerauction.com", website_key="rol")
    auctions = await scraper.discover_active_auctions()
    if auctions:
        auction_id = auctions[0].get('auction_id') or auctions[0].get('id')
        _, lots = await scraper.fetch_auction_lots(auction_id)
        if lots:
            lot = lots[0]
            for k, v in lot.items():
                if type(v) in (int, float, dict) or 'bid' in k.lower() or 'price' in k.lower() or 'amount' in k.lower():
                    print(f"{k}: {v}")
    await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
