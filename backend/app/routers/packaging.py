from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import PackagingConfiguration
from ..auth import get_current_user

router = APIRouter()

class PackagingConfigBase(BaseModel):
    name: str
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    box_cost: float = 0.0
    void_fill_cost: float = 0.0
    addon_cost: float = 0.0
    is_active: bool = True

class PackagingConfigCreate(PackagingConfigBase):
    pass

class PackagingConfigUpdate(BaseModel):
    name: Optional[str] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    box_cost: Optional[float] = None
    void_fill_cost: Optional[float] = None
    addon_cost: Optional[float] = None
    is_active: Optional[bool] = None

class PackagingConfigResponse(PackagingConfigBase):
    id: int
    total_cost: float

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PackagingConfigResponse])
def list_configs(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(PackagingConfiguration).all()

@router.post("/", response_model=PackagingConfigResponse)
def create_config(config: PackagingConfigCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_config = PackagingConfiguration(**config.model_dump())
    db_config.total_cost = db_config.box_cost + db_config.void_fill_cost + db_config.addon_cost
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/{id}", response_model=PackagingConfigResponse)
def get_config(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    config = db.query(PackagingConfiguration).filter(PackagingConfiguration.id == id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Packaging configuration not found")
    return config

@router.patch("/{id}", response_model=PackagingConfigResponse)
def update_config(id: int, config_update: PackagingConfigUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_config = db.query(PackagingConfiguration).filter(PackagingConfiguration.id == id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Packaging configuration not found")
    
    update_data = config_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_config, key, value)
    
    db_config.total_cost = db_config.box_cost + db_config.void_fill_cost + db_config.addon_cost
    db.commit()
    db.refresh(db_config)
    return db_config

@router.delete("/{id}")
def delete_config(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_config = db.query(PackagingConfiguration).filter(PackagingConfiguration.id == id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Packaging configuration not found")
    
    db.delete(db_config)
    db.commit()
    return {"status": "success"}
