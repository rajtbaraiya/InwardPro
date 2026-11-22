from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import TimestampMixin

class Party(TimestampMixin, Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    contact = Column(String(20), nullable=True)
    address = Column(String(300), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    entries = relationship("Entry", back_populates="party")
