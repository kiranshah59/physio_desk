from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from app.models.invoice import InvoiceStatusEnum

class InvoiceBase(BaseModel):
    patient_id: int
    service_package: str
    discount: float = 0.0
    amount: float
    status: InvoiceStatusEnum = InvoiceStatusEnum.due
    payment_method: Optional[str] = None
    date: date

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatusEnum] = None
    payment_method: Optional[str] = None
    discount: Optional[float] = None
    amount: Optional[float] = None

class InvoiceResponse(InvoiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
