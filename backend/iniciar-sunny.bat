
@echo off
title Inicializacao Sunny Health

echo Iniciando Sunny Health...

REM Verifica se o Ollama ja esta funcionando
curl -s http://localhost:11434/api/tags >nul

if errorlevel 1 (
    echo Iniciando Ollama...
    start "Ollama" /min "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
    timeout /t 8 /nobreak >nul
)

REM Inicia o backend do Sunny Health
cd /d "C:\Users\micae\SH\backend"

echo Iniciando servidor...
start "Sunny Health Backend" /min cmd /k "npm run dev"

exit
