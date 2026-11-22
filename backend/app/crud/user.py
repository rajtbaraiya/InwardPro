from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.auth import UserOut
from app.core.security import get_password_hash, verify_password
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str = ""
    is_admin: bool = False

class CRUDUser(CRUDBase[User, UserCreate, UserCreate]):
    def get_by_username(self, db: Session, username: str):
        return db.query(User).filter(User.username == username).first()

    def create_user(self, db: Session, username: str, password: str, full_name: str = "", is_admin: bool = False):
        hashed = get_password_hash(password)
        user = User(username=username, hashed_password=hashed, full_name=full_name, is_admin=is_admin)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate(self, db: Session, username: str, password: str):
        user = self.get_by_username(db, username)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

crud_user = CRUDUser(User)
