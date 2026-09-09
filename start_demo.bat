@echo off
echo ========================================================
echo   Starting AURA Fashion AI and API Services...
echo ========================================================
echo.
echo Installing dependencies...
python -m pip install fastapi uvicorn pydantic httpx playwright
python -m playwright install chromium
echo.
echo Starting backend server (FastAPI) and frontend...
echo (Keep this window open to run the services)
echo.

start http://localhost:8080
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8080 --reload
pause
