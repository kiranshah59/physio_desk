from typing import List, Optional
from pydantic import BaseModel
from datetime import time, datetime

class TherapistBase(BaseModel):
    name: str
    specialty: str
    working_days: List[int]
    start_time: time
    end_time: time
    slot_duration_minutes: int = 30

class TherapistCreate(TherapistBase):
    pass

class TherapistUpdate(TherapistBase):
    name: Optional[str] = None
    specialty: Optional[str] = None
    working_days: Optional[List[int]] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None

class TherapistResponse(TherapistBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

from datetime import date

class TherapistOverrideBase(BaseModel):
    date: date
    is_off: bool = False
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class TherapistOverrideCreate(TherapistOverrideBase):
    therapist_id: int

class TherapistOverrideResponse(TherapistOverrideBase):
    id: int
    therapist_id: int

    class Config:
        from_attributes = True
