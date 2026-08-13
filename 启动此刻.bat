@echo off
setlocal
title Cike AI Music
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 goto :missing_node

echo Starting Cike AI Music...
echo Keep this window open. Press Ctrl+C to stop all services.
echo.
call npm run dev
set "CIKE_EXIT_CODE=%ERRORLEVEL%"

if not "%CIKE_EXIT_CODE%"=="0" goto :failed
endlocal
exit /b 0

:missing_node
echo [ERROR] npm was not found. Install Node.js and try again.
pause
endlocal
exit /b 1

:failed
echo.
echo [ERROR] Cike failed to start. Review the log above.
pause
endlocal
exit /b %CIKE_EXIT_CODE%
