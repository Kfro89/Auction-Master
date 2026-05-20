from pydantic import BaseModel
from typing import Optional

class SoldItemResponse(BaseModel):
    id: int
    title: str
    status: str
    storage_location: Optional[str] = None
    packaging_config: Optional[str] = None
