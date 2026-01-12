# Invoice Recovery Tracker - Stop Script
# This script stops both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopping Invoice Recovery Tracker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill processes on port 8000
Write-Host "Stopping Backend Server (port 8000)..." -ForegroundColor Yellow
$port8000 = netstat -ano | findstr ":8000" | findstr "LISTENING"
if ($port8000) {
    $pids = $port8000 | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            taskkill /F /PID $pid 2>$null | Out-Null
            Write-Host "  Killed process $pid" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  No backend process found" -ForegroundColor Gray
}

# Kill processes on port 3000
Write-Host "Stopping Frontend Server (port 3000)..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($port3000) {
    $pids = $port3000 | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            taskkill /F /PID $pid 2>$null | Out-Null
            Write-Host "  Killed process $pid" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  No frontend process found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "All servers stopped!" -ForegroundColor Green
Write-Host ""
