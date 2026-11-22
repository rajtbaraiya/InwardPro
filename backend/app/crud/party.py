from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.party import Party
from app.schemas.party import PartyCreate, PartyUpdate

class CRUDParty(CRUDBase[Party, PartyCreate, PartyUpdate]):
    def get_by_name(self, db: Session, name: str):
        return db.query(Party).filter(Party.name == name).first()

    def get_active(self, db: Session):
        return db.query(Party).filter(Party.is_active == True).order_by(Party.name).all()

    def search(self, db: Session, q: str):
        return db.query(Party).filter(Party.name.ilike(f"%{q}%")).all()

crud_party = CRUDParty(Party)
