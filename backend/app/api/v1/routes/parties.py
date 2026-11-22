from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.crud.party import crud_party
from app.schemas.party import PartyCreate, PartyUpdate, PartyOut

router = APIRouter(prefix="/parties", tags=["parties"])

@router.get("", response_model=List[PartyOut])
def list_parties(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_party.get_multi(db)

@router.get("/active", response_model=List[PartyOut])
def list_active_parties(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_party.get_active(db)

@router.post("", response_model=PartyOut)
def create_party(party: PartyCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existing = crud_party.get_by_name(db, party.name)
    if existing:
        raise HTTPException(status_code=400, detail="Party with this name already exists")
    return crud_party.create(db, party)

@router.get("/{party_id}", response_model=PartyOut)
def get_party(party_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_party.get(db, party_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Party not found")
    return obj

@router.put("/{party_id}", response_model=PartyOut)
def update_party(party_id: int, party: PartyUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_party.get(db, party_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Party not found")
    return crud_party.update(db, obj, party)

@router.delete("/{party_id}")
def delete_party(party_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    obj = crud_party.remove(db, party_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Party not found")
    return {"message": "Deleted successfully"}
