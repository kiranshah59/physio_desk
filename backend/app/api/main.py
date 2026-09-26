from fastapi import APIRouter
from app.api.routes import auth, patients, therapists, appointments, invoices, dashboard, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(therapists.router, prefix="/therapists", tags=["therapists"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
