from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import RoleEnum
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: RoleEnum = RoleEnum.staff

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.staff

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
