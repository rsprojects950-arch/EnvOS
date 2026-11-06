#!/usr/bin/env bash

set -e

echo "===================================================================="
echo "            🪐 EnvOS Compute & Storage Server Node"
echo "                 Dedicated Runner for Laptop 2"
echo "===================================================================="
echo ""

# 1. Verify Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not found on this machine!"
    echo "Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing runner server dependencies..."
    npm install
fi

# 3. Build TypeScript
echo "[INFO] Compiling TypeScript..."
npm run build

# 4. Optional Cloudflare Tunnel
echo ""
echo "===================================================================="
echo "  CONNECTIVITY MODE:"
echo "    1. Local LAN Only (Same Wi-Fi / Hotspot)"
echo "    2. Cloudflare Quick Tunnel (Free public access for remote teams)"
echo "===================================================================="
read -p "Choose connectivity mode (1 or 2, default is 1): " MODE

if [ "$MODE" = "2" ]; then
    echo "[INFO] Spawning Cloudflare Quick Tunnel..."
    if command -v cloudflared &> /dev/null; then
        cloudflared tunnel --url http://localhost:5000 &
    else
        npx --yes cloudflared tunnel --url http://localhost:5000 &
    fi
    echo "[NOTE] Check terminal output above for your free https://*.trycloudflare.com URL!"
    echo ""
fi

# 5. Launch Runner
echo "[INFO] Starting EnvOS Compute Runner Server on port 5000..."
npm start

