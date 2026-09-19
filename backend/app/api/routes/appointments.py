from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatusEnum
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.api.deps import get_db, get_current_user

router = APIRouter()

def check_double_booking(db: Session, therapist_id: int, appt_date: date, start_time, end_time, exclude_appt_id: int = None):
    query = db.query(Appointment).filter(
        Appointment.therapist_id == therapist_id,
        Appointment.date == appt_date,
        Appointment.status != AppointmentStatusEnum.cancelled,
        and_(
            Appointment.start_time < end_time,
            Appointment.end_time > start_time
        )
    )
    if exclude_appt_id:
        query = query.filter(Appointment.id != exclude_appt_id)
        
    if query.first():
        raise HTTPException(status_code=400, detail="Therapist is already booked for this time slot")

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    *,
    db: Session = Depends(get_db),
    appointment_in: AppointmentCreate,
    current_user: User = Depends(get_current_user)
):
    """Book a new appointment."""
    check_double_booking(db, appointment_in.therapist_id, appointment_in.date, appointment_in.start_time, appointment_in.end_time)
    
    appointment = Appointment(**appointment_in.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/", response_model=List[AppointmentResponse])
def read_appointments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    therapist_id: Optional[int] = None,
    appt_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
):
    """Retrieve appointments. Optionally filter by therapist and date."""
    query = db.query(Appointment)
    if therapist_id:
        query = query.filter(Appointment.therapist_id == therapist_id)
    if appt_date:
        query = query.filter(Appointment.date == appt_date)
        
    appointments = query.offset(skip).limit(limit).all()
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def read_appointment(
    *,
    db: Session = Depends(get_db),
    appointment_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get appointment by ID."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    *,
    db: Session = Depends(get_db),
    appointment_id: int,
    appointment_in: AppointmentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Reschedule or update an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = appointment_in.model_dump(exclude_unset=True)
    
    # If time/date is changing, check for double booking
    if "date" in update_data or "start_time" in update_data or "end_time" in update_data:
        new_date = update_data.get("date", appointment.date)
        new_start = update_data.get("start_time", appointment.start_time)
        new_end = update_data.get("end_time", appointment.end_time)
        
        check_double_booking(db, appointment.therapist_id, new_date, new_start, new_end, exclude_appt_id=appointment.id)
    
    for field, value in update_data.items():
        setattr(appointment, field, value)
        
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
