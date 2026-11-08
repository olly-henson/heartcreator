@echo off
rem Starts Reel Upload hidden in the background (no window to keep open).
rem Safe to run twice: a second copy sees it's already running and quits.
rem The laptop's Wi-Fi address can change (it moved from .12 to .7 on 2026-11-05), so it's looked up each time.
cd /d "%~dp0"
start "" pyw "%~dp0upload_server.py"
rem Cloudflare Tunnel (2026-11-08): upload.ollyhenson.com works anywhere, not just home Wi-Fi. Starts hidden, only if not already running.
powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0..\tools\cloudflared\start-tunnel.ps1"
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' } | Select-Object -First 1).IPAddress"`) do set IP=%%i
echo.
echo   Reel Upload is running in the background.
echo   On your phone (anywhere) open:  https://upload.ollyhenson.com
echo   On home Wi-Fi this also works:  http://%IP%:8800
echo   You can close this window. To turn it off, run "Stop Reel Upload".
echo.
timeout /t 15 >nul
