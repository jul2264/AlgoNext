# 🚀 AlgoNext — Master DAA & DSA

**AlgoNext** is a personalized EdTech platform that helps students master Data Structures & Algorithms (DSA) and Design & Analysis of Algorithms (DAA) through **interactive visualizations**, **hands-on coding challenges**, and **adaptive learning paths**.

---

## ✨ Features

- 📊 **Algorithm Visualizations** — Step-through animations for sorting, trees, graphs, DP, and more using D3.js
- 💻 **Code Playground** — In-browser code editor (Monaco) with multi-language support (Python, C++, Java)
- 🎯 **Adaptive Difficulty** — Personalized problem recommendations based on your skill profile
- 🏫 **Teacher Dashboard** — Create classes, assign problems, monitor student progress
- 🔥 **Gamification** — Streaks, XP, badges, leaderboard, and activity heatmaps
- 📚 **Structured Curriculum** — 5 levels, 19 chapters, 100+ problems from foundations to complexity theory

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS v4 |
| **Visualizations** | D3.js · Framer Motion |
| **Code Editor** | Monaco Editor (VS Code in-browser) |
| **Backend** | Django 6 · Django REST Framework |
| **Task Queue** | Celery · Redis |
| **Code Execution** | Judge0 API (sandboxed) |
| **Database** | PostgreSQL (Supabase) · Django ORM |
| **Authentication** | Clerk |
| **Deployment** | Vercel (frontend) · Railway (backend) |

---

## 📁 Project Structure

```
AlgoNext/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Django + DRF
├── content/           # DSA curriculum (Markdown)
├── infra/             # Docker, Nginx, scripts
└── docs/              # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.12
- **PostgreSQL** ≥ 16 (or use Docker)
- **Redis** ≥ 7 (or use Docker)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/your-username/AlgoNext.git
cd AlgoNext
cp .env.example .env
# Fill in your Clerk keys, database URL, Judge0 API key, etc.
```

### 2. Unified Startup (Recommended)

To start the entire application (WSL Redis, Django backend, Celery worker, and Vite frontend) with a single command from the root folder:

```bash
npm install   # If running for the first time at root
npm run dev
```

### 3. Individual Component Startup (Manual)

If you prefer to start components manually in separate terminals:

#### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py load_content --content-dir ../content/
python manage.py runserver
# → http://localhost:8000
```

#### Celery Worker

```bash
cd backend
celery -A algonext worker -l info
```

### 4. Docker (All Services)

```bash
cd infra/docker
docker-compose up -d
```

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse curriculum, solve problems, view visualizations, track progress |
| **Teacher** | All student features + create classes, assign problems, monitor students |

---

## 📖 Documentation

- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Content Schema](docs/CONTENT_SCHEMA.md)
- [Setup Guide](docs/SETUP.md)
- [Contributing](docs/CONTRIBUTING.md)

---

## 📄 License

This project is private and proprietary.
