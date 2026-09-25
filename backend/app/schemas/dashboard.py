from typing import List
from pydantic import BaseModel
from datetime import date
from app.schemas.patient import PatientResponse

class DashboardPatient(PatientResponse):
    assigned_therapist_name: str | None = None
    status: str

class TherapistCapacity(BaseModel):
    therapist_id: int
    therapist_name: str
    total_slots: int
    booked_slots: int
    free_slots: int

class DashboardStats(BaseModel):
    patients_seen_today: int
    therapists_on_duty_today: int
    revenue_collected_today: float
    open_slots_remaining_today: int
    therapist_capacities: List[TherapistCapacity]
    recent_patients: List[DashboardPatient]
