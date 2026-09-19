from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, index=True, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    address = Column(String)
    condition = Column(String)
    assigned_therapist_id = Column(Integer, ForeignKey("therapists.id"), nullable=True)
    package = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assigned_therapist = relationship("Therapist")
