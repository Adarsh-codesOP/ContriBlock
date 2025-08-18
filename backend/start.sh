#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload