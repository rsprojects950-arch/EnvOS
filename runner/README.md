# EnvOS Compute & Storage Server Node (Laptop 2)

This folder contains the **dedicated compute and physical storage runner node** for EnvOS. 
It runs on **Laptop 2** to supply physical storage (SSD), real RAM, CPU processing power, and pseudo-terminals (`node-pty`) for collaborative workspaces opened on **Laptop 1** and collaborator machines.

---

## 🚀 How to Run on Laptop 2

### Method 1: Windows (1-Click)
1. Copy or git-clone this `runner/` folder to Laptop 2.
2. Double click `start.bat`.
3. Choose your connectivity mode:
   - **Mode 1 (LAN)**: Connects over the same Wi-Fi / Hotspot via Laptop 2's local IP (e.g. `http://192.168.1.105:5000`).
   - **Mode 2 (Cloudflare Tunnel)**: Generates a free public `https://*.trycloudflare.com` URL so team members anywhere can connect over the internet.

### Method 2: Linux / macOS / WSL2
```bash
cd runner
chmod +x start.sh
./start.sh
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Instant health check and ping. |
| `GET` | `/api/telemetry` | Returns real CPU %, RAM GB, SSD storage MB, and active processes. |
| `POST` | `/api/workspaces/init` | Allocates physical directory `./workspaces/ws_<roomCode>/` on disk. |
| `GET` | `/api/workspaces/:roomCode/files` | Lists and reads all project files in the workspace. |
| `POST` | `/api/workspaces/:roomCode/files` | Saves modified/new files directly to physical disk. |
| `DELETE` | `/api/workspaces/:roomCode/files` | Deletes a file from physical disk. |
| `POST` | `/api/workspaces/:roomCode/purge` | Deletes the workspace directory from SSD and kills any running processes. |
| `WS` | `/stream?room=<roomCode>` | Real-time duplex WebSocket for POSIX terminal input/output and live telemetry. |

---

## 🔒 Security & Jail Containment
- All workspace files are restricted to `./workspaces/ws_<roomCode>/`.
- Path traversal (`../`) attacks are strictly blocked by `FsManager`.
- 15-minute grace period automatically terminates idle terminal sessions when all collaborators disconnect.

