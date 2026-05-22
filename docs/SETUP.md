# AlgoNext — Setup Guide

## Prerequisites

- **Node.js** ≥ 20 (LTS recommended)
- **Python** ≥ 3.12
- **PostgreSQL** ≥ 16 (or use Docker)
- **Redis** ≥ 7 (or use Docker)
- **Git**

## Option A: Local Development (without Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AlgoNext.git
cd AlgoNext
cp .env.example .env
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements/development.txt
```

### 4. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE algonext_dev;"

# Run migrations
python manage.py migrate

# Load curriculum content
python manage.py load_content --content-dir ../content/
```

### 5. Start the Backend

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### 6. Start Celery Worker

```bash
celery -A algonext worker -l info
```

## Option B: Docker (All Services)

```bash
cd infra/docker
docker-compose up -d
```

This starts: PostgreSQL, Redis, Django, Celery, and the Vite dev server.

## Environment Variables

See `.env.example` for all required environment variables. Key ones:

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (frontend) |
| `CLERK_SECRET_KEY` | Clerk secret key (backend) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JUDGE0_API_URL` | Judge0 API base URL |
| `JUDGE0_API_KEY` | Judge0 API key (RapidAPI) |
