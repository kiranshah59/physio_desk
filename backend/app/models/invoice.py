import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class InvoiceStatusEnum(str, enum.Enum):
    paid = "paid"
    due = "due"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    service_package = Column(String, nullable=False)
    discount = Column(Float, default=0.0)
    amount = Column(Float, nullable=False)
    status = Column(Enum(InvoiceStatusEnum), default=InvoiceStatusEnum.due, nullable=False)
    payment_method = Column(String)
    date = Column(Date, default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient")
