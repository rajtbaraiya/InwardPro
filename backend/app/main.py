from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.v1.router import api_router
import app.models  # noqa: ensure all models are registered

def create_app() -> FastAPI:
    # Create all tables
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title="InwardPro API",
        description="Goods Inward Management System",
        version="1.0.0",
        redirect_slashes=False,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")

    @app.on_event("startup")
    async def seed_data():
        from sqlalchemy.orm import Session
        from app.core.database import SessionLocal
        from app.crud.user import crud_user
        from app.crud.material import crud_material
        from app.schemas.material import MaterialCreate

        db: Session = SessionLocal()
        try:
            # Create default admin user if none exists
            if not crud_user.get_by_username(db, "admin"):
                crud_user.create_user(db, "admin", "admin123", "Administrator", is_admin=True)

            # Seed default materials
            DEFAULT_MATERIALS = [
                "Manifest Plastic", "Paper Sludge", "Plastic Waste",
                "Embroidery Waste", "Fiber Waste", "FRP",
                "Agri Waste", "Mono Fly Ash", "Rubber Chips"
            ]
            for name in DEFAULT_MATERIALS:
                if not crud_material.get_by_name(db, name):
                    crud_material.create(db, MaterialCreate(name=name))
        finally:
            db.close()

    return app

app = create_app()
