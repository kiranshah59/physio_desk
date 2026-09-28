FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port
EXPOSE 8000

# Run alembic migrations and start server
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
