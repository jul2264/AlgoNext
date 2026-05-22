# AlgoNext Development Startup Script

Write-Host "🚀 Starting AlgoNext Development Environment..." -ForegroundColor Cyan

# 1. Start Redis Server
# Assuming Redis is installed on WSL or Windows. If using WSL:
Write-Host "Starting Redis (via WSL)..." -ForegroundColor Yellow
Start-Process wsl -ArgumentList "redis-server" -WindowStyle Minimized

# 2. Start Django Backend Server
Write-Host "Starting Django Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# 3. Start Celery Worker
Write-Host "Starting Celery Worker..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; celery -A algonext worker -l info --pool=solo"

# 4. Start Vite Frontend Server
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ All services started in separate windows!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Blue
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Blue
