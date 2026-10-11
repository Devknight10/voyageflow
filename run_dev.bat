@echo off
echo ========================================================
echo          Starting VoyageFlow Full-Stack Platform
echo ========================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "VoyageFlow Backend" cmd /k "cd backend && python run_backend.py"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "VoyageFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo VoyageFlow is running!
echo Frontend: http://localhost:5173/
echo Backend API & Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
