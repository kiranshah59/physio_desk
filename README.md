# PhysioDesk - Clinic Management Tool

PhysioDesk is a full-stack clinic management tool designed for a physiotherapy practice. It provides a robust backend API and a modern, responsive frontend for managing patients, therapists, appointments, and billing.

## Tech Stack

As per the project requirements, the following tech stack was utilized:

*   **Backend:** Python 3.12+ with **FastAPI**
*   **Frontend:** **Next.js 15** (App Router) with Tailwind CSS v4
*   **Database:** **PostgreSQL** 17
*   **ORM / Migrations:** **SQLAlchemy** (async/sync support) and **Alembic**. We chose this combination because it is the industry standard for Python/FastAPI applications, providing excellent type safety, transaction management, and reliable schema migrations.

## Assumptions Made

During the development of this application, the following reasonable assumptions were made regarding ambiguous requirements:

1.  **Therapist Scheduling:** We assumed a default clinic operational window of 09:00 to 17:00, with a standard appointment slot duration of 30 minutes. Therapists can have their schedules customized within the application by an admin.
2.  **Double-Booking Logic:** We assumed that a therapist cannot be double-booked. The backend API enforces this by checking for overlapping `start_time` and `end_time` intervals for a specific `therapist_id` before confirming an appointment.
3.  **Role-Based Access Control (RBAC):** We assumed that `staff` can book appointments, manage patients, and view (but not create) invoices. `admin` users have exclusive access to manage Therapist profiles and schedules, as well as generate new invoices.
4.  **Authentication:** We implemented secure, stateless authentication using JSON Web Tokens (JWT) stored in HTTP cookies/local storage for the frontend, with passwords securely hashed via `bcrypt` in the database.
5.  **Design System:** We adhered strictly to the provided hex color palette, mapping the provided colors into a customized Tailwind CSS theme (`globals.css`).

## 🚀 Detailed Setup Instructions

Follow these step-by-step instructions to get the PhysioDesk application running on your local machine.

### Prerequisites
Before you begin, ensure you have the following installed:
*   **Python 3.12+**
*   **Node.js 18+** & npm
*   **PostgreSQL 17+**

---

### 1. Database Setup
1. Open your PostgreSQL terminal (psql) or pgAdmin.
2. Create a new database for the project:
   ```sql
   CREATE DATABASE physiodesk;
   ```
3. Note your PostgreSQL username and password (the default username is usually `postgres`).

---

### 2. Backend Setup (FastAPI)

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment to isolate dependencies:
   ```bash
   # On Windows:
   python -m venv venv
   
   # On macOS/Linux:
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # On Windows:
   .\venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. (Optional) By default, the app expects the database at `postgresql://postgres:password@localhost/physiodesk`. If your postgres credentials differ, update the `SQLALCHEMY_DATABASE_URL` string located inside `backend/app/db/database.py`.

6. Run the database migrations using Alembic. This will automatically create all the necessary tables in your PostgreSQL database:
   ```bash
   alembic upgrade head
   ```

7. Seed the database with initial demo data (demo users, dummy patients, therapists, etc.):
   ```bash
   python seed.py
   ```

8. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend API will now be running at `http://localhost:8000`.*
   *You can view the auto-generated Swagger documentation at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup (Next.js)

1. Open a **new** terminal window (keep the backend running in the first one) and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will now be running at `http://localhost:3000`.*

---

### 4. Accessing the Application

Open your web browser and navigate to `http://localhost:3000`. You can log in using the seed data credentials provided below.

### 🔑 Demo Credentials
The `seed.py` script automatically provisions the following accounts:

*   **Administrator (Full Access):**
    *   **Email:** `admin@physiodesk.com`
    *   **Password:** `password123`
*   **Staff Member (Restricted Access):**
    *   **Email:** `staff@physiodesk.com`
    *   **Password:** `password123`
