"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Play,
  RotateCcw,
  FileCode,
  FolderTree,
  Folder,
  FolderOpen,
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
  Search,
  GitBranch,
  Settings,
  X,
  Maximize2,
  Minimize2,
  Split,
  Box,
  PanelBottom,
  AlertCircle,
  HelpCircle,
  Hash,
  FileJson,
  FileSpreadsheet,
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
          <span class="label">STORAGE</span>
          <span class="value">Laptop 2 SSD</span>
        </div>
      </div>

      <div class="interactive-box">
        <button id="counterBtn" class="primary-btn" onclick="handleCounter()">
          <span>⚡ Live Counter:</span>
          <span id="clickCount" class="counter-badge">0</span>
        </button>
        <button id="greetBtn" class="secondary-btn" onclick="sendGreeting()">
          <span>👋 Ping Cloud Shell</span>
        </button>
      </div>

      <div id="outputLog" class="output-console">
        <div class="log-line text-cyan">➜ Connected to ws_room localhost:3000</div>
        <div class="log-line text-emerald">✓ Express HTTP runtime operational on Laptop 2</div>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`,

  "style.css": `/* Modern Dark Liquid-Glass Theme for EnvOS Apps */
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
  background: #030712;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  line-height: 1.6;
  text-align: left;
  max-height: 120px;
  overflow-y: auto;
}

.log-line {
  margin-bottom: 2px;
}

.text-cyan { color: #38bdf8; }
.text-emerald { color: #34d399; }
`,

  "app.js": `// Interactive Client Script
let count = 0;

function handleCounter() {
  count++;
  const badge = document.getElementById('clickCount');
  if (badge) {
    badge.innerText = count;
  }
  log('⚡ Counter bumped: ' + count, 'text-cyan');
}

function sendGreeting() {
  log('👋 Ping sent to Laptop 2 Compute Node at ' + new Date().toLocaleTimeString(), 'text-emerald');
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

console.log('[EnvOS Live Preview] JavaScript runtime ready.');
`,

  "server.js": `// Express HTTP Server running on Laptop 2
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    runner: 'Laptop 2 Physical Compute Node',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
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
    "dev": "node --watch server.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "express": "^4.19.2",
    "ws": "^8.17.0"
  }
}
`,

  "README.md": `# EnvOS Workspace Code Studio

Welcome to your collaborative cloud workspace running directly on **Laptop 2**!

### Features
- **Physical Execution**: All commands and files execute on Laptop 2's physical SSD and RAM.
- **Integrated Terminal**: Embedded at the bottom of the IDE with real-time duplex stream.
- **Safari Live Preview**: Instant testing on port 3000 with real-time reload.
`
};

interface WorkspaceIdeProps {
  roomCode: string;
  files: WorkspaceFiles;
  onChangeFiles: (files: WorkspaceFiles) => void;
  onRunInSafari: () => void;
  terminalLogs?: string[];
  onTerminalSubmit?: (cmd: string) => void;
  isRunnerConnected?: boolean;
  runnerPing?: number | null;
  canEdit?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function WorkspaceIde({
  roomCode,
  files,
  onChangeFiles,
  onRunInSafari,
  terminalLogs = [],
  onTerminalSubmit,
  isRunnerConnected = true,
  runnerPing = 3.2,
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
    "server.js",
  ]);

  // Sidebar navigation state (Explorer vs Search vs Git)
  const [activeSidebarNav, setActiveSidebarNav] = useState<"explorer" | "search" | "git">("explorer");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Bottom Terminal Panel State (VS Code layout matching Image 1)
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<"terminal" | "problems" | "output" | "debug">("terminal");
  const [terminalInputVal, setTerminalInputVal] = useState("");
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // New file/folder state
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [justRan, setJustRan] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const currentContent = files[activeFile] ?? "";

  // Auto-scroll terminal when new logs arrive
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

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

      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChangeFiles({
        ...files,
        [activeFile]: newValue,
      });

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

  const handleTerminalSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInputVal.trim()) return;
    onTerminalSubmit?.(terminalInputVal.trim());
    setTerminalInputVal("");
  };

  // Compute line count
  const lineCount = Math.max(1, currentContent.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // File icon helper matching modern IDEs
  const getFileIcon = (name: string) => {
    if (name.endsWith(".html")) return <span className="text-orange-400 font-bold text-[11px]">HTML</span>;
    if (name.endsWith(".css")) return <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    if (name.endsWith(".js")) return <span className="text-yellow-400 font-bold text-[11px]">JS</span>;
    if (name.endsWith(".ts")) return <span className="text-sky-400 font-bold text-[11px]">TS</span>;
    if (name.endsWith(".json")) return <span className="text-amber-400 font-bold text-[11px]">{`{}`}</span>;
    if (name.endsWith(".md")) return <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    return <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden font-manrope bg-[#0b0f19] text-zinc-200 select-none">
      {/* ========================================================================= */}
      {/* 1. IDE TOP TITLE BAR & RUN ACTION (matching Image 1)                      */}
      {/* ========================================================================= */}
      <div className="h-8 px-3 bg-[#080b12] border-b border-white/10 flex items-center justify-between text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white tracking-tight">EnvOS Code Studio</span>
          <span className="text-[11px] text-zinc-500 font-mono">— ws_{roomCode.toLowerCase()} ({activeFile})</span>
        </div>

        <div className="flex items-center gap-2">
          {justRan && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preview Live in Safari</span>
            </span>
          )}

          <button
            type="button"
            onClick={triggerRun}
            className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Run application and stream to Safari Browser (⌘Enter)"
          >
            <Play className="w-3 h-3 fill-emerald-300" />
            <span>Run in Safari</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
            className={cn(
              "p-1 rounded hover:bg-white/10 transition-colors cursor-pointer",
              isBottomPanelOpen ? "text-cyan-400" : "text-zinc-500 hover:text-white"
            )}
            title="Toggle Integrated Terminal"
          >
            <PanelBottom className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY: ACTIVITY BAR + SIDEBAR + EDITOR & TERMINAL (Image 1)        */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* A. FAR LEFT ACTIVITY BAR (44px) */}
        <div className="w-11 bg-[#05080f] border-r border-white/10 flex flex-col justify-between items-center py-2 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (activeSidebarNav === "explorer") setIsSidebarOpen(!isSidebarOpen);
                else {
                  setActiveSidebarNav("explorer");
                  setIsSidebarOpen(true);
                }
              }}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer relative",
                activeSidebarNav === "explorer" && isSidebarOpen
                  ? "text-cyan-400 bg-white/10"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
              title="Explorer (Files)"
            >
              <FolderTree className="w-4 h-4" />
              {activeSidebarNav === "explorer" && isSidebarOpen && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-cyan-400 rounded-r" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeSidebarNav === "search") setIsSidebarOpen(!isSidebarOpen);
                else {
                  setActiveSidebarNav("search");
                  setIsSidebarOpen(true);
                }
              }}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer relative",
                activeSidebarNav === "search" && isSidebarOpen
                  ? "text-cyan-400 bg-white/10"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
              title="Search Workspace"
            >
              <Search className="w-4 h-4" />
              {activeSidebarNav === "search" && isSidebarOpen && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-cyan-400 rounded-r" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeSidebarNav === "git") setIsSidebarOpen(!isSidebarOpen);
                else {
                  setActiveSidebarNav("git");
                  setIsSidebarOpen(true);
                }
              }}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer relative",
                activeSidebarNav === "git" && isSidebarOpen
                  ? "text-cyan-400 bg-white/10"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
              title="Source Control"
            >
              <GitBranch className="w-4 h-4" />
              {activeSidebarNav === "git" && isSidebarOpen && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-cyan-400 rounded-r" />
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
              className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              title="Integrated Terminal"
            >
              <TerminalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* B. COLLAPSIBLE SIDEBAR: EXPLORER / SEARCH / GIT (Image 1) */}
        {isSidebarOpen && (
          <div className="w-56 bg-[#070a12] border-r border-white/10 flex flex-col justify-between text-xs select-none shrink-0">
            {activeSidebarNav === "explorer" && (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-2.5 border-b border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] tracking-wider uppercase">
                    EXPLORER
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingFile(true)}
                      className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="New File"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // refresh
                      }}
                      className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Refresh Explorer"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Workspace Folder Node (Image 1 style) */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 font-mono text-[11.5px]">
                  <div className="px-1.5 py-1 flex items-center gap-1.5 font-semibold text-zinc-300">
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white truncate">ws_{roomCode.toLowerCase()}</span>
                  </div>

                  {/* Inline New File Form */}
                  {isAddingFile && (
                    <form onSubmit={handleCreateFile} className="px-4 py-1">
                      <input
                        autoFocus
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onBlur={() => {
                          if (!newFileName.trim()) setIsAddingFile(false);
                        }}
                        placeholder="filename.js..."
                        className="w-full px-2 py-0.5 rounded bg-black/60 border border-cyan-500/50 text-white text-xs font-mono focus:outline-none"
                      />
                    </form>
                  )}

                  {/* File List */}
                  <div className="pl-4 space-y-0.5">
                    {fileKeys.map((fileName) => {
                      const isActive = activeFile === fileName;
                      return (
                        <div
                          key={fileName}
                          onClick={() => handleSelectFile(fileName)}
                          className={cn(
                            "group px-2 py-1 rounded-md flex items-center justify-between transition-colors cursor-pointer",
                            isActive
                              ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold"
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
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-500/20 hover:text-rose-300 text-zinc-500 transition-all cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Runner Node Pill */}
                <div className="p-2.5 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400">Laptop 2</span>
                  </div>
                  <span className="text-zinc-500">{runnerPing ?? 3}ms</span>
                </div>
              </div>
            )}

            {activeSidebarNav === "search" && (
              <div className="p-3 space-y-3">
                <span className="font-bold text-white text-[11px] tracking-wider uppercase block">
                  SEARCH
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in files..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <div className="text-[11px] text-zinc-500">
                  {searchQuery ? `Searching for "${searchQuery}" in ${fileKeys.length} files...` : "Type keyword to find in workspace"}
                </div>
              </div>
            )}

            {activeSidebarNav === "git" && (
              <div className="p-3 space-y-3">
                <span className="font-bold text-white text-[11px] tracking-wider uppercase block">
                  SOURCE CONTROL
                </span>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-semibold">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>feat/CU-14zg7e2f2rh</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">All changes synced to GitHub repository & Laptop 2.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* C. CENTER COLUMN: TABS + CODE EDITOR + INTEGRATED TERMINAL (Image 1) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d17]">
          {/* Editor Tabs (VS Code style matching Image 1) */}
          <div className="h-9 bg-[#060810] border-b border-white/10 flex items-center justify-between px-1 overflow-x-auto text-xs shrink-0">
            <div className="flex items-center gap-0.5 h-full overflow-x-auto">
              {openTabs.map((tab) => {
                const isActive = activeFile === tab;
                return (
                  <div
                    key={`tab-${tab}`}
                    onClick={() => setActiveFile(tab)}
                    className={cn(
                      "h-full px-3 flex items-center gap-2 border-r border-white/5 cursor-pointer transition-colors text-xs font-mono select-none group",
                      isActive
                        ? "bg-[#0b0f19] text-white border-t-2 border-t-cyan-400 font-medium"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                    )}
                  >
                    {getFileIcon(tab)}
                    <span>{tab}</span>
                    {openTabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleCloseTab(tab, e)}
                        className="ml-1 text-zinc-500 hover:text-white rounded-full p-0.5 opacity-60 group-hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-3 pr-2 shrink-0">
              {isSaving ? (
                <span className="text-amber-400 flex items-center gap-1 text-[11px] font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Saving to Laptop 2...</span>
                </span>
              ) : (
                <span className="text-emerald-400/80 flex items-center gap-1 text-[11px] font-mono">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>Synced</span>
                </span>
              )}
            </div>
          </div>

          {/* Code Editor Body (Gutter + Textarea) */}
          <div className="flex-1 flex overflow-hidden relative bg-[#090c15] text-xs font-mono">
            {/* Line Numbers Gutter */}
            <div
              ref={lineNumbersRef}
              className="w-12 py-3 bg-[#060810] border-r border-white/5 text-zinc-600 text-right pr-3 select-none overflow-hidden font-mono text-[11px] leading-6 shrink-0"
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

            {/* Code Textarea */}
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
                className="w-full h-full p-3 bg-transparent text-zinc-100 font-mono text-[12.5px] leading-6 resize-none focus:outline-none whitespace-pre overflow-auto selection:bg-cyan-500/30"
                placeholder="// Write code here..."
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* D. INTEGRATED BOTTOM PANEL (TERMINAL / PROBLEMS / OUTPUT) (Image 1)  */}
          {/* ===================================================================== */}
          {isBottomPanelOpen && (
            <div className="h-56 bg-[#05070e] border-t border-white/10 flex flex-col shrink-0">
              {/* Panel Header Tabs (Problems, Output, Debug Console, Terminal) */}
              <div className="h-7 px-3 bg-[#03050a] border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setBottomTab("problems")}
                    className={cn(
                      "hover:text-white cursor-pointer transition-colors",
                      bottomTab === "problems" ? "text-white font-bold border-b border-cyan-400" : "text-zinc-500"
                    )}
                  >
                    Problems <span className="text-[10px] bg-white/10 px-1 rounded">0</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottomTab("output")}
                    className={cn(
                      "hover:text-white cursor-pointer transition-colors",
                      bottomTab === "output" ? "text-white font-bold border-b border-cyan-400" : "text-zinc-500"
                    )}
                  >
                    Output
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottomTab("terminal")}
                    className={cn(
                      "hover:text-white cursor-pointer transition-colors flex items-center gap-1.5",
                      bottomTab === "terminal" ? "text-cyan-400 font-bold border-b border-cyan-400" : "text-zinc-500"
                    )}
                  >
                    <TerminalIcon className="w-3 h-3" />
                    <span>Terminal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottomTab("debug")}
                    className={cn(
                      "hover:text-white cursor-pointer transition-colors",
                      bottomTab === "debug" ? "text-white font-bold border-b border-cyan-400" : "text-zinc-500"
                    )}
                  >
                    Debug Console
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">node Laptop 2</span>
                  <button
                    type="button"
                    onClick={() => setIsBottomPanelOpen(false)}
                    className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                    title="Close Panel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 p-3 overflow-hidden flex flex-col font-mono text-xs text-zinc-300">
                {bottomTab === "terminal" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Terminal Logs Output */}
                    <div
                      ref={terminalScrollRef}
                      className="flex-1 overflow-y-auto space-y-1 font-mono text-[12px] leading-relaxed pr-2 select-text"
                    >
                      {terminalLogs.map((log, index) => (
                        <div key={`integrated-term-${index}`}>
                          {log.includes("@laptop2") ? (
                            <span className="text-cyan-300">{log}</span>
                          ) : log.includes("Ready") || log.includes("✓") || log.includes("operational") ? (
                            <span className="text-emerald-400">{log}</span>
                          ) : log.includes("ACCESS DENIED") || log.includes("Error") ? (
                            <span className="text-rose-400">{log}</span>
                          ) : (
                            <span className="text-zinc-400">{log}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Integrated Interactive Command Input */}
                    <form onSubmit={handleTerminalSubmitInternal} className="pt-2 flex items-center gap-2 border-t border-white/5">
                      <span className="text-cyan-400 shrink-0 font-mono text-xs">
                        envos@laptop2:~/workspaces/ws_{roomCode.toLowerCase()}$
                      </span>
                      <input
                        type="text"
                        value={terminalInputVal}
                        onChange={(e) => setTerminalInputVal(e.target.value)}
                        placeholder="Type 'npm start', 'ls', 'node -v', 'git status'..."
                        className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-zinc-600"
                      />
                    </form>
                  </div>
                )}

                {bottomTab === "problems" && (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                    No problems have been detected in the workspace.
                  </div>
                )}

                {bottomTab === "output" && (
                  <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                    <div>[EnvOS Build System] Compiler initialized for ws_{roomCode}.</div>
                    <div>[Runner Bridge] Telemetry heartbeat active every 2500ms.</div>
                    <div>[Watchpack] Watching project directory for live changes.</div>
                  </div>
                )}

                {bottomTab === "debug" && (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                    Debugger idle. Run `node --inspect server.js` in terminal to attach debugger.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* E. STATUS BAR AT BOTTOM (VS Code style matching Image 1)             */}
          {/* ===================================================================== */}
          <div className="h-6 px-3 bg-[#03050a] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <GitBranch className="w-3.5 h-3.5" />
                <span>feat/CU-14zg7e2f2rh</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-emerald-400" />
                <span>0</span>
              </span>
              <span>•</span>
              <span className="text-zinc-500">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Laptop 2 ({runnerPing ?? 3}ms)</span>
              </span>
              <span>•</span>
              <span>UTF-8</span>
              <span>•</span>
              <span className="text-cyan-300 font-semibold">
                {activeFile.endsWith(".html")
                  ? "HTML5"
                  : activeFile.endsWith(".css")
                  ? "CSS3"
                  : activeFile.endsWith(".js")
                  ? "JavaScript"
                  : activeFile.endsWith(".ts")
                  ? "TypeScript"
                  : activeFile.endsWith(".json")
                  ? "JSON"
                  : "Markdown"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
