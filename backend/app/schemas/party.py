from pydantic import BaseModel
from typing import Optional

class PartyBase(BaseModel):
    name: str
    contact: Optional[str] = None
    address: Optional[str] = None

class PartyCreate(PartyBase):
    pass

class PartyUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class PartyOut(PartyBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
