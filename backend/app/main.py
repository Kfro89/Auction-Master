import os
from datetime import timedelta, datetime
import pytz
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
from .services.ingestion import ingest_auctioneer_software, ingest_public_surplus, ingest_bidwrangler
from .database import SessionLocal
from apscheduler.schedulers.asyncio import AsyncIOScheduler

def prune_watchlist():
    import logging
    logger = logging.getLogger(__name__)
    db: Session = SessionLocal()
    try:
        fourteen_days_ago = datetime.now(pytz.utc) - timedelta(days=14)
        
        # Find watched items that ended more than 14 days ago and update them in bulk
        updated_count = db.query(models.Item).filter(
            models.Item.is_watched == True,
            models.Item.end_time < fourteen_days_ago
        ).update({"is_watched": False}, synchronize_session=False)
        
        db.commit()
        if updated_count > 0:
            logger.info(f"Pruned {updated_count} items from the watchlist.")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error pruning watchlist: {e}")
    finally:
        db.close()

app = FastAPI(title="Auction Arbitrage API")

app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(items.router, prefix="/api/items", tags=["items"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])

@app.post("/api/auth/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin_user_setting = db.query(models.Setting).filter_by(key="app_admin_username").first()
    admin_pass_setting = db.query(models.Setting).filter_by(key="app_admin_password").first()
    
    admin_user = admin_user_setting.value if admin_user_setting else os.getenv("ADMIN_USER", "admin")
    
    from .services.security import decrypt_value
    admin_pass = decrypt_value(admin_pass_setting.value) if admin_pass_setting else os.getenv("ADMIN_PASS", "password123")
    
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
    db = SessionLocal()
    try:
        defaults = {
            "public_surplus_zip": "80543",
            "public_surplus_radius": "200"
        }
        for k, v in defaults.items():
            if not db.query(models.Setting).filter_by(key=k).first():
                db.add(models.Setting(key=k, value=v))
        db.commit()
    except Exception as e:
        print(f"Error initializing settings: {e}")
    finally:
        db.close()

    scheduler = AsyncIOScheduler()
    async def sweep_and_valuate_job():
        db = SessionLocal()
        try:
            print("Starting background sweep and valuate job...")
            await ingest_auctioneer_software(db, "https://www.whitleyauction.com", "rmeb", "Whitley Auction", 18.5)
            await ingest_auctioneer_software(db, "https://bid.rollerauction.com", "rol", "Roller Auction", 13.0)
            await ingest_bidwrangler(db, "https://bid.dickensheet.com", "dickensheet", "Dickensheet")
            await ingest_public_surplus(db)
            await process_pending_valuations(db)
            print("Finished background sweep and valuate job.")
        except Exception as e:
            print(f"Error in background job: {e}")
        finally:
            db.close()

    scheduler.add_job(sweep_and_valuate_job, "interval", minutes=60)
    scheduler.add_job(prune_watchlist, 'cron', hour=0, minute=0) # Run daily at midnight UTC
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
