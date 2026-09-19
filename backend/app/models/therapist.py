from sqlalchemy import Column, Integer, String, Time, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Therapist(Base):
    __tablename__ = "therapists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    specialty = Column(String, nullable=False)
    working_days = Column(JSON, nullable=False)  # Example: [1, 2, 3, 4, 5] for Mon-Fri
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    slot_duration_minutes = Column(Integer, default=30, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
