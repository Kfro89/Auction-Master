from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models

# For now, we'll let Alembic handle migrations, but ensure tables are created
# Base.metadata.create_all(bind=engine)

from .routers import admin, items, inventory
from .services.valuation_worker import process_pending_valuations
from .database import SessionLocal
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(title="Auction Arbitrage API")

app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(items.router, prefix="/api/items", tags=["items"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])

@app.on_event("startup")
async def start_scheduler():
    scheduler = AsyncIOScheduler()
    async def valuation_job():
        db = SessionLocal()
        try:
            await process_pending_valuations(db)
        finally:
            db.close()

    scheduler.add_job(valuation_job, "interval", seconds=60)
    scheduler.start()
    print("Background valuation scheduler started.")

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Verify DB connection works
    try:
        db.execute("SELECT 1")
        db_status = "ok"
    except Exception as e:
        db_status = str(e)

    return {"status": "ok", "database": db_status}

@app.get("/")
def read_root():
    return {"message": "Welcome to Auction Arbitrage API"}
