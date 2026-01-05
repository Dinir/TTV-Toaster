@echo off
echo Starting ttv Toaster...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and add your Twitch credentials.
    echo.
    pause
    exit /b 1
)

REM Start the server and open browser
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

start http://localhost:3000
npm start
