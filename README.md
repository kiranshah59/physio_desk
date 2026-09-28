# PhysioDesk - Comprehensive Clinic Management System

PhysioDesk is a modern, responsive, and full-stack clinic management web application tailored specifically for physiotherapy clinics. It empowers administrators and staff members to efficiently manage patient records, coordinate appointment schedules, track therapist availability, and process billing and invoices all in one centralized platform.

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
- **Administrator (Full Access):** Can create and manage staff accounts, configure therapist profiles, and has unrestricted access to the entire system. Only one administrator account is permitted per clinic.
- **Staff Member (Restricted Access):** Can manage day-to-day operations like patients, appointments, and billing, but has restricted, read-only access to therapist configurations and cannot manage other users.

### 2. Patient Management
- Complete patient directory with detailed profiles.
- Track patient demographics, assigned therapists, current conditions, and active treatment packages.
- **Referential Integrity:** Deleting a patient automatically cascades the deletion of their related appointments and invoices to prevent orphaned data.

### 3. Scheduling & Appointments
- Interactive calendar view for booking, rescheduling, and cancelling appointments.
- Real-time overlap detection to prevent double-booking a therapist.
- Intuitive status tracking (`Booked`, `Completed`, `Cancelled`, `No Show`).

### 4. Therapist Configuration
- Manage therapist profiles including their specialties and working days.
- Configure daily shift hours and specific slot durations (e.g., 30-minute or 45-minute sessions).
- Override standard schedules for specific dates (e.g., vacations, sick leave).

### 5. Billing & Invoicing
- Generate and track invoices for patient visits.
- Monitor payment statuses (`Paid`, `Due`, `Overdue`, `Cancelled`) and track payment methods (Cash, Credit Card, Bank Transfer).

---

## 🛠️ Technology Stack

**Frontend:**
- **Framework:** Next.js (React) with App Router
- **Styling:** Tailwind CSS (Custom themed with 'Fraunces' typography and soft, accessible color palettes)
- **Language:** TypeScript
- **State Management:** React Context API (Auth Context)
- **Icons:** Lucide React
- **HTTP Client:** Axios

**Backend:**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Validation:** Pydantic
- **Authentication:** JWT (JSON Web Tokens) with OAuth2 Password Bearer

---

## 🚀 Setup & Installation Instructions

Follow these steps to get the application running locally on your machine for development or testing.

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)
- **PostgreSQL** (Running locally or hosted, e.g., on Docker)
- **Git**

### 2. Database Setup & Environment Variables
Ensure PostgreSQL is running. You must create an empty database (e.g., named `physiodesk`). 
By default, the backend connects to Postgres at `localhost` with the username `postgres` and password `postgres`. 

If your local PostgreSQL setup uses different credentials, you can override them by exporting the following environment variables before running the backend:
- `POSTGRES_SERVER` (default: localhost)
- `POSTGRES_USER` (default: postgres)
- `POSTGRES_PASSWORD` (default: postgres)
- `POSTGRES_DB` (default: physiodesk)
- `SECRET_KEY` (JWT signing key — a default is provided for local testing)

### 3. Backend Setup
Open a terminal, navigate to the backend directory, and set up your Python environment:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt
```

**Run Database Migrations & Seed Data:**
PhysioDesk uses Alembic to manage database schema changes.

```bash
# Run migrations to generate tables in your Postgres database
alembic upgrade head

# Seed the database with initial dummy data (Users, Therapists, Patients, Appointments, Invoices)
python seed.py
```

**Start the Backend API Server:**
```bash
uvicorn app.main:app --reload

# The backend API will now be available at http://localhost:8000
# You can view the interactive Swagger API documentation at http://localhost:8000/docs
```

### 4. Frontend Setup
Open a new, separate terminal window, and navigate to the frontend directory:

```bash
cd frontend

# Install the necessary Node dependencies
npm install

# Start the Next.js development server
npm run dev

# The frontend application will be available at http://localhost:3000
```

---

## 🔐 Test Login Credentials

If you ran the `python seed.py` command during setup, the database is pre-populated with two test users representing the two system roles. Use these credentials to log in and explore the app:

### Administrator (Full Access)
- **Email:** `admin@physiodesk.com`
- **Password:** `password123`
*(Use this account to manage staff members and configure therapist schedules)*

### Staff Member (Restricted Access)
- **Email:** `staff@physiodesk.com`
- **Password:** `password123`
*(Use this account to experience the day-to-day operations: managing patients, booking appointments, and handling billing)*

---

## 🧠 Technical Assumptions Made

During the architecture and development of this application, several technical and structural assumptions were made to align with the scope:

1. **Strict Single-Admin Architecture:** To prevent security bloat in a standard clinic setting, there is a hard rule that only **one administrator account** can exist. The first account created (via `seed.py` or the UI) locks the registration endpoint. All subsequent staff accounts must be manually provisioned by this single administrator.
2. **Data Deletion & Referential Integrity:** Patients are structurally the core of the system, heavily linked to both appointments and invoices. I assumed that if a patient record is deleted from the system, it is meant to be a "hard delete." Therefore, a cascading delete rule is enforced to automatically wipe their past appointments and invoices, preventing orphaned records in the database.
3. **Database Choice:** PostgreSQL was assumed to be the target database (configured via `psycopg`) to ensure ACID compliance, relational integrity, and future scalability, rather than using a flat-file database like SQLite.
4. **Client-Side Data Filtering:** I assumed that the volume of data (invoices, therapists, patients) for a single independent clinic would remain at a manageable size (in the thousands, not millions). Therefore, searching and filtering operations were implemented client-side in the React components for instantaneous UI feedback, rather than querying the database on every keystroke.
5. **Timezone Handling:** For simplicity in this iteration, all appointment times and therapist schedules are assumed to be operating in the local timezone of the clinic.

---

## 💡 Future Improvements (With More Time)

Given more time to scale and prepare the application for a true enterprise production environment, I would implement the following additions:

1. **Containerization & CI/CD:** Add `Dockerfile` and `docker-compose.yml` configurations to instantly spin up the frontend, backend, and PostgreSQL database simultaneously. Implement GitHub Actions for automated testing and linting on every push.
2. **Automated Email Integration:** Currently, when an admin creates a staff account, the password is automatically generated and displayed in plaintext on the screen. In production, I would integrate an email service (like SendGrid or AWS SES) to send a secure "Welcome" email to the staff member with a one-time password setup link.
3. **Server-Side Pagination & Search:** As the clinic's database grows over years of operation, loading all invoices or patients at once will degrade performance. I would implement server-side pagination, debounced searching, and advanced filtering directly in the FastAPI endpoints.
4. **Comprehensive Automated Testing:** Add comprehensive unit testing (with `pytest` for the FastAPI backend) and end-to-end integration tests (with `Cypress` or `Playwright` for the Next.js frontend) to automatically verify data integrity and prevent regressions during updates.
5. **Granular RBAC (Role-Based Access Control):** Expand the simple Admin/Staff binary into a more robust RBAC system. This would allow the creation of custom permission groups (e.g., `Receptionist`, `Billing Specialist`, `Clinical Director`) with fine-tuned access to specific modules.
6. **Websockets for Real-Time Updates:** Implement websockets so that if two staff members are viewing the schedule at the same time, an appointment booked by one staff member instantly appears on the screen of the other without requiring a page refresh.
7. **Social Login / OAuth2:** Integrate third-party authentication (Google Workspace, Microsoft Entra) to streamline the staff login process and increase organizational security.
