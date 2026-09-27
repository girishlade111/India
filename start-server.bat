@echo off
echo Starting Girish IDE Local Server...
echo.
echo Choose an option:
echo 1. Python 3 Server (Recommended)
echo 2. Python 2 Server
echo 3. Node.js Server (if you have Node.js installed)
echo 4. Open directly in browser (no server)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Starting Python 3 server on http://localhost:8000
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo Starting Python 2 server on http://localhost:8000
    python -m SimpleHTTPServer 8000
) else if "%choice%"=="3" (
    echo Starting Node.js server on http://localhost:3000
    npx http-server -p 3000
) else if "%choice%"=="4" (
    echo Opening Girish IDE directly in browser...
    start index.html
) else (
    echo Invalid choice. Opening directly in browser...
    start index.html
)

pause