"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  RotateCcw,
  FileCode,
  FolderTree,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronRight,
  Code2,
  Sparkles,
  FileText,
  Layers,
  CheckCircle2,
  RefreshCw,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceFiles {
  [fileName: string]: string;
}

export const INITIAL_WORKSPACE_FILES: WorkspaceFiles = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EnvOS Live Application</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="badge">
        <span class="dot"></span>
        <span>ENVOS KERNEL v2.4 • RUNNER ONLINE</span>
      </div>
      
      <h1>🪐 EnvOS Cloud Web App</h1>
      <p class="subtitle">
        Collaborative sandbox running directly on physical compute runner <strong>Laptop 2</strong>.
      </p>

      <div class="stats-row">
        <div class="stat-pill">
          <span class="label">PORT</span>
          <span class="value">3000</span>
        </div>
        <div class="stat-pill">
          <span class="label">LATENCY</span>
          <span class="value">3.2 ms</span>
        </div>
        <div class="stat-pill">
          <span class="label">PROTOCOL</span>
          <span class="value">Duplex PTY</span>
        </div>
      </div>

      <div class="interactive-box">
        <button id="counterBtn" class="primary-btn" onclick="handleCounter()">
          <span>⚡ Click Counter:</span>
          <span id="clickCount" class="counter-badge">0</span>
        </button>
        <button id="greetBtn" class="secondary-btn" onclick="sendGreeting()">
          <span>👋 Ping Cloud Shell</span>
        </button>
      </div>

      <div id="outputLog" class="output-console">
        <div class="log-line text-cyan">➜ Connected to ws_room localhost:3000</div>
        <div class="log-line text-emerald">✓ Express HTTP runtime operational</div>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`,

  "style.css": `/* Modern Dark Glassmorphic Theme for EnvOS Apps */
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
  width: 100%;
  max-width: 580px;
}

.card {
  background: rgba(17, 24, 39, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.08);
  text-align: center;
  transition: all 0.3s ease;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #38bdf8;
  margin-bottom: 20px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #34d399;
  box-shadow: 0 0 8px #34d399;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 30%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 13.5px;
  line-height: 1.6;
  color: #9ca3af;
  margin-bottom: 24px;
}

.subtitle strong {
  color: #38bdf8;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-pill .label {
  font-size: 10px;
  color: #6b7280;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.stat-pill .value {
  font-size: 13px;
  color: #e5e7eb;
  font-weight: 700;
  font-family: monospace;
}

.interactive-box {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.primary-btn {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.35);
  transition: all 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(2, 132, 199, 0.5);
}

.primary-btn:active {
  transform: translateY(0);
}

.counter-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.output-console {
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  text-align: left;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
}

.log-line {
  margin-bottom: 4px;
}

.text-cyan { color: #38bdf8; }
.text-emerald { color: #34d399; }
.text-amber { color: #fbbf24; }
`,

  "app.js": `// Interactive Browser Client Logic
let clickCounter = 0;

console.log("[EnvOS App] Runtime script initialized.");

function handleCounter() {
  clickCounter++;
  const countEl = document.getElementById("clickCount");
  if (countEl) {
    countEl.innerText = clickCounter;
  }
  
  appendLog(\`[Click] Counter updated to \${clickCounter}\`, "text-cyan");
  console.log(\`[Counter Event] user pressed counter button: \${clickCounter}\`);
}

function sendGreeting() {
  const time = new Date().toLocaleTimeString();
  appendLog(\`[Ping \${time}] Heartbeat sent to Laptop 2 Runner.\`, "text-amber");
  console.log(\`[Heartbeat] ws_room active at \${time}\`);
}

function appendLog(message, colorClass = "text-cyan") {
  const logEl = document.getElementById("outputLog");
  if (!logEl) return;
  
  const line = document.createElement("div");
  line.className = "log-line " + colorClass;
  line.innerText = message;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}
`,

  "server.js": `// Node.js Express Server (runs on Laptop 2 runner SSD)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.'));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    runner: 'Laptop 2 (WS-HOST)',
    environment: 'EnvOS v2.4 Tahoe',
    duplexLatencyMs: 3.2,
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(\`EnvOS Node Server listening on http://localhost:\${PORT}\`);
});
`,

  "package.json": `{
  "name": "envos-workspace-app",
  "version": "1.0.0",
  "private": true,
  "description": "Collaborative web application powered by EnvOS Cloud OS",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "express": "^4.19.2",
    "ws": "^8.16.0"
  }
}
`,

  "README.md": `# EnvOS Workspace Code Studio

Welcome to your collaborative cloud workspace!

### Features
- **Live Two-Way Sync**: Edit \`index.html\`, \`style.css\`, or \`app.js\` and click **Run in Safari** to see instant changes.
- **Safari Live Preview**: Tests interactive buttons, DOM events, and styles inside a real embedded browser.
- **Physical Runner**: Connected to Laptop 2 via low-latency duplex WebSocket.

### Keyboard Shortcuts
- \`Cmd+Enter\` / \`Ctrl+Enter\`: Run and update preview in Safari
- \`Tab\`: Insert 2-space indentation
- \`Cmd+S\` / \`Ctrl+S\`: Save workspace file
`
};

interface WorkspaceIdeProps {
  roomCode: string;
  files: WorkspaceFiles;
  onChangeFiles: (files: WorkspaceFiles) => void;
  onRunInSafari: () => void;
  onOpenTerminal?: () => void;
  canEdit?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function WorkspaceIde({
  roomCode,
  files,
  onChangeFiles,
  onRunInSafari,
  onOpenTerminal,
  canEdit = true,
  isSaving = false,
  lastSaved = null,
}: WorkspaceIdeProps) {
  const fileKeys = Object.keys(files);
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [openTabs, setOpenTabs] = useState<string[]>([
    "index.html",
    "style.css",
    "app.js",
  ]);
  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [justRan, setJustRan] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const currentContent = files[activeFile] ?? "";

  // Synchronize scroll between line numbers gutter and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Cursor position tracking
  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBefore = target.value.substring(0, target.selectionStart);
    const lines = textBefore.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Tab key & shortcut interception
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      triggerRun();
      return;
    }

    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      setJustRan(true);
      setTimeout(() => setJustRan(false), 1500);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChangeFiles({
        ...files,
        [activeFile]: newValue,
      });

      // Restore cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const triggerRun = () => {
    setJustRan(true);
    onRunInSafari();
    setTimeout(() => setJustRan(false), 2000);
  };

  const handleSelectFile = (file: string) => {
    setActiveFile(file);
    if (!openTabs.includes(file)) {
      setOpenTabs([...openTabs, file]);
    }
  };

  const handleCloseTab = (fileToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((f) => f !== fileToClose);
    setOpenTabs(remaining);
    if (activeFile === fileToClose && remaining.length > 0) {
      setActiveFile(remaining[0]);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    if (files[trimmed] !== undefined) {
      setActiveFile(trimmed);
      setIsAddingFile(false);
      setNewFileName("");
      return;
    }

    const updated = {
      ...files,
      [trimmed]: `// File: ${trimmed}\n\n`,
    };
    onChangeFiles(updated);
    setActiveFile(trimmed);
    if (!openTabs.includes(trimmed)) {
      setOpenTabs([...openTabs, trimmed]);
    }
    setNewFileName("");
    setIsAddingFile(false);
  };

  const handleDeleteFile = (fileToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) return;
    const { [fileToDelete]: _, ...rest } = files;
    onChangeFiles(rest);
    const updatedTabs = openTabs.filter((f) => f !== fileToDelete);
    setOpenTabs(updatedTabs);
    if (activeFile === fileToDelete) {
      setActiveFile(Object.keys(rest)[0] || "");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Compute line count
  const lineCount = Math.max(1, currentContent.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // File icon helper
  const getFileIcon = (name: string) => {
    if (name.endsWith(".html")) return <FileCode className="w-4 h-4 text-orange-400" />;
    if (name.endsWith(".css")) return <FileCode className="w-4 h-4 text-cyan-400" />;
    if (name.endsWith(".js") || name.endsWith(".ts")) return <FileCode className="w-4 h-4 text-amber-300" />;
    if (name.endsWith(".json")) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (name.endsWith(".md")) return <FileText className="w-4 h-4 text-purple-400" />;
    return <FileCode className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="flex-1 flex overflow-hidden font-manrope bg-[#07090e] text-zinc-200 select-none">
      {/* 1. LEFT SIDEBAR: FILE EXPLORER */}
      <div className="w-56 bg-[#04060a] border-r border-white/10 flex flex-col justify-between text-xs select-none">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Workspace Title Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <FolderTree className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-bold text-white truncate tracking-tight text-[11px] uppercase">
                ws_{roomCode.toLowerCase()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingFile(true)}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Create New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New File Inline Input */}
          {isAddingFile && (
            <form onSubmit={handleCreateFile} className="p-2 border-b border-white/10 bg-white/[0.02]">
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => {
                  if (!newFileName.trim()) setIsAddingFile(false);
                }}
                placeholder="filename.js..."
                className="w-full px-2 py-1 rounded bg-black/60 border border-cyan-500/50 text-white text-xs font-mono focus:outline-none"
              />
            </form>
          )}

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Project Files
            </div>
            {fileKeys.map((fileName) => {
              const isActive = activeFile === fileName;
              return (
                <div
                  key={fileName}
                  onClick={() => handleSelectFile(fileName)}
                  className={cn(
                    "group px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(fileName)}
                    <span className="truncate">{fileName}</span>
                  </div>
                  {fileKeys.length > 1 && !["index.html", "server.js"].includes(fileName) && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFile(fileName, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-500/20 hover:text-rose-300 text-zinc-500 transition-all"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Runner Status & Tools in Sidebar */}
          <div className="p-3 border-t border-white/10 bg-white/[0.01] space-y-2">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Active Runner
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Laptop 2 (WS-HOST)</span>
            </div>

            <div className="pt-2 flex flex-col gap-1">
              <button
                type="button"
                onClick={triggerRun}
                className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3 h-3 fill-emerald-300" />
                <span>Run in Safari</span>
              </button>
              {onOpenTerminal && (
                <button
                  type="button"
                  onClick={onOpenTerminal}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TerminalIcon className="w-3 h-3 text-cyan-400" />
                  <span>Cloud Shell</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN EDITOR COLUMN */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e]">
        {/* Editor Tab Bar */}
        <div className="h-9 bg-[#04060a] border-b border-white/10 flex items-center justify-between px-2 overflow-x-auto text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 h-full overflow-x-auto">
            {openTabs.map((tab) => {
              const isActive = activeFile === tab;
              return (
                <div
                  key={`tab-${tab}`}
                  onClick={() => setActiveFile(tab)}
                  className={cn(
                    "h-full px-3 flex items-center gap-2 border-r border-white/5 cursor-pointer transition-colors text-xs select-none",
                    isActive
                      ? "bg-[#0b0e17] text-white border-t-2 border-t-cyan-400 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                  )}
                >
                  {getFileIcon(tab)}
                  <span>{tab}</span>
                  {openTabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleCloseTab(tab, e)}
                      className="ml-1 text-zinc-500 hover:text-white rounded-full p-0.5"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons in Tab Bar */}
          <div className="flex items-center gap-2 pl-3 shrink-0">
            {justRan && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live in Safari</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={triggerRun}
              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Run and preview code in Safari (⌘Enter)"
            >
              <Play className="w-3 h-3 fill-emerald-300" />
              <span>Run in Safari</span>
            </button>
          </div>
        </div>

        {/* Code Editor Body (Gutter + Textarea) */}
        <div className="flex-1 flex overflow-hidden relative bg-[#07090e] text-xs font-mono">
          {/* Synchronized Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className="w-12 py-3 bg-[#05070c] border-r border-white/5 text-zinc-600 text-right pr-3 select-none overflow-hidden font-mono text-[11px] leading-6"
          >
            {lineNumbers.map((num) => (
              <div
                key={`line-${num}`}
                className={num === cursorPos.line ? "text-cyan-400 font-bold" : ""}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Code Textarea with Keyboard & Tab Handling */}
          <div className="flex-1 relative overflow-hidden h-full">
            <textarea
              ref={textareaRef}
              disabled={!canEdit}
              value={currentContent}
              onChange={(e) => {
                onChangeFiles({
                  ...files,
                  [activeFile]: e.target.value,
                });
              }}
              onScroll={handleScroll}
              onSelect={handleTextareaSelect}
              onKeyUp={handleTextareaSelect}
              onClick={handleTextareaSelect}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="w-full h-full p-3 bg-transparent text-zinc-200 font-mono text-[12.5px] leading-6 resize-none focus:outline-none whitespace-pre overflow-auto selection:bg-cyan-500/30"
              placeholder="// Write code here..."
            />
          </div>
        </div>

        {/* Editor Bottom Status Bar */}
        <div className="h-6 px-3 bg-[#04060a] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500 select-none">
          <div className="flex items-center gap-3">
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span>•</span>
            <span>UTF-8</span>
            <span>•</span>
            <span className="text-cyan-400">
              {activeFile.endsWith(".html")
                ? "HTML5"
                : activeFile.endsWith(".css")
                ? "CSS3"
                : activeFile.endsWith(".js")
                ? "JavaScript (ES6)"
                : activeFile.endsWith(".json")
                ? "JSON"
                : "Markdown"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isSaving ? (
              <span className="text-amber-400 flex items-center gap-1.5 text-[10.5px]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Saving to Cloud...</span>
              </span>
            ) : lastSaved ? (
              <span className="text-emerald-400/90 flex items-center gap-1.5 text-[10.5px]">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Cloud Synced</span>
              </span>
            ) : null}
            <span>Press ⌘+Enter to Run in Safari</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Node.js v20 (ws_{roomCode})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

