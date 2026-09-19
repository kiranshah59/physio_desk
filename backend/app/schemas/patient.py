from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class PatientBase(BaseModel):
    name: str
    phone: str
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    condition: Optional[str] = None
    assigned_therapist_id: Optional[int] = None
    package: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    name: Optional[str] = None
    phone: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
