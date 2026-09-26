from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.patient import Patient, PatientStatusEnum
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    *,
    db: Session = Depends(get_db),
    patient_in: PatientCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new patient."""
    patient = Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/", response_model=List[PatientResponse])
def read_patients(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = None,
    status: Optional[PatientStatusEnum] = None,
    current_user: User = Depends(get_current_user)
):
    """Retrieve patients. Optionally filter by name or patient status."""
    query = db.query(Patient)
    if name:
        query = query.filter(Patient.name.ilike(f"%{name}%"))
    if status:
        query = query.filter(Patient.status == status)
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def read_patient(
    *,
    db: Session = Depends(get_db),
    patient_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    *,
    db: Session = Depends(get_db),
    patient_id: int,
    patient_in: PatientUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
        
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.delete("/{patient_id}")
def delete_patient(
    *,
    db: Session = Depends(get_db),
    patient_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Delete associated appointments and invoices first to avoid foreign key constraints
    from app.models.appointment import Appointment
    from app.models.invoice import Invoice
    
    db.query(Appointment).filter(Appointment.patient_id == patient_id).delete()
    db.query(Invoice).filter(Invoice.patient_id == patient_id).delete()
    
    db.delete(patient)
    db.commit()
    return {"ok": True}

from app.models.appointment import Appointment
from app.models.invoice import Invoice
from pydantic import BaseModel
from typing import Any

@router.get("/{patient_id}/profile")
def get_patient_profile(
    *,
    db: Session = Depends(get_db),
    patient_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get aggregated patient profile info."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    sessions = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.date.desc()).all()
    invoices = db.query(Invoice).filter(Invoice.patient_id == patient_id).order_by(Invoice.date.desc()).all()
    
    # We can use schemas, but for rapid aggregation a dict is fine
    return {
        "overview": patient,
        "sessions": [
            {
                "id": s.id,
                "date": s.date,
                "start_time": s.start_time,
                "status": s.status,
                "notes": s.notes,
                "therapist_name": s.therapist.name if s.therapist else "Unknown"
            } for s in sessions
        ],
        "billing": invoices
    }
