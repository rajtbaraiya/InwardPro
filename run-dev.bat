@echo off
title InwardPro - Dev Mode
echo.
echo  ===================================
echo   InwardPro - Starting Dev Servers
echo  ===================================
echo.

:: Start Backend
echo [1/2] Starting FastAPI Backend...
start "InwardPro Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting React Frontend...
start "InwardPro Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  Backend  : http://localhost:8000
echo  Frontend : ]
echo  API Docs : http://localhost:8000/docs
echo.
pause
