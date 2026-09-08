@echo off
chcp 65001 >nul
echo ========================================================
echo   正在启动 AURA 时尚灵感企划设计平台及所有 API 服务...
echo ========================================================
echo.
echo 正在安装/检查后端依赖...
pip install fastapi uvicorn pydantic > nul 2>&1

echo 正在启动后端服务 (FastAPI) 与前端页面...
echo 提示：关闭此窗口将停止服务。
echo.

start http://localhost:8080
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8080
pause
