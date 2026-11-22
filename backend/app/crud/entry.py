from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from app.crud.base import CRUDBase
from app.models.entry import Entry
from app.schemas.entry import EntryCreate, EntryUpdate

class CRUDEntry(CRUDBase[Entry, EntryCreate, EntryUpdate]):
    def get_next_entry_no(self, db: Session) -> int:
        max_no = db.query(func.max(Entry.entry_no)).scalar()
        return (max_no or 0) + 1

    def create_entry(self, db: Session, obj_in: EntryCreate) -> Entry:
        entry_no = self.get_next_entry_no(db)
        data = obj_in.model_dump()
        db_obj = Entry(entry_no=entry_no, **data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db.query(Entry).options(
            joinedload(Entry.material),
            joinedload(Entry.party)
        ).filter(Entry.id == db_obj.id).first()

    def get_with_relations(self, db: Session, id: int):
        return db.query(Entry).options(
            joinedload(Entry.material),
            joinedload(Entry.party)
        ).filter(Entry.id == id).first()

    def get_filtered(
        self,
        db: Session,
        material_id: Optional[int] = None,
        party_id: Optional[int] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ):
        query = db.query(Entry).options(
            joinedload(Entry.material),
            joinedload(Entry.party)
        )
        if material_id:
            query = query.filter(Entry.material_id == material_id)
        if party_id:
            query = query.filter(Entry.party_id == party_id)
        if search:
            query = query.filter(
                Entry.manifest_no.ilike(f"%{search}%") |
                Entry.truck_number.ilike(f"%{search}%") |
                Entry.station.ilike(f"%{search}%")
            )
        total = query.count()
        items = query.order_by(Entry.entry_no.desc()).offset(skip).limit(limit).all()
        return total, items

crud_entry = CRUDEntry(Entry)
