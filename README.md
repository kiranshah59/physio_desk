# PhysioDesk

PhysioDesk is a comprehensive clinic management web application built for physiotherapy clinics. It enables administrators and staff members to manage patients, schedule appointments, handle therapist availability, and process invoices. 

The application utilizes a **Next.js** frontend with **Tailwind CSS** for a responsive, modern interface and a **FastAPI** backend with **SQLAlchemy** for robust data management and validation.

---

## 🚀 Setup Instructions

Follow these steps to get the application running locally on your machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)
- **PostgreSQL** (Running locally or hosted)
- **Git**

### 2. Database Setup
Ensure PostgreSQL is running on your machine and you have created a database named `physiodesk`.
By default, the backend connects to Postgres at `localhost` with the username `postgres` and password `postgres`.
You can override these by setting the following environment variables:
- `POSTGRES_SERVER`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

### 3. Backend Setup
Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

**Run Migrations & Seed the Database:**
PhysioDesk uses Alembic for database migrations.

```bash
# Run migrations to create database tables
alembic upgrade head

# Seed the database with initial users, therapists, patients, and appointments
python seed.py
```

**Start the Backend Server:**
```bash
uvicorn app.main:app --reload
# The backend API will be available at http://localhost:8000
# Interactive API documentation at http://localhost:8000/docs
```

### 4. Frontend Setup
Open a new terminal window, navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
# The frontend application will be available at http://localhost:3000
```

---

## 🔐 Test Login Credentials

The `seed.py` script automatically creates two users with different access levels. You can use these credentials to log in and test the application:

### Administrator (Full Access)
- **Email:** `admin@physiodesk.com`
- **Password:** `password123`
*(Can manage staff accounts, therapists, and has full system access)*

### Staff Member (Restricted Access)
- **Email:** `staff@physiodesk.com`
- **Password:** `password123`
*(Can view and manage patients, appointments, and invoices. Read-only access to therapists.)*

---

## 🧠 Assumptions Made

During the development of this application, several technical and structural assumptions were made:

1. **Single Admin System:** There is a strict rule that only one administrator account can exist. The first account created (via `seed.py` or the UI) locks the registration page. Subsequent staff accounts must be created and managed by the administrator.
2. **Cascade Deletion:** Patients are deeply linked to both appointments and invoices. I assumed that if a patient is deleted from the system, all their past appointments and invoices should also be permanently deleted (cascading delete) to maintain referential data integrity and avoid orphaned records.
3. **Local State Filtering:** I assumed that the volume of data (invoices, therapists, patients) is relatively small for a single clinic. Thus, filtering and searching operations were implemented locally on the frontend rather than via server-side querying.

---

## 💡 What I Would Do Differently / Add with More Time

Given more time to scale and improve the application for a production environment, I would focus on:

1. **Automated Emails:** Instead of displaying plaintext passwords when an admin creates a staff account, I would integrate an email service (like SendGrid or AWS SES) to send an automated "Welcome" email with a secure, one-time password setup link.
2. **Server-Side Pagination & Search:** Implement server-side pagination, searching, and advanced filtering for patients, appointments, and invoices to maintain frontend performance as the clinic's database grows.
3. **Comprehensive Testing:** Add comprehensive unit testing (with `pytest` for backend) and end-to-end integration tests (with Cypress or Playwright) to automatically ensure data integrity and prevent regressions during updates.
4. **Granular RBAC (Role-Based Access Control):** Expand the simple Admin/Staff binary into a more robust RBAC system, allowing custom permission sets (e.g., Receptionist, Billing Specialist, Therapist).
5. **Social Login / OAuth2:** Integrate third-party authentication (Google, Microsoft) to streamline the login process and increase security.
