@echo off
title FRA Backend Server
cd /d "%~dp0"

echo ============================================================
echo   FRA Backend - FastAPI on http://127.0.0.1:8000
echo ============================================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

if exist "venv\Scripts\activate.bat" (
    echo Using virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo No venv found. Using system Python.
    echo Tip: run  python -m venv venv  then  pip install -r requirements.txt
)

echo Installing/checking dependencies...
pip install -r requirements.txt -q

echo.
echo Starting backend...
echo   Root:      http://127.0.0.1:8000/
echo   Health:    http://127.0.0.1:8000/health
echo   API Docs:  http://127.0.0.1:8000/docs
echo.
echo Keep this window OPEN while using the dashboard.
echo Press Ctrl+C to stop the server.
echo ============================================================
echo.

python run_backend.py
pause
