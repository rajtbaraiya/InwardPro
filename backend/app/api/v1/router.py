from fastapi import APIRouter
from app.api.v1.routes import auth, parties, materials, entries, dashboard

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(parties.router)
api_router.include_router(materials.router)
api_router.include_router(entries.router)
api_router.include_router(dashboard.router)
