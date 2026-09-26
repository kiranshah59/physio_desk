from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin, get_current_user
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import get_password_hash

router = APIRouter()

@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    Get all users (Staff and Admins). Admin only.
    """
    return db.query(User).order_by(User.id.asc()).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_staff_or_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    Create a new user account (e.g. staff member) with email and password. Admin only.
    """
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Default to staff if not specified
    role = user_in.role if user_in.role else RoleEnum.staff

    new_user = User(
        name=user_in.name,
        phone=user_in.phone,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    Update a user's role or password. Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    if user_in.email is not None and user_in.email != user.email:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        user.email = user_in.email

    if user_in.password:
        user.password_hash = get_password_hash(user_in.password)

    if user_in.role is not None:
        user.role = user_in.role
        
    if user_in.name is not None:
        user.name = user_in.name
        
    if user_in.phone is not None:
        user.phone = user_in.phone

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    Delete / revoke access for a staff member or user. Admin only.
    """
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own administrator account."
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User access revoked and account deleted successfully."}
