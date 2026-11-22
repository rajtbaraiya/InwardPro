from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.user import crud_user
from fastapi import Depends


def get_current_user(db: Session = Depends(get_db)):
    """Auth disabled — always return admin user."""
    return crud_user.get_by_username(db, "admin")
