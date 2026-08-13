@echo off
setlocal
title Cike Android Preview
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 goto :missing_node

echo Starting Cike Android preview...
echo.
echo 1. Install Expo Go on your Android phone.
echo 2. Connect the phone and this PC to the same Wi-Fi.
echo 3. Scan the QR code shown below with Expo Go.
echo 4. Keep this window open. Press Ctrl+C to stop.
echo.
call npm run android:preview
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
echo [ERROR] Android preview failed. Review the log above.
pause
endlocal
exit /b %CIKE_EXIT_CODE%
