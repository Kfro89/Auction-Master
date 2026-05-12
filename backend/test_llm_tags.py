import asyncio
from app.services.llm import generate_valuation_data

async def main():
    title = "Brand New Apple MacBook Pro 16-inch M1 Max 32GB RAM 1TB SSD Space Gray"
    description = "New in box, seal intact. Model A2485."
    category = "Electronics"
    
    result = await generate_valuation_data(title, description, category)
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
