from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.dashboard import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_dashboard_stats(db)
