import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, Date, Time, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AppointmentStatusEnum(str, enum.Enum):
    booked = "booked"
    cancelled = "cancelled"
    completed = "completed"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("therapists.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(Enum(AppointmentStatusEnum), default=AppointmentStatusEnum.booked, nullable=False)
    payment_method = Column(String)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient")
    therapist = relationship("Therapist")
