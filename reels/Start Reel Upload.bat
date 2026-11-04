@echo off
rem Starts Reel Upload hidden in the background (no window to keep open).
rem Safe to run twice: a second copy sees it's already running and quits.
cd /d "%~dp0"
start "" pyw "%~dp0upload_server.py"
echo.
echo   Reel Upload is running in the background.
echo   On your phone (home Wi-Fi) open:  http://192.168.0.12:8800
echo   You can close this window. To turn it off, run "Stop Reel Upload".
echo.
timeout /t 6 >nul
