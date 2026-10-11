Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         Starting VoyageFlow Full-Stack Platform        " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python run_backend.py" -WindowStyle Normal

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "VoyageFlow services are launching!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "Backend API: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
