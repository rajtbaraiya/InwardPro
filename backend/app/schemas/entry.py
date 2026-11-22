from pydantic import BaseModel
from typing import Optional
from datetime import date

class EntryBase(BaseModel):
    manifest_date: Optional[date] = None
    received_date: Optional[date] = None
    manifest_no: Optional[str] = None
    truck_number: Optional[str] = None
    material_id: Optional[int] = None
    manifest_weight: Optional[float] = None
    actual_weight: Optional[float] = None
    received_weight: Optional[float] = None
    rate: Optional[float] = None
    transport_cost: Optional[float] = None
    material_cost: Optional[float] = None
    party_id: Optional[int] = None
    station: Optional[str] = None
    remark: Optional[str] = None

class EntryCreate(EntryBase):
    pass

class EntryUpdate(EntryBase):
    pass

class MaterialInEntry(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class PartyInEntry(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class EntryOut(EntryBase):
    id: int
    entry_no: int
    material: Optional[MaterialInEntry] = None
    party: Optional[PartyInEntry] = None

    class Config:
        from_attributes = True

class EntryListOut(BaseModel):
    total: int
    items: list[EntryOut]
