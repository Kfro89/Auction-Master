import asyncio
import logging
from app.scrapers.public_surplus import PublicSurplusScraper

logging.basicConfig(level=logging.INFO)

async def test():
    scraper = PublicSurplusScraper("80238", "50")
    auctions = await scraper.discover_active_auctions()
    print("Auctions:", auctions)
    for auc in auctions:
        meta, lots = await scraper.fetch_auction_lots(auc["id"])
        print("Lots count:", len(lots))
        if lots:
            print("First lot:", lots[0])
        else:
            print("No lots found!")

if __name__ == "__main__":
    asyncio.run(test())
