from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import datetime
import json

from ..database import get_db
from .. import models
from ..services.crypto import crypto_service
from ..auth import get_current_user

router = APIRouter()

class CredentialCreate(BaseModel):
    auction_house: str
    cookies: Dict[str, Any]
    user_agent: Optional[str] = None

class CredentialResponse(BaseModel):
    id: int
    auction_house: str
    is_valid: bool
    last_verified_at: Optional[datetime.datetime]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=CredentialResponse)
def save_credentials(
    payload: CredentialCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Determine a user ID based on the current_user (username).
    # Since we only have a single admin user represented by a string, we'll use a fixed ID like 1.
    user_id = 1 

    cookies_json = json.dumps(payload.cookies)
    encrypted_cookies = crypto_service.encrypt(cookies_json)

    # Check if a credential already exists for this user and auction house
    existing_cred = db.query(models.UserAuctionCredential).filter(
        models.UserAuctionCredential.user_id == user_id,
        models.UserAuctionCredential.auction_house == payload.auction_house
    ).first()

    if existing_cred:
        existing_cred.encrypted_cookies = encrypted_cookies
        existing_cred.user_agent = payload.user_agent
        existing_cred.is_valid = True
        existing_cred.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing_cred)
        return existing_cred
    else:
        new_cred = models.UserAuctionCredential(
            user_id=user_id,
            auction_house=payload.auction_house,
            encrypted_cookies=encrypted_cookies,
            user_agent=payload.user_agent,
            is_valid=True
        )
        db.add(new_cred)
        db.commit()
        db.refresh(new_cred)
        return new_cred
