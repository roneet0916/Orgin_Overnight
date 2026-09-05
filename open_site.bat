@echo off
title FRA Dashboard - Open Site
echo.
echo  FRA AI Decision Support Dashboard
echo  =================================
echo.

cd /d "%~dp0frontend"

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173
pause
