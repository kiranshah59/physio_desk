from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.therapist import Therapist
from app.models.user import User
from app.schemas.therapist import TherapistCreate, TherapistUpdate, TherapistResponse
from app.api.deps import get_db, get_current_active_admin, get_current_user

router = APIRouter()

@router.post("/", response_model=TherapistResponse, status_code=status.HTTP_201_CREATED)
def create_therapist(
    *,
    db: Session = Depends(get_db),
    therapist_in: TherapistCreate,
    current_user: User = Depends(get_current_active_admin)
):
    """Create a new therapist (Admin only)."""
    therapist = Therapist(**therapist_in.model_dump())
    db.add(therapist)
    db.commit()
    db.refresh(therapist)
    return therapist

@router.get("/", response_model=List[TherapistResponse])
def read_therapists(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Retrieve therapists. Any logged in user can read."""
    therapists = db.query(Therapist).offset(skip).limit(limit).all()
    return therapists

@router.get("/{therapist_id}", response_model=TherapistResponse)
def read_therapist(
    *,
    db: Session = Depends(get_db),
    therapist_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get therapist by ID."""
    therapist = db.query(Therapist).filter(Therapist.id == therapist_id).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    return therapist

@router.put("/{therapist_id}", response_model=TherapistResponse)
def update_therapist(
    *,
    db: Session = Depends(get_db),
    therapist_id: int,
    therapist_in: TherapistUpdate,
    current_user: User = Depends(get_current_active_admin)
):
    """Update a therapist (Admin only)."""
    therapist = db.query(Therapist).filter(Therapist.id == therapist_id).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    
    update_data = therapist_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(therapist, field, value)
        
    db.add(therapist)
    db.commit()
    db.refresh(therapist)
    return therapist

@router.delete("/{therapist_id}")
def delete_therapist(
    *,
    db: Session = Depends(get_db),
    therapist_id: int,
    current_user: User = Depends(get_current_active_admin)
):
    """Delete a therapist (Admin only)."""
    therapist = db.query(Therapist).filter(Therapist.id == therapist_id).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    db.delete(therapist)
    db.commit()
    return {"ok": True}
