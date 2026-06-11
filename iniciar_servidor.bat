@echo off
chcp 65001 > nul
title Servidor de Gestión de OTs - FMS Climatización
echo ====================================================================
echo      INICIANDO SERVIDOR LOCAL DE GESTIÓN DE OTs
echo ====================================================================
echo.
echo [1/2] Iniciando el servicio web en segundo plano...
echo Puerto configurado: 8000
echo.

:: Abrir el navegador automáticamente en la pestaña de administración
start "" "http://127.0.0.1:8000/static/index.html"

:: Ejecutar el servidor uvicorn usando el entorno virtual
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al iniciar el servidor.
    echo Asegúrate de no tener otro programa usando el puerto 8000.
    echo.
    pause
)
