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
        working_days=[1, 2, 3, 4, 5],  # Mon-Fri
        start_time=datetime.time(9, 0),
        end_time=datetime.time(17, 0),
        slot_duration_minutes=30
    )
    t2 = Therapist(
        name="Mark Thompson",
        specialty="Post-operative Care",
        working_days=[1, 3, 5],  # Mon, Wed, Fri
        start_time=datetime.time(8, 0),
        end_time=datetime.time(16, 0),
        slot_duration_minutes=45
    )
    t3 = Therapist(
        name="Dr. Priya Nair",
        specialty="Neurological Rehab",
        working_days=[1, 2, 4, 5],
        start_time=datetime.time(10, 0),
        end_time=datetime.time(18, 0),
        slot_duration_minutes=30
    )
    t4 = Therapist(
        name="Daniel Lee",
        specialty="Manual Therapy",
        working_days=[2, 3, 4, 6],
        start_time=datetime.time(9, 30),
        end_time=datetime.time(15, 30),
        slot_duration_minutes=45
    )
    db.add_all([t1, t2, t3, t4])
    db.commit()

    print("Creating patients...")
    patients = [
        Patient(name="Alice Smith", phone="555-0101", age=34, gender="Female", condition="ACL Tear", assigned_therapist_id=t1.id, package="Standard Rehab"),
        Patient(name="Bob Johnson", phone="555-0102", age=45, gender="Male", condition="Lower Back Pain", assigned_therapist_id=t2.id, package="Pain Management"),
        Patient(name="Charlie Davis", phone="555-0103", age=28, gender="Male", condition="Tennis Elbow", assigned_therapist_id=t1.id),
        Patient(name="Diana Evans", phone="555-0104", age=52, gender="Female", condition="Hip Replacement Recovery", assigned_therapist_id=t2.id, package="Premium Recovery"),
        Patient(name="Ethan Harris", phone="555-0105", age=19, gender="Male", condition="Ankle Sprain", assigned_therapist_id=t3.id, package="Sports Recovery"),
        Patient(name="Fiona Green", phone="555-0106", age=41, gender="Female", condition="Frozen Shoulder", assigned_therapist_id=t4.id, package="Manual Therapy"),
        Patient(name="George Lee", phone="555-0107", age=36, gender="Male", condition="Knee Osteoarthritis", assigned_therapist_id=t3.id, package="Mobility Program"),
        Patient(name="Hannah Scott", phone="555-0108", age=29, gender="Female", condition="Sciatica", assigned_therapist_id=t1.id, package="Core Rehab"),
        Patient(name="Isaac Moore", phone="555-0109", age=47, gender="Male", condition="Shoulder Impingement", assigned_therapist_id=t4.id, package="Recovery Plus"),
    ]
    db.add_all(patients)
    db.commit()

    print("Creating appointments...")
    today = datetime.date.today()
    apps = [
        Appointment(patient_id=patients[0].id, therapist_id=t1.id, date=today - datetime.timedelta(days=2), start_time=datetime.time(9, 0), end_time=datetime.time(9, 30), status=AppointmentStatusEnum.completed),
        Appointment(patient_id=patients[1].id, therapist_id=t2.id, date=today, start_time=datetime.time(10, 0), end_time=datetime.time(10, 45), status=AppointmentStatusEnum.booked),
        Appointment(patient_id=patients[2].id, therapist_id=t1.id, date=today + datetime.timedelta(days=1), start_time=datetime.time(14, 0), end_time=datetime.time(14, 30), status=AppointmentStatusEnum.booked),
        Appointment(patient_id=patients[3].id, therapist_id=t3.id, date=today - datetime.timedelta(days=1), start_time=datetime.time(11, 0), end_time=datetime.time(11, 45), status=AppointmentStatusEnum.completed),
        Appointment(patient_id=patients[4].id, therapist_id=t4.id, date=today + datetime.timedelta(days=2), start_time=datetime.time(15, 30), end_time=datetime.time(16, 15), status=AppointmentStatusEnum.booked),
        Appointment(patient_id=patients[5].id, therapist_id=t2.id, date=today + datetime.timedelta(days=3), start_time=datetime.time(12, 0), end_time=datetime.time(12, 45), status=AppointmentStatusEnum.booked),
    ]
    db.add_all(apps)
    db.commit()

    print("Creating invoices...")
    invs = [
        Invoice(patient_id=patients[0].id, service_package="Standard Rehab", amount=150.0, status=InvoiceStatusEnum.paid, payment_method="Credit Card", date=today - datetime.timedelta(days=2)),
        Invoice(patient_id=patients[1].id, service_package="Pain Management", amount=200.0, status=InvoiceStatusEnum.due, date=today),
        Invoice(patient_id=patients[2].id, service_package="Tennis Elbow Care", amount=180.0, status=InvoiceStatusEnum.paid, payment_method="Bank Transfer", date=today - datetime.timedelta(days=1)),
        Invoice(patient_id=patients[5].id, service_package="Manual Therapy", amount=260.0, status=InvoiceStatusEnum.due, date=today + datetime.timedelta(days=1)),
    ]
    db.add_all(invs)
    db.commit()

    print("Seed complete!")

if __name__ == "__main__":
    seed_db()
