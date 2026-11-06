import fs from "node:fs/promises";
import { existsSync, createReadStream } from "node:fs";
import path from "node:path";
import chokidar, { FSWatcher } from "chokidar";

export interface WorkspaceFilesMap {
  [fileName: string]: string;
}

const DEFAULT_FILES: WorkspaceFilesMap = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EnvOS Collaborative App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="badge">
        <span class="dot"></span>
        <span>ENVOS COMPUTE RUNNER • LAPTOP 2 ONLINE</span>
      </div>
      
      <h1>🪐 EnvOS Collaborative Workspace</h1>
      <p class="subtitle">
        Physical files stored and executed on dedicated compute node <strong>Laptop 2</strong>.
      </p>

      <div class="stats-row">
        <div class="stat-pill">
          <span class="label">NODE</span>
          <span class="value">Laptop 2</span>
        </div>
        <div class="stat-pill">
          <span class="label">STORAGE</span>
          <span class="value">Local SSD</span>
        </div>
        <div class="stat-pill">
          <span class="label">RUNTIME</span>
          <span class="value">Node.js POSIX</span>
        </div>
      </div>

      <div class="interactive-box">
        <button id="counterBtn" class="primary-btn" onclick="handleCounter()">
          <span>⚡ Live Counter:</span>
          <span id="clickCount" class="counter-badge">0</span>
        </button>
        <button id="pingBtn" class="secondary-btn" onclick="pingServer()">
          <span>📡 Ping Compute Node</span>
        </button>
      </div>

      <div id="outputLog" class="output-console">
        <div class="log-line text-cyan">➜ Workspace booted on physical Laptop 2 server.</div>
        <div class="log-line text-emerald">✓ File sync and terminal duplex stream ready.</div>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`,

  "style.css": `/* Modern Dark Liquid-Glass Theme */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background: radial-gradient(circle at 50% 20%, #111827 0%, #030712 100%);
  color: #f3f4f6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.container {
  max-width: 680px;
  width: 100%;
}

.card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 9999px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: #34d399;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 10px #10b981;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  color: #ffffff;
}

.subtitle {
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 28px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.stat-pill {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.stat-pill .label {
  display: block;
  font-size: 10px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.stat-pill .value {
  font-size: 14px;
  font-weight: 600;
  color: #38bdf8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.interactive-box {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.primary-btn, .secondary-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.35);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(14, 165, 233, 0.45);
}

.secondary-btn {
  background: rgba(31, 41, 55, 0.8);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.secondary-btn:hover {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.counter-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
}

.output-console {
  background: #030712;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  max-height: 160px;
  overflow-y: auto;
}

.log-line {
  margin-bottom: 4px;
}

.text-cyan { color: #38bdf8; }
.text-emerald { color: #34d399; }
.text-amber { color: #fbbf24; }
`,

  "app.js": `// Interactive Client Script for EnvOS Sandbox
let count = 0;

function handleCounter() {
  count++;
  const badge = document.getElementById('clickCount');
  if (badge) {
    badge.innerText = count;
  }
  log('Counter bumped: ' + count, 'text-cyan');
}

function pingServer() {
  log('Ping sent to Laptop 2 Compute Node: ' + new Date().toLocaleTimeString(), 'text-emerald');
}

function log(msg, colorClass) {
  const consoleEl = document.getElementById('outputLog');
  if (consoleEl) {
    const line = document.createElement('div');
    line.className = 'log-line ' + (colorClass || 'text-cyan');
    line.innerText = '➜ ' + msg;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

console.log('[EnvOS Runtime] Collaborative client script initialized.');
`,

  "server.js": `// Example Node.js Express server running on Laptop 2
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'EnvOS Physical Runner Operational',
    host: 'Laptop 2',
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(\`[EnvOS] Server running physically on Laptop 2 at http://localhost:\${PORT}\`);
});
`,

  "package.json": `{
  "name": "envos-project",
  "version": "1.0.0",
  "description": "Collaborative project running on EnvOS Laptop 2 Runner",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": ["envos", "collaborative", "cloud-os"],
  "author": "EnvOS Team",
  "license": "MIT"
}
`,

  "README.md": `# EnvOS Collaborative Project

This project is running on **Laptop 2**, the physical compute and storage server for EnvOS.

## Collaboration Features
- **Storage**: All files are stored directly on Laptop 2's local SSD.
- **Compute**: Terminal commands run directly on Laptop 2's CPU and RAM.
- **Live Sync**: Changes made in the Monaco IDE update across all connected collaborator screens in real time.
`
};

export class FsManager {
  private baseDir: string;
  private watchers = new Map<string, FSWatcher>();

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), "workspaces");
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  public getWorkspacePath(roomCode: string): string {
    const safeCode = roomCode.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    return path.join(this.baseDir, `ws_${safeCode}`);
  }

  private resolveSafeFilePath(roomCode: string, relativePath: string): string {
    const wsDir = this.getWorkspacePath(roomCode);
    const resolved = path.resolve(wsDir, relativePath);

    // Enforce jail: path MUST start with workspace dir
    if (!resolved.startsWith(wsDir)) {
      throw new Error(`Security Exception: Directory traversal attempt denied: ${relativePath}`);
    }

    return resolved;
  }

  public async initWorkspace(roomCode: string, initialSeed?: WorkspaceFilesMap): Promise<string> {
    const wsDir = this.getWorkspacePath(roomCode);

    if (!existsSync(wsDir)) {
      await fs.mkdir(wsDir, { recursive: true });
    }

    // Check if workspace already has files
    const existing = await fs.readdir(wsDir);
    if (existing.length === 0) {
      const filesToSeed = initialSeed && Object.keys(initialSeed).length > 0 ? initialSeed : DEFAULT_FILES;
      for (const [relPath, content] of Object.entries(filesToSeed)) {
        await this.writeFile(roomCode, relPath, content);
      }
    }

    return wsDir;
  }

  public async listFiles(roomCode: string): Promise<WorkspaceFilesMap> {
    const wsDir = this.getWorkspacePath(roomCode);
    if (!existsSync(wsDir)) {
      await this.initWorkspace(roomCode);
    }

    const result: WorkspaceFilesMap = {};

    async function walk(currentDir: string, relPrefix = "") {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        // Skip hidden files and heavy node_modules
        if (entry.name.startsWith(".") && entry.name !== ".env") continue;
        if (entry.name === "node_modules") continue;

        const fullPath = path.join(currentDir, entry.name);
        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          await walk(fullPath, relPath);
        } else if (entry.isFile()) {
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            result[relPath] = content;
          } catch {
            // skip binary or unreadable files
          }
        }
      }
    }

    await walk(wsDir);
    return result;
  }

  public async readFile(roomCode: string, relativePath: string): Promise<string> {
    const fullPath = this.resolveSafeFilePath(roomCode, relativePath);
    return await fs.readFile(fullPath, "utf-8");
  }

  public async writeFile(roomCode: string, relativePath: string, content: string): Promise<void> {
    const fullPath = this.resolveSafeFilePath(roomCode, relativePath);
    const parentDir = path.dirname(fullPath);

    if (!existsSync(parentDir)) {
      await fs.mkdir(parentDir, { recursive: true });
    }

    await fs.writeFile(fullPath, content, "utf-8");
  }

  public async deleteFile(roomCode: string, relativePath: string): Promise<boolean> {
    const fullPath = this.resolveSafeFilePath(roomCode, relativePath);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
      return true;
    }
    return false;
  }

  public async purgeWorkspace(roomCode: string): Promise<boolean> {
    const wsDir = this.getWorkspacePath(roomCode);
    if (this.watchers.has(roomCode)) {
      await this.watchers.get(roomCode)?.close();
      this.watchers.delete(roomCode);
    }

    if (existsSync(wsDir)) {
      await fs.rm(wsDir, { recursive: true, force: true });
      return true;
    }
    return false;
  }

  public watchWorkspace(
    roomCode: string,
    onEvent: (event: "add" | "change" | "unlink", filePath: string) => void
  ): void {
    if (this.watchers.has(roomCode)) return;

    const wsDir = this.getWorkspacePath(roomCode);
    if (!existsSync(wsDir)) return;

    const watcher = chokidar.watch(wsDir, {
      ignored: /(^|[\/\\])\..|node_modules/,
      persistent: true,
      ignoreInitial: true,
      depth: 6,
    });

    watcher
      .on("add", (absPath) => {
        const rel = path.relative(wsDir, absPath).replace(/\\/g, "/");
        onEvent("add", rel);
      })
      .on("change", (absPath) => {
        const rel = path.relative(wsDir, absPath).replace(/\\/g, "/");
        onEvent("change", rel);
      })
      .on("unlink", (absPath) => {
        const rel = path.relative(wsDir, absPath).replace(/\\/g, "/");
        onEvent("unlink", rel);
      });

    this.watchers.set(roomCode, watcher);
  }
}

