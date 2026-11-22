from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.crud.material import crud_material
from app.schemas.material import MaterialCreate, MaterialUpdate, MaterialOut

router = APIRouter(prefix="/materials", tags=["materials"])

@router.get("", response_model=List[MaterialOut])
def list_materials(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_material.get_multi(db)

@router.get("/active", response_model=List[MaterialOut])
def list_active_materials(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_material.get_active(db)

@router.post("", response_model=MaterialOut)
def create_material(material: MaterialCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existing = crud_material.get_by_name(db, material.name)
    if existing:
        raise HTTPException(status_code=400, detail="Material with this name already exists")
    return crud_material.create(db, material)

@router.get("/{material_id}", response_model=MaterialOut)
def get_material(material_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_material.get(db, material_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Material not found")
    return obj

@router.put("/{material_id}", response_model=MaterialOut)
def update_material(material_id: int, material: MaterialUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_material.get(db, material_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Material not found")
    return crud_material.update(db, obj, material)

@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_material.remove(db, material_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Deleted successfully"}
