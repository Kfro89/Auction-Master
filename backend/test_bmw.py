import asyncio
from app.scrapers.roller_auction import RollerAuctionScraper

async def test_bmw():
    scraper = RollerAuctionScraper(base_url="https://bid.rollerauction.com", website_key="rol")

    auctions = await scraper.discover_active_auctions()
    if auctions:
        for auction in auctions:
            auction_id = auction.get('auction_id') or auction.get('id')
            _, lots = await scraper.fetch_auction_lots(auction_id)
            for lot in lots:
                title = lot.get('title') or lot.get('name', '')
                if 'BMW' in title:
                    print(f"Found BMW! Title: {title}, Lot: {lot.get('lot_number') or lot.get('lotNumber')}")
                    print("Bid fields:")
                    for k, v in lot.items():
                        if type(v) in (int, float, dict) or 'bid' in k.lower() or 'price' in k.lower() or 'amount' in k.lower():
                            print(f"{k}: {v}")
                    print("---")
    await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
