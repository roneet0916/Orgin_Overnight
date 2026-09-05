@echo off
title FRA WebGIS Dashboard Launcher
echo ============================================================
echo   FRA AI Decision Support System - Starting Servers
echo ============================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FRA Backend (FastAPI)" cmd /k "cd /d %~dp0 && python run_backend.py"

timeout /t 3 >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "FRA Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   Servers started!
echo   Backend API:   http://127.0.0.1:8000/api
echo   API Docs:      http://127.0.0.1:8000/docs
echo   Frontend Web:  http://localhost:5173
echo ============================================================
pause
