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

## Running the Application

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Ensure PostgreSQL is running and update the `DATABASE_URL` in `app/db/database.py` if necessary.
6. Run migrations: `alembic upgrade head`
7. Seed the database with demo data: `python seed.py`
8. Start the server: `uvicorn app.main:app --reload` (Runs on `http://localhost:8000`)

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the web app at `http://localhost:3000`

### Demo Credentials
*   **Admin:** `admin@physiodesk.com` / `password123`
*   **Staff:** `staff@physiodesk.com` / `password123`
