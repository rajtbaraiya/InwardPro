from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.crud.entry import crud_entry
from app.schemas.entry import EntryCreate, EntryUpdate, EntryOut, EntryListOut

router = APIRouter(prefix="/entries", tags=["entries"])

@router.get("", response_model=EntryListOut)
def list_entries(
    material_id: Optional[int] = Query(None),
    party_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    total, items = crud_entry.get_filtered(db, material_id, party_id, search, skip, limit)
    return {"total": total, "items": items}

@router.post("", response_model=EntryOut)
def create_entry(entry: EntryCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_entry.create_entry(db, entry)

@router.get("/{entry_id}", response_model=EntryOut)
def get_entry(entry_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_entry.get_with_relations(db, entry_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Entry not found")
    return obj

@router.put("/{entry_id}", response_model=EntryOut)
def update_entry(entry_id: int, entry: EntryUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_entry.get(db, entry_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Entry not found")
    updated = crud_entry.update(db, obj, entry)
    return crud_entry.get_with_relations(db, updated.id)

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_entry.remove(db, entry_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Deleted successfully"}
