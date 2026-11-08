@echo off
rem Turns Reel Upload off (any edit in progress restarts next time it's started).
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*upload_server.py*' -and $_.Name -match '^pyw?(thonw?)?\.exe$' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
powershell -NoProfile -Command "Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force"
echo.
echo   Reel Upload is off.
echo.
timeout /t 4 >nul
