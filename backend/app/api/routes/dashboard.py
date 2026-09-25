import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatusEnum
from app.models.invoice import Invoice, InvoiceStatusEnum
from app.models.therapist import Therapist
from app.models.patient import Patient
from app.models.user import User
from app.schemas.dashboard import DashboardPatient, DashboardStats, TherapistCapacity
from app.schemas.patient import PatientResponse
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    weekday = today.isoweekday() # 1 = Monday, 7 = Sunday
    
    # 1. Patients seen today (completed appointments)
    patients_seen = db.query(Appointment).filter(
        Appointment.date == today,
        Appointment.status == AppointmentStatusEnum.completed
    ).count()
    
    # 2. Therapists on duty today
    # SQL JSON queries vary by DB, but we can just fetch all and filter in python for simplicity in this take-home
    all_therapists = db.query(Therapist).all()
    on_duty_therapists = [t for t in all_therapists if weekday in t.working_days]
    
    # 3. Revenue collected today
    revenue_result = db.query(func.sum(Invoice.amount)).filter(
        Invoice.date == today,
        Invoice.status == InvoiceStatusEnum.paid
    ).scalar()
    revenue_collected = revenue_result if revenue_result else 0.0
    
    # 4. Therapist Capacity View & Open Slots
    capacities = []
    total_open_slots = 0
    
    for t in on_duty_therapists:
        # Calculate total available minutes
        start_min = t.start_time.hour * 60 + t.start_time.minute
        end_min = t.end_time.hour * 60 + t.end_time.minute
        total_minutes = end_min - start_min
        
        # Calculate theoretical total slots
        total_slots = total_minutes // t.slot_duration_minutes if t.slot_duration_minutes > 0 else 0
        
        # Count booked appointments for this therapist today
        booked_slots = db.query(Appointment).filter(
            Appointment.therapist_id == t.id,
            Appointment.date == today,
            Appointment.status != AppointmentStatusEnum.cancelled
        ).count()
        
        free_slots = max(0, total_slots - booked_slots)
        total_open_slots += free_slots
        
        capacities.append(TherapistCapacity(
            therapist_id=t.id,
            therapist_name=t.name,
            total_slots=total_slots,
            booked_slots=booked_slots,
            free_slots=free_slots
        ))
        
    # 5. Recent Patients
    recent_patients = []
    for patient in db.query(Patient).order_by(Patient.created_at.desc()).limit(5).all():
        latest_appointment = db.query(Appointment).filter(
            Appointment.patient_id == patient.id
        ).order_by(Appointment.date.desc(), Appointment.start_time.desc()).first()

        patient_data = PatientResponse.model_validate(patient).model_dump()
        patient_data.pop('status', None)
        recent_patients.append(DashboardPatient(
            **patient_data,
            assigned_therapist_name=patient.assigned_therapist.name if patient.assigned_therapist else None,
            status=latest_appointment.status.value if latest_appointment else "new"
        ))
    
    return DashboardStats(
        patients_seen_today=patients_seen,
        therapists_on_duty_today=len(on_duty_therapists),
        revenue_collected_today=revenue_collected,
        open_slots_remaining_today=total_open_slots,
        therapist_capacities=capacities,
        recent_patients=recent_patients
    )
