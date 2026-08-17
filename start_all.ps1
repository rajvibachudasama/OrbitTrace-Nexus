# OrbitTrace Nexus - Master Multi-Process Launcher
$pythonExe = "C:\Users\Rajviba Chudasama\python311\python.exe"
$nodeDir = "C:\Users\Rajviba Chudasama\node\node-v20.18.0-win-x64"
$env:PATH = "$nodeDir;$env:PATH"

$projectRoot = "c:\Users\Rajviba Chudasama\Desktop\Project"
$backendDir = "$projectRoot\backend"
$frontendDir = "$projectRoot\frontend"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "       🚀 STARTING ORBITTRACE NEXUS SPACE-SOC PLATFORM            " -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

# Start Backend Server
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath $pythonExe -ArgumentList "run.py" -WorkingDirectory $backendDir -PassThru

# Start Frontend Dev Server
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "$nodeDir\npm.cmd" -ArgumentList "run", "dev", "--", "--host" -WorkingDirectory $frontendDir -PassThru

Start-Sleep -Seconds 3
Write-Host "`n✅ OrbitTrace Nexus Space-SOC is LIVE!" -ForegroundColor Cyan
Write-Host "👉 Space-SOC Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "👉 FastAPI Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "👉 Interactive API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nDefault Login Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:    admin@orbittrace.space    / nexus2026!" -ForegroundColor White
Write-Host "  Operator: operator@orbittrace.space / operator2026!" -ForegroundColor White
Write-Host "  Analyst:  analyst@orbittrace.space  / analyst2026!" -ForegroundColor White
