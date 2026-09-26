from typing import Optional
from pydantic import BaseModel
from datetime import date as DateType, time, datetime
from app.models.appointment import AppointmentStatusEnum
from app.schemas.patient import PatientResponse

class AppointmentBase(BaseModel):
    patient_id: int
    therapist_id: int
    date: DateType
    start_time: time
    end_time: time
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    date: Optional[DateType] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[AppointmentStatusEnum] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    status: AppointmentStatusEnum
    created_at: datetime
    patient: PatientResponse

    class Config:
        from_attributes = True
