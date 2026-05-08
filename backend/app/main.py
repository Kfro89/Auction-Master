import os
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models
from .auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

# For now, we'll let Alembic handle migrations, but ensure tables are created
# Base.metadata.create_all(bind=engine)

from .routers import admin, items, inventory
from .services.valuation_worker import process_pending_valuations
from .services.ingestion import ingest_auctioneer_software
from .database import SessionLocal
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(title="Auction Arbitrage API")

app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(items.router, prefix="/api/items", tags=["items"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])

@app.post("/api/auth/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    admin_user = os.getenv("ADMIN_USER", "admin")
    admin_pass = os.getenv("ADMIN_PASS", "password123")
    
    if form_data.username != admin_user or form_data.password != admin_pass:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.on_event("startup")
async def start_scheduler():
    scheduler = AsyncIOScheduler()
    async def sweep_and_valuate_job():
        db = SessionLocal()
        try:
            print("Starting background sweep and valuate job...")
            await ingest_auctioneer_software(db, "https://www.whitleyauction.com", "rmeb", "Whitley Auction", 18.5)
            await ingest_auctioneer_software(db, "https://bid.rollerauction.com", "rol", "Roller Auction", 13.0)
            await process_pending_valuations(db)
            print("Finished background sweep and valuate job.")
        except Exception as e:
            print(f"Error in background job: {e}")
        finally:
            db.close()

    scheduler.add_job(sweep_and_valuate_job, "interval", minutes=60)
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
