@echo off
echo Starting Parking Management System...
echo.

echo Starting Backend Server on port 3000...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server on port 5000...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul
