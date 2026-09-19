# PhysioDesk Backend

## Tech Stack
* Python 3.10+
* FastAPI
* PostgreSQL
* SQLAlchemy + Alembic

## Setup Instructions

1. **Create Virtual Environment & Install Dependencies:**
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

2. **Database Setup:**
   Ensure PostgreSQL is running and you have a database named `physiodesk` created.
   The default credentials in `app/core/config.py` are `postgres:postgres` at `localhost`.

3. **Run Migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Seed the Database (Optional but recommended):**
   ```bash
   python seed.py
   ```
   This creates an admin user (`admin@physiodesk.com`), a staff user (`staff@physiodesk.com`) both with password `password123`, and populates dummy therapists, patients, appointments, and invoices.

5. **Run the Server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation
Once the server is running, visit `http://localhost:8000/docs` to view the interactive Swagger API documentation and test the endpoints.
