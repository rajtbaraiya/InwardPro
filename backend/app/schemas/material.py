from pydantic import BaseModel
from typing import Optional

class MaterialBase(BaseModel):
    name: str

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class MaterialOut(MaterialBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
