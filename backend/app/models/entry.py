from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import TimestampMixin

class Entry(TimestampMixin, Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    entry_no = Column(Integer, unique=True, nullable=False, index=True)
    manifest_date = Column(Date, nullable=True)
    received_date = Column(Date, nullable=True)
    manifest_no = Column(String(100), nullable=True)
    truck_number = Column(String(50), nullable=True)

    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    material = relationship("Material", back_populates="entries")

    manifest_weight = Column(Float, nullable=True)
    actual_weight = Column(Float, nullable=True)
    received_weight = Column(Float, nullable=True)
    rate = Column(Float, nullable=True)
    transport_cost = Column(Float, nullable=True)
    material_cost = Column(Float, nullable=True)

    party_id = Column(Integer, ForeignKey("parties.id"), nullable=True)
    party = relationship("Party", back_populates="entries")

    station = Column(String(150), nullable=True)
    remark = Column(Text, nullable=True)
