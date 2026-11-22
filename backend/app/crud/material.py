from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialUpdate

class CRUDMaterial(CRUDBase[Material, MaterialCreate, MaterialUpdate]):
    def get_by_name(self, db: Session, name: str):
        return db.query(Material).filter(Material.name == name).first()

    def get_active(self, db: Session):
        return db.query(Material).filter(Material.is_active == True).order_by(Material.name).all()

crud_material = CRUDMaterial(Material)
