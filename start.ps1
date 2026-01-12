# Invoice Recovery Tracker - Startup Script
# This script starts both backend and frontend servers and opens the browser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Invoice Recovery Tracker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set the project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Kill any existing processes on ports 8000 and 3000
Write-Host "[1/4] Cleaning up existing processes..." -ForegroundColor Yellow
$port8000 = netstat -ano | findstr ":8000" | findstr "LISTENING"
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"

if ($port8000) {
    $processIds = $port8000 | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($processId in $processIds) {
        if ($processId -match '^\d+$') {
            taskkill /F /PID $processId 2>$null | Out-Null
        }
    }
}

if ($port3000) {
    $processIds = $port3000 | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($processId in $processIds) {
        if ($processId -match '^\d+$') {
            taskkill /F /PID $processId 2>$null | Out-Null
        }
    }
}

Start-Sleep -Seconds 1

# Start Backend Server
Write-Host "[2/4] Starting Backend Server (FastAPI)..." -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Running...' -ForegroundColor Green; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host "[3/4] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Running...' -ForegroundColor Green; python -m http.server 3000" -WindowStyle Normal

Start-Sleep -Seconds 2

# Open browser
Write-Host "[4/4] Opening browser..." -ForegroundColor Yellow
Start-Process "http://127.0.0.1:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://127.0.0.1:3000" -ForegroundColor White
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  To stop: Close the two PowerShell windows" -ForegroundColor Gray
Write-Host ""
