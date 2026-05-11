from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import UserSettings
from ..services.ingestion import ingest_auctioneer_software
from ..services.ps_ingestion import ingest_public_surplus

router = APIRouter()


# ---------- Pydantic schemas ----------

class SettingsResponse(BaseModel):
    ps_zip_code: str
    ps_radius_miles: int
    ps_region: str
    ps_enabled: bool
    ps_end_hours: int
    ps_category_id: int

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    ps_zip_code: Optional[str] = None
    ps_radius_miles: Optional[int] = Field(None, ge=-1, le=1000)
    ps_region: Optional[str] = None
    ps_enabled: Optional[bool] = None
    ps_end_hours: Optional[int] = None
    ps_category_id: Optional[int] = None


VALID_RADII = {-1, 20, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000}


# ---------- Settings endpoints ----------

def _get_or_create_settings(db: Session) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/settings", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create_settings(db)


@router.put("/settings", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    settings = _get_or_create_settings(db)

    if payload.ps_zip_code is not None:
        cleaned = payload.ps_zip_code.strip()
        if cleaned and (len(cleaned) != 5 or not cleaned.isdigit()):
            raise HTTPException(status_code=400, detail="Zip code must be exactly 5 digits")
        settings.ps_zip_code = cleaned

    if payload.ps_radius_miles is not None:
        if payload.ps_radius_miles not in VALID_RADII:
            raise HTTPException(status_code=400, detail=f"Radius must be one of {sorted(VALID_RADII)}")
        settings.ps_radius_miles = payload.ps_radius_miles

    if payload.ps_region is not None:
        settings.ps_region = payload.ps_region

    if payload.ps_enabled is not None:
        settings.ps_enabled = payload.ps_enabled

    if payload.ps_end_hours is not None:
        settings.ps_end_hours = payload.ps_end_hours

    if payload.ps_category_id is not None:
        settings.ps_category_id = payload.ps_category_id

    db.commit()
    db.refresh(settings)
    return settings


# ---------- Scrape triggers ----------

@router.post("/scrape/whitley")
async def scrape_whitley(db: Session = Depends(get_db)):
    try:
        return await ingest_auctioneer_software(
            db=db,
            base_url="https://www.whitleyauction.com",
            website_key="rmeb",
            name="Whitley Auction",
            buyer_premium=18.5
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scrape/roller")
async def scrape_roller(db: Session = Depends(get_db)):
    try:
        return await ingest_auctioneer_software(
            db=db,
            base_url="https://bid.rollerauction.com",
            website_key="rol",
            name="Roller Auction",
            buyer_premium=13.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scrape/public-surplus")
async def scrape_public_surplus(db: Session = Depends(get_db)):
    try:
        return await ingest_public_surplus(db=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
