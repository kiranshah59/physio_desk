import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User, RoleEnum
from app.models.therapist import Therapist
from app.models.patient import Patient
from app.models.appointment import Appointment, AppointmentStatusEnum
from app.models.invoice import Invoice, InvoiceStatusEnum
from app.core.security import get_password_hash
from app.models import Base

def seed_db():
    print("Starting database seed...")
    db = SessionLocal()
    
    # Check if users already exist
    if db.query(User).first():
        print("Database already seeded. Skipping.")
        return

    print("Creating users...")
    admin = User(
        email="admin@physiodesk.com",
        password_hash=get_password_hash("password123"),
        role=RoleEnum.admin
    )
    staff = User(
        email="staff@physiodesk.com",
        password_hash=get_password_hash("password123"),
        role=RoleEnum.staff
    )
    db.add_all([admin, staff])
    db.commit()

    print("Creating therapists...")
    t1 = Therapist(
        name="Dr. Sarah Jenkins",
        specialty="Sports Rehabilitation",
        working_days=[1, 2, 3, 4, 5], # Mon-Fri
        start_time=datetime.time(9, 0),
        end_time=datetime.time(17, 0),
        slot_duration_minutes=30
    )
    t2 = Therapist(
        name="Mark Thompson",
        specialty="Post-operative Care",
        working_days=[1, 3, 5], # Mon, Wed, Fri
        start_time=datetime.time(8, 0),
        end_time=datetime.time(16, 0),
        slot_duration_minutes=45
    )
    db.add_all([t1, t2])
    db.commit()

    print("Creating patients...")
    patients = [
        Patient(name="Alice Smith", phone="555-0101", age=34, gender="Female", condition="ACL Tear", assigned_therapist_id=t1.id, package="Standard Rehab"),
        Patient(name="Bob Johnson", phone="555-0102", age=45, gender="Male", condition="Lower Back Pain", assigned_therapist_id=t2.id, package="Pain Management"),
        Patient(name="Charlie Davis", phone="555-0103", age=28, gender="Male", condition="Tennis Elbow", assigned_therapist_id=t1.id),
        Patient(name="Diana Evans", phone="555-0104", age=52, gender="Female", condition="Hip Replacement Recovery", assigned_therapist_id=t2.id, package="Premium Recovery"),
        Patient(name="Ethan Harris", phone="555-0105", age=19, gender="Male", condition="Ankle Sprain"),
    ]
    db.add_all(patients)
    db.commit()

    print("Creating appointments...")
    today = datetime.date.today()
    apps = [
        Appointment(patient_id=patients[0].id, therapist_id=t1.id, date=today, start_time=datetime.time(9, 0), end_time=datetime.time(9, 30), status=AppointmentStatusEnum.completed),
        Appointment(patient_id=patients[1].id, therapist_id=t2.id, date=today, start_time=datetime.time(10, 0), end_time=datetime.time(10, 45), status=AppointmentStatusEnum.booked),
        Appointment(patient_id=patients[2].id, therapist_id=t1.id, date=today + datetime.timedelta(days=1), start_time=datetime.time(14, 0), end_time=datetime.time(14, 30), status=AppointmentStatusEnum.booked),
    ]
    db.add_all(apps)
    db.commit()

    print("Creating invoices...")
    invs = [
        Invoice(patient_id=patients[0].id, service_package="Standard Rehab", amount=150.0, status=InvoiceStatusEnum.paid, payment_method="Credit Card"),
        Invoice(patient_id=patients[1].id, service_package="Pain Management", amount=200.0, status=InvoiceStatusEnum.due),
    ]
    db.add_all(invs)
    db.commit()

    print("Seed complete!")

if __name__ == "__main__":
    seed_db()
