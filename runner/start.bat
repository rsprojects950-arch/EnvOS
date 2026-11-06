@echo off
setlocal enabledelayedexpansion

title EnvOS Dedicated Compute Server (Laptop 2)

echo ====================================================================
echo             🪐 EnvOS Compute & Storage Server Node
echo                  Dedicated Runner for Laptop 2
echo ====================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found on this machine!
    echo Please install Node.js v18+ from https://nodejs.org
    pause
    exit /b 1
)

:: 2. Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing server dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
)

:: 3. Build TypeScript to JavaScript
echo [INFO] Building TypeScript modules...
call npm run build

:: 4. Prompt for Cloudflare Tunnel (Optional)
echo.
echo ====================================================================
echo  CONNECTIVITY MODE:
echo    1. Local LAN Only (Same Wi-Fi / Hotspot)
echo    2. Cloudflare Quick Tunnel (Free public access for remote teams)
echo ====================================================================
set /p MODE="Choose connectivity mode (1 or 2, default is 1): "

if "%MODE%"=="2" (
    echo.
    echo [INFO] Starting Cloudflare Quick Tunnel in background...
    start "Cloudflare Tunnel" cmd /k "npx --yes cloudflared tunnel --url http://localhost:5000"
    echo [NOTE] Check the Cloudflare Tunnel window for your public *.trycloudflare.com URL!
    echo.
)

:: 5. Launch the Runner Daemon
echo [INFO] Starting EnvOS Compute Runner Server on port 5000...
npm start

pause

