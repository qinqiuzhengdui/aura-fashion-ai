@echo off
chcp 65001 >nul
echo ========================================================
echo   正在启动 AURA 时尚灵感企划设计平台 Demo...
echo ========================================================
echo.
start http://localhost:8080
python -m http.server 8080
pause
