from sqlalchemy import Column, Integer, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TherapistOverride(Base):
    __tablename__ = "therapist_overrides"

    id = Column(Integer, primary_key=True, index=True)
    therapist_id = Column(Integer, ForeignKey("therapists.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    is_off = Column(Boolean, default=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)

    therapist = relationship("Therapist")
