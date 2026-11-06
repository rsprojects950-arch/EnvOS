"use client";

import React, { useState, useEffect, useRef, use, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal as TerminalIcon,
  Code2,
  FolderTree,
  Play,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  Cpu,
  Wifi,
  Radio,
  Users,
  HardDrive,
  Settings,
  Lock,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Volume2,
  Sun,
  Layers,
  Power,
  FileCode,
  Globe,
  MessageSquare,
  FileText,
  Sliders,
  ShieldCheck,
  Search,
  X,
  Folder,
  FolderOpen,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collaborator,
  CollaboratorRole,
  RoomState,
  ROLE_DEFINITIONS,
} from "@/types/workspace";
import {
  getInitialRoomState,
  loadRoomState,
  persistRoomState,
  broadcastRoomEvent,
  subscribeToRoomEvents,
} from "@/lib/room-sync";
import { LobbyRoom } from "@/components/workspace/lobby-room";
import { CollaboratorWaiting } from "@/components/workspace/collaborator-waiting";
import { RoleBadge } from "@/components/workspace/role-badge";
import { ActiveRosterPopover } from "@/components/workspace/active-roster-popover";
import { MacDock } from "@/components/workspace/macos-dock";
import { MacWindow } from "@/components/workspace/macos-window";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import {
  WorkspaceIde,
  INITIAL_WORKSPACE_FILES,
  WorkspaceFiles,
} from "@/components/workspace/workspace-ide";
import { FileExplorer } from "@/components/workspace/file-explorer";
import { RoleMatrixModal } from "@/components/workspace/role-matrix-modal";
import { SafariBrowser } from "@/components/workspace/safari-browser";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  sender: string;
  senderColor?: string;
  isHost?: boolean;
  text: string;
  timestamp: string;
}

function LiquidMetalTile({
  children,
  className,
  containerClassName,
  rounded = "rounded-2xl",
  speed = 0.35,
  onClick,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rounded?: string;
  speed?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      title={title}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.(e as any);
              }
            }
          : undefined
      }
      className={cn(
        "group relative isolate overflow-hidden text-left transform-gpu transition-all duration-200",
        "border border-white/10",
        rounded,
        isClickable &&
          "cursor-pointer select-none hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]",
        containerClassName
      )}
      style={{
        transform: "translateZ(0)",
        backdropFilter: "blur(40px) saturate(190%) contrast(105%)",
        WebkitBackdropFilter: "blur(40px) saturate(190%) contrast(105%)",
        backgroundColor: "rgba(10, 13, 22, 0.72)",
        boxShadow:
          "0 20px 45px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 1.5px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Liquid Metal Border Layer - strictly matches 100% full height & width of tile */}
      <div
        className={cn(
          "absolute inset-0 z-10 overflow-hidden pointer-events-none liquid-metal-border-mask !m-0 !p-[2.5px]",
          rounded
        )}
        style={{ top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", margin: 0 }}
      >
        <LiquidMetal
          colorBack="#888888"
          colorTint="#ffffff"
          speed={speed}
          repetition={4}
          distortion={0.15}
          scale={1}
          className={cn("absolute inset-0 z-0 !m-0", rounded)}
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", margin: 0 }}
        />
      </div>

      {/* Subtle radial caustics lighting */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_65%)] !m-0"
        style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
      />

      {/* Content wrapper receiving padding and internal layout */}
      <div className={cn("relative z-20 pointer-events-auto w-full h-full", className)}>
        {children}
      </div>
    </div>
  );
}

interface WorkspacePageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

function WorkspaceContent({ roomCode }: { roomCode: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isExplicitHost = searchParams?.get("host") === "true";
  const userParam = searchParams?.get("user");
  const roleParam = searchParams?.get("role");

  // Hydration mount tracker to prevent SSR/client mismatch
  const [mounted, setMounted] = useState(false);

  // Load state initialized deterministically
  const [roomState, setRoomState] = useState<RoomState>(() =>
    getInitialRoomState(roomCode)
  );

  // Determine current user
  const isHost = isExplicitHost || (!userParam && !roleParam);
  const [currentUserName, setCurrentUserName] = useState(
    isHost ? "Krishna" : userParam || "Alex Vance"
  );

  useEffect(() => {
    async function resolveAuthUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const resolvedName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0];
          if (resolvedName && (!userParam || userParam === "Krishna")) {
            setCurrentUserName(resolvedName);
          }
        }
      } catch {
        // Fallback to guest name
      }
    }
    resolveAuthUser();
  }, [userParam]);

  // Find or register current member
  const currentMember: Collaborator =
    roomState.collaborators.find(
      (c) => c.name.toLowerCase() === currentUserName.toLowerCase()
    ) || {
      id: isHost ? "user-host-krishna" : `user-${currentUserName.toLowerCase().replace(/\s+/g, "-")}`,
      name: currentUserName,
      role: isHost ? "host" : roleParam === "copilot" ? "copilot" : "spectator",
      status: isHost ? "ready" : roomState.policies.autoAdmit ? "admitted" : "pending",
      isHost,
      avatarColor: isHost ? "from-amber-400 to-yellow-600" : "from-purple-400 to-indigo-600",
      ping: 3.2,
      joinedAt: "Just now",
      runnerClient: isHost ? "Laptop 1 (Master)" : "Web Collaborator Client",
    };

  const currentUserRole: CollaboratorRole = isHost ? "host" : currentMember.role;
  const roleMeta = ROLE_DEFINITIONS[currentUserRole] || ROLE_DEFINITIONS.spectator;

  // Real-time synchronization
  useEffect(() => {
    setMounted(true);
    const initial = loadRoomState(roomCode);
    setRoomState(initial);

    // Auto-register non-host member if not present in roster
    if (!isHost && !initial.collaborators.some((c) => c.name.toLowerCase() === currentUserName.toLowerCase())) {
      const autoMember: Collaborator = {
        id: `user-${Date.now()}`,
        name: currentUserName,
        role: "spectator",
        status: initial.policies.autoAdmit ? "admitted" : "pending",
        avatarColor: "from-blue-400 to-indigo-600",
        ping: 3.4,
        joinedAt: "Just now",
        runnerClient: "Web Peer",
      };

      const updated = {
        ...initial,
        collaborators: [...initial.collaborators, autoMember],
      };
      persistRoomState(updated);
      setRoomState(updated);
      broadcastRoomEvent(roomCode, {
        type: "MEMBER_JOIN",
        payload: autoMember,
      });
    }

    // Subscribe to cross-tab broadcast events
    const unsubscribe = subscribeToRoomEvents(roomCode, (event) => {
      if (event.type === "STATE_UPDATE") {
        setRoomState(event.payload);
      } else if (event.type === "WORKSPACE_START") {
        setRoomState((prev) => ({
          ...prev,
          status: "active",
          launchedAt: event.payload.launchedAt,
        }));
      } else if (event.type === "WORKSPACE_DISCARD") {
        router.push("/dashboard");
      } else if (event.type === "MEMBER_JOIN") {
        setRoomState((prev) => {
          if (prev.collaborators.some((c) => c.id === event.payload.id || c.name === event.payload.name)) {
            return prev;
          }
          return {
            ...prev,
            collaborators: [...prev.collaborators, event.payload],
          };
        });
      } else if (event.type === "CHAT_MESSAGE") {
        setMessages((prev) => {
          if (prev.some((m) => m.id === event.payload.id)) return prev;
          return [...prev, event.payload];
        });
      } else if (event.type === "NOTES_UPDATE") {
        setNotesContent(event.payload.notes);
      }
    });

    return () => unsubscribe();
  }, [roomCode, currentUserName, isHost, router]);

  // Desktop OS State
  const [openWindows, setOpenWindows] = useState<string[]>(["ide"]);
  const [focusedWindow, setFocusedWindow] = useState<string | null>("ide");
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showSpotlightActions, setShowSpotlightActions] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const spotlightInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Spotlight (⌘Space, Ctrl+Space, ⌘K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === " " || e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setShowSpotlight((prev) => {
          const next = !prev;
          if (next) setShowSpotlightActions(false);
          return next;
        });
        setShowAppleMenu(false);
        setShowControlCenter(false);
      } else if (e.key === "Escape") {
        setShowSpotlight(false);
        setShowSpotlightActions(false);
        setShowAppleMenu(false);
        setShowControlCenter(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const spotlightItems = [
    {
      title: "EnvOS IDE",
      description: "Interactive code editor with live Safari preview",
      category: "Application",
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      action: () => toggleWindow("ide"),
      keywords: ["ide", "code", "editor", "files", "studio", "html", "css", "js", "server"],
    },
    {
      title: "Safari Browser",
      description: "Interactive web browser preview on port 3000",
      category: "Application",
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      action: () => toggleWindow("safari"),
      keywords: ["safari", "browser", "web", "preview", "http", "localhost"],
    },
    {
      title: "File Explorer",
      description: "Browse files and directories in ws_" + roomCode,
      category: "Application",
      icon: <Folder className="w-4 h-4 text-cyan-400" />,
      action: () => toggleWindow("finder"),
      keywords: ["finder", "files", "folder", "explorer", "directory", "workspace"],
    },
    {
      title: "System Settings",
      description: "Configure workspace policies and permissions",
      category: "System",
      icon: <Settings className="w-4 h-4 text-purple-400" />,
      action: () => toggleWindow("settings"),
      keywords: ["settings", "preferences", "config", "policies", "pty"],
    },
    {
      title: "Notes & Scratchpad",
      description: "Shared workspace notes and scratchpad",
      category: "Application",
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      action: () => toggleWindow("notes"),
      keywords: ["notes", "pad", "scratchpad", "text", "memo"],
    },
    {
      title: "Room Messages",
      description: "Chat with collaborators in real time",
      category: "Communication",
      icon: <MessageSquare className="w-4 h-4 text-pink-400" />,
      action: () => toggleWindow("messages"),
      keywords: ["chat", "messages", "team", "room"],
    },
    {
      title: "Launchpad",
      description: "View all applications and shortcuts",
      category: "System",
      icon: <Layers className="w-4 h-4 text-cyan-300" />,
      action: () => toggleWindow("launchpad"),
      keywords: ["launchpad", "apps", "menu", "grid"],
    },
    {
      title: `Workspace Room: ${roomCode}`,
      description: `Copy room code ${roomCode} to clipboard`,
      category: "Workspace",
      icon: <Copy className="w-4 h-4 text-cyan-400" />,
      action: () => {
        navigator.clipboard?.writeText(roomCode);
      },
      keywords: ["room", "code", "env", roomCode.toLowerCase(), "share"],
    },
    {
      title: "Waiting Room",
      description: "Return to the lobby and collaborator waiting area",
      category: "Navigation",
      icon: <ArrowLeft className="w-4 h-4 text-amber-400" />,
      action: () => handleReturnToLobby(),
      keywords: ["waiting", "lobby", "leave", "return"],
    },
    {
      title: "Mission Control",
      description: "Go to EnvOS global management dashboard",
      category: "Navigation",
      icon: <Cpu className="w-4 h-4 text-blue-400" />,
      action: () => router.push("/dashboard"),
      keywords: ["dashboard", "mission", "control", "cloud"],
    },
  ];

  const filteredSpotlightItems = spotlightItems.filter((item) => {
    if (!spotlightQuery.trim()) return true;
    const q = spotlightQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
    );
  });

  // Time & Date matching exact top bar format: e.g. "Thu 22 Oct  14:44"
  const [formattedDateTime, setFormattedDateTime] = useState("Thu 22 Oct  14:44");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-GB", { weekday: "short" });
      const dateNum = now.getDate();
      const month = now.toLocaleDateString("en-GB", { month: "short" });
      const timeStr = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setFormattedDateTime(`${day} ${dateNum} ${month}  ${timeStr}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Editor & Terminal State
  const [activeTab, setActiveTab] = useState<"server.js" | "package.json" | "README.md" | ".env">("server.js");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[EnvOS POSIX Kernel v2.4-Tahoe] Sandbox ws_${roomCode} booted.`,
    `Connected to physical runner: Laptop 2 (WS-HOST: 192.168.1.104)`,
    `Duplex WebSocket attached (latency: 3.2ms, zero packet loss)`,
    `Active role: ${roleMeta.label} (${roleMeta.accessLevel})`,
    `Node.js v20.11.0 runtime ready. Type 'npm start' or 'help' below.`,
  ]);
  const [notesContent, setNotesContent] = useState(
    `# Project Workspace Notes (${roomCode})\n\n- Host: Krishna (Laptop 1 Master)\n- Compute Runner: Laptop 2 (WS-HOST)\n- Express HTTP Server port: 3000\n- Collaborative Cursors: Active`
  );
  const notesDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Messages / Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "Krishna",
      senderColor: "from-amber-400 to-yellow-600",
      isHost: true,
      text: `Welcome to room ws_${roomCode}! Cursors and runtime are online.`,
      timestamp: "Just now",
    },
    {
      id: "msg-2",
      sender: "Laptop 2 Runner",
      senderColor: "from-emerald-400 to-teal-600",
      isHost: false,
      text: `Physical compute active on Laptop 2. Duplex PTY connected.`,
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Help & Roles Matrix Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Live Workspace Project Files & Bundle
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFiles>(INITIAL_WORKSPACE_FILES);
  const [isSavingFiles, setIsSavingFiles] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const saveDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Laptop 2 Compute & Storage Runner State
  const [runnerUrl, setRunnerUrl] = useState<string>("http://localhost:5000");
  const [isRunnerConnected, setIsRunnerConnected] = useState<boolean>(false);
  const [runnerPing, setRunnerPing] = useState<number | null>(null);
  const runnerWsRef = useRef<WebSocket | null>(null);

  // Cloud Sync: Workspaces & Workspace Files
  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceFromCloud() {
      try {
        const normalizedRoom = roomCode.toUpperCase();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Ensure workspace row exists in public.workspaces
        const { data: wsData } = await supabase
          .from("workspaces")
          .select("id, room_code, os_state")
          .eq("room_code", normalizedRoom)
          .maybeSingle();

        if (!wsData) {
          await supabase.from("workspaces").insert({
            room_code: normalizedRoom,
            owner_id: user?.id || null,
            name: `EnvOS Workspace ${normalizedRoom}`,
            status: "active",
            os_state: {
              wallpaper: "/OSwallpaper.jpg",
              open_windows: ["ide", "safari"],
              runner_url: runnerUrl,
            },
          });
        } else if (wsData.os_state?.runner_url) {
          setRunnerUrl(wsData.os_state.runner_url);
        } else if (typeof window !== "undefined") {
          const saved = localStorage.getItem("envos_runner_url");
          if (saved) setRunnerUrl(saved);
        }

        if (wsData?.os_state?.notes) {
          setNotesContent(wsData.os_state.notes);
        }
        if (wsData?.os_state?.messages && Array.isArray(wsData.os_state.messages)) {
          setMessages(wsData.os_state.messages);
        }
        if (wsData?.os_state?.open_windows && Array.isArray(wsData.os_state.open_windows)) {
          const filtered = wsData.os_state.open_windows.filter((w: string) => w !== "terminal");
          if (filtered.length > 0) {
            setOpenWindows(filtered);
            setFocusedWindow(filtered[filtered.length - 1]);
          }
        }

        // 2. Load workspace files from public.workspace_files
        const { data: filesData } = await supabase
          .from("workspace_files")
          .select("file_path, content")
          .eq("room_code", normalizedRoom);

        if (!isMounted) return;

        if (filesData && filesData.length > 0) {
          const cloudMap: WorkspaceFiles = {};
          filesData.forEach((row: { file_path: string; content: string }) => {
            cloudMap[row.file_path] = row.content;
          });
          setWorkspaceFiles((prev) => ({
            ...prev,
            ...cloudMap,
          }));
          setLastSavedTime(new Date());
        } else {
          // Seed cloud database with initial default files
          const initialRows = Object.entries(INITIAL_WORKSPACE_FILES).map(
            ([file_path, content]) => ({
              room_code: normalizedRoom,
              file_path,
              content,
              updated_at: new Date().toISOString(),
            })
          );
          await supabase.from("workspace_files").upsert(initialRows, {
            onConflict: "room_code,file_path",
          });
          setLastSavedTime(new Date());
        }
      } catch (err) {
        console.warn("[EnvOS Supabase] Cloud workspace sync notice:", err);
      }
    }

    loadWorkspaceFromCloud();

    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  // Connect duplex WebSocket to Laptop 2 Compute & Storage Runner Node
  useEffect(() => {
    if (!runnerUrl) return;

    let ws: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const connectToRunner = () => {
      try {
        const cleanBase = runnerUrl.replace(/\/+$/, "");
        const wsProtocol = cleanBase.startsWith("https") ? "wss:" : "ws:";
        const wsHost = cleanBase.replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${wsHost}/stream?room=${roomCode}&client=${encodeURIComponent(currentUserName)}`;

        ws = new WebSocket(wsUrl);
        runnerWsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          setIsRunnerConnected(true);
          setTerminalLogs((prev) => [
            ...prev,
            `[EnvOS Duplex Attached] Compute Node: Laptop 2 (${cleanBase})`,
            `[EnvOS Runtime] Pseudo-terminal online. Real OS process streaming active.`,
          ]);

          // Fetch physical disk files from Laptop 2 if present
          fetch(`${cleanBase}/api/workspaces/${roomCode}/files`)
            .then((r) => r.json())
            .then((data) => {
              if (data?.files && Object.keys(data.files).length > 0) {
                setWorkspaceFiles((prev) => ({ ...prev, ...data.files }));
              }
            })
            .catch(() => {});
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "stdout" && typeof msg.data === "string") {
              const lines = msg.data.split(/\r?\n/).filter((l: string) => l.length > 0);
              setTerminalLogs((prev) => [...prev, ...lines]);
            } else if (msg.type === "fs:change" && msg.path) {
              if (msg.event === "unlink") {
                setWorkspaceFiles((prev) => {
                  const copy = { ...prev };
                  delete copy[msg.path];
                  return copy;
                });
              } else if (msg.content !== undefined) {
                setWorkspaceFiles((prev) => ({
                  ...prev,
                  [msg.path]: msg.content,
                }));
              }
            } else if (msg.type === "pong" && msg.clientTimestamp) {
              setRunnerPing(Math.max(1, Math.round(Date.now() - msg.clientTimestamp)));
            }
          } catch {
            if (typeof event.data === "string") {
              setTerminalLogs((prev) => [...prev, event.data]);
            }
          }
        };

        ws.onclose = () => {
          if (isCancelled) return;
          setIsRunnerConnected(false);
          runnerWsRef.current = null;
        };

        ws.onerror = () => {
          if (isCancelled) return;
          setIsRunnerConnected(false);
        };

        // Ping every 4 seconds to measure latency
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
          }
        }, 4000);
      } catch (err) {
        console.warn("[Runner WS] Failed to initiate connection:", err);
      }
    };

    connectToRunner();

    return () => {
      isCancelled = true;
      if (pingInterval) clearInterval(pingInterval);
      if (ws) {
        ws.close();
        runnerWsRef.current = null;
      }
    };
  }, [runnerUrl, roomCode, currentUserName]);

  // Debounced Auto-save to Supabase Cloud and Laptop 2 Physical Storage
  const handleFilesChange = useCallback(
    (updatedFiles: WorkspaceFiles) => {
      setWorkspaceFiles(updatedFiles);
      setIsSavingFiles(true);

      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
      }

      saveDebounceTimer.current = setTimeout(async () => {
        try {
          const normalizedRoom = roomCode.toUpperCase();
          const rows = Object.entries(updatedFiles).map(([file_path, content]) => ({
            room_code: normalizedRoom,
            file_path,
            content,
            updated_at: new Date().toISOString(),
          }));

          // 1. Cloud persistence (Supabase)
          await supabase
            .from("workspace_files")
            .upsert(rows, { onConflict: "room_code,file_path" });

          // 2. Physical SSD persistence (Laptop 2 Runner)
          if (runnerUrl) {
            const cleanUrl = runnerUrl.replace(/\/+$/, "");
            fetch(`${cleanUrl}/api/workspaces/${normalizedRoom}/files`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ files: updatedFiles }),
            }).catch(() => {});
          }

          // Clean up files deleted locally
          const { data: existingRows } = await supabase
            .from("workspace_files")
            .select("file_path")
            .eq("room_code", normalizedRoom);

          if (existingRows) {
            const currentKeys = new Set(Object.keys(updatedFiles));
            const filesToDelete = existingRows
              .filter((r) => !currentKeys.has(r.file_path))
              .map((r) => r.file_path);

            if (filesToDelete.length > 0) {
              await supabase
                .from("workspace_files")
                .delete()
                .eq("room_code", normalizedRoom)
                .in("file_path", filesToDelete);
            }
          }

          setIsSavingFiles(false);
          setLastSavedTime(new Date());
        } catch (err) {
          console.warn("[EnvOS Supabase] File sync error:", err);
          setIsSavingFiles(false);
        }
      }, 750);
    },
    [roomCode, runnerUrl]
  );

  const compiledAppHtml = React.useMemo(() => {
    let html = workspaceFiles["index.html"] || "<h1>No index.html found</h1>";
    const css = workspaceFiles["style.css"] || "";
    const js = workspaceFiles["app.js"] || "";

    const consoleScript = `
      <script>
        (function() {
          var origLog = console.log;
          var origError = console.error;
          var origWarn = console.warn;
          function send(type, args) {
            try {
              window.parent.postMessage({
                type: 'ENVOS_CONSOLE',
                level: type,
                messages: Array.from(args).map(function(a) {
                  try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                  } catch(e) {
                    return String(a);
                  }
                })
              }, '*');
            } catch(e) {}
          }
          console.log = function() { send('log', arguments); origLog.apply(console, arguments); };
          console.error = function() { send('error', arguments); origError.apply(console, arguments); };
          console.warn = function() { send('warn', arguments); origWarn.apply(console, arguments); };
        })();
      </script>
    `;

    if (html.includes("</head>")) {
      html = html.replace("</head>", `<style>${css}</style>${consoleScript}</head>`);
    } else {
      html = `<style>${css}</style>${consoleScript}` + html;
    }

    if (html.includes("</body>")) {
      html = html.replace("</body>", `<script>${js}</script></body>`);
    } else {
      html = html + `<script>${js}</script>`;
    }

    return html;
  }, [workspaceFiles]);

  const handleRunInSafari = () => {
    setOpenWindows((prev) => (prev.includes("safari") ? prev : [...prev, "safari"]));
    setFocusedWindow("safari");
  };

  const toggleWindow = (id: string) => {
    if (id === "launchpad") {
      setShowLaunchpad((prev) => !prev);
      return;
    }
    setOpenWindows((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      if (focusedWindow !== id) {
        return prev;
      }
      return prev.filter((w) => w !== id);
    });
    setFocusedWindow(id);
    setShowAppleMenu(false);
    setShowControlCenter(false);
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w !== id));
    if (focusedWindow === id) {
      setFocusedWindow(null);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (openWindows.includes("messages")) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, openWindows]);

  // Real-time Chat message sender
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: currentUserName,
      senderColor: currentMember.avatarColor,
      isHost,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      Promise.resolve(
        supabase
          .from("workspaces")
          .update({
            os_state: {
              messages: updated.slice(-60),
            },
          })
          .eq("room_code", roomCode.toUpperCase())
      ).catch(() => {});
      return updated;
    });

    broadcastRoomEvent(roomCode, {
      type: "CHAT_MESSAGE",
      payload: newMsg,
    });

    setChatInput("");
  };

  // Real-time collaborative notes change
  const handleNotesChange = (val: string) => {
    setNotesContent(val);

    broadcastRoomEvent(roomCode, {
      type: "NOTES_UPDATE",
      payload: { notes: val },
    });

    if (notesDebounceTimer.current) {
      clearTimeout(notesDebounceTimer.current);
    }
    notesDebounceTimer.current = setTimeout(async () => {
      try {
        await supabase
          .from("workspaces")
          .update({
            os_state: {
              notes: val,
            },
          })
          .eq("room_code", roomCode.toUpperCase());
      } catch (err) {
        console.warn("[Notes Sync] Error saving notes:", err);
      }
    }, 800);
  };

  // Terminal submission and command execution
  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    if (!roleMeta.caps.canExecuteTerminal) {
      setTerminalLogs((prev) => [
        ...prev,
        `[ACCESS DENIED] Your role '${roleMeta.badgeLabel}' is restricted to Read-Only stream. Shell execution is locked.`,
      ]);
      return;
    }

    if (!roomState.policies.allowPty) {
      setTerminalLogs((prev) => [
        ...prev,
        `[POLICY VIOLATION] PTY execution is disabled by Host Krishna in room policy. Commands are suspended.`,
      ]);
      return;
    }

    if (cmd === "clear") {
      setTerminalLogs([]);
      if (runnerWsRef.current && runnerWsRef.current.readyState === WebSocket.OPEN) {
        runnerWsRef.current.send(JSON.stringify({ type: "stdin", data: "clear\r" }));
      }
      return;
    }

    // 1. Live Execution: Forward keystrokes to Laptop 2 node-pty runner
    if (runnerWsRef.current && runnerWsRef.current.readyState === WebSocket.OPEN) {
      setTerminalLogs((prev) => [
        ...prev,
        `${currentUserName.toLowerCase()}@laptop2:~/workspaces/ws_${roomCode}$ ${cmd}`,
      ]);
      runnerWsRef.current.send(JSON.stringify({ type: "stdin", data: cmd + "\r" }));
      return;
    }

    // 2. Offline Fallback (when Laptop 2 runner is not active)
    const newLogs = [
      ...terminalLogs,
      `${currentUserName.toLowerCase()}@laptop2:~/workspaces/ws_${roomCode}$ ${cmd}`,
      `[LAPTOP 2 DISCONNECTED] Command executing in local emulator mode. Connect runner for bare-metal POSIX execution.`,
    ];

    if (cmd === "help") {
      newLogs.push("Available commands: npm start, ls, pwd, uname -a, clear, status, ping, env, roles");
    } else if (cmd === "roles") {
      newLogs.push(`Active Room Roster (${roomState.collaborators.length} peers):`);
      roomState.collaborators.forEach((c) => {
        newLogs.push(`- ${c.name}: [${c.role.toUpperCase()}] (${c.status})`);
      });
    } else if (cmd === "npm start" || cmd === "node server.js") {
      newLogs.push("Starting HTTP Server on port 3000 on Laptop 2 runner...");
      newLogs.push("✓ Ready: http://localhost:3000/ (Tunnel: https://ws-" + roomCode.toLowerCase() + ".envos.sh)");
    } else if (cmd === "ls") {
      newLogs.push(Object.keys(workspaceFiles).join("  ") + "  node_modules/");
    } else if (cmd === "pwd") {
      newLogs.push(`/home/envos/workspaces/ws_${roomCode}`);
    } else if (cmd === "status") {
      newLogs.push(`Runner: Laptop 2 | CPU: 12.1% | Mem: 1.8GB / 16GB | Active Role: ${roleMeta.badgeLabel}`);
    } else if (cmd === "env") {
      if (roomState.policies.maskSecrets && !isHost) {
        newLogs.push("NODE_ENV=production");
        newLogs.push("API_KEY=•••••••••••••••• (Masked by Host Policy)");
        newLogs.push("DATABASE_URL=postgres://••••:••••@db.internal:5432/sandbox");
      } else {
        newLogs.push("NODE_ENV=production");
        newLogs.push("API_KEY=sk_live_envos_9814890123");
        newLogs.push("DATABASE_URL=postgres://envos:secret99@db.internal:5432/sandbox");
      }
    } else {
      newLogs.push(`Executed '${cmd}' on Laptop 2 emulator.`);
    }

    setTerminalLogs(newLogs);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    executeCommand(terminalInput);
    setTerminalInput("");
  };

  // Host launches the desktop
  const handleHostLaunch = () => {
    const launchedTime = Date.now();
    const updated: RoomState = {
      ...roomState,
      status: "active",
      launchedAt: launchedTime,
    };
    persistRoomState(updated);
    setRoomState(updated);
    broadcastRoomEvent(roomCode, {
      type: "WORKSPACE_START",
      payload: { roomCode, launchedAt: launchedTime },
    });
  };

  // Host discards the room
  const handleHostDiscard = () => {
    const updated: RoomState = {
      ...roomState,
      status: "discarded",
    };
    persistRoomState(updated);
    broadcastRoomEvent(roomCode, {
      type: "WORKSPACE_DISCARD",
      payload: { roomCode },
    });
    router.push("/dashboard");
  };

  // Host returns room to lobby
  const handleReturnToLobby = () => {
    const updated: RoomState = {
      ...roomState,
      status: "lobby",
    };
    persistRoomState(updated);
    setRoomState(updated);
    broadcastRoomEvent(roomCode, {
      type: "STATE_UPDATE",
      payload: updated,
    });
  };

  const handleUpdateRole = (memberId: string, newRole: CollaboratorRole) => {
    const updatedCollabs = roomState.collaborators.map((c) =>
      c.id === memberId ? { ...c, role: newRole } : c
    );
    const updated: RoomState = {
      ...roomState,
      collaborators: updatedCollabs,
    };
    persistRoomState(updated);
    setRoomState(updated);
    broadcastRoomEvent(roomCode, {
      type: "STATE_UPDATE",
      payload: updated,
    });
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative min-h-screen w-full bg-[#05060A] text-zinc-100 font-manrope flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-manrope text-zinc-400 tracking-wider">
            SYNCHRONIZING WORKSPACE...
          </span>
        </div>
      </div>
    );
  }

  // 1. RENDER WAITING ROOM / LOBBY IF STATUS IS "LOBBY"
  if (roomState.status === "lobby") {
    if (isHost) {
      return (
        <LobbyRoom
          roomState={roomState}
          onUpdateState={(newState) => {
            persistRoomState(newState);
            setRoomState(newState);
            broadcastRoomEvent(roomCode, {
              type: "STATE_UPDATE",
              payload: newState,
            });
          }}
          onLaunchWorkspace={handleHostLaunch}
          onDiscardRoom={handleHostDiscard}
        />
      );
    } else if (currentMember.status === "admitted" || currentMember.status === "ready") {
      return (
        <LobbyRoom
          roomState={roomState}
          onUpdateState={(newState) => {
            persistRoomState(newState);
            setRoomState(newState);
            broadcastRoomEvent(roomCode, {
              type: "STATE_UPDATE",
              payload: newState,
            });
          }}
          isMemberView={true}
          currentMemberId={currentMember.id}
          onLeaveRoom={() => router.push("/dashboard")}
        />
      );
    } else {
      return (
        <CollaboratorWaiting
          roomState={roomState}
          currentMember={currentMember}
        />
      );
    }
  }

  // 2. RENDER ACTIVE DESKTOP CANVAS IF STATUS IS "ACTIVE" (matching screenshot)
  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none bg-black text-white font-manrope"
      style={{
        backgroundImage: "url('/OSwallpaper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onClick={() => {
        if (showAppleMenu) setShowAppleMenu(false);
        if (showControlCenter) setShowControlCenter(false);
        if (showSpotlight) {
          setShowSpotlight(false);
          setShowSpotlightActions(false);
        }
      }}
    >

      {/* MACOS TOP MENU BAR (matching user's attached screenshot) */}
      <header className="fixed top-0 inset-x-0 h-7 bg-black/40 backdrop-blur-2xl border-b border-white/10 px-4 flex items-center justify-between text-[13px] text-white select-none z-40 font-manrope">
        {/* Left: EnvOS File Edit View Go Window Help */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* EnvOS with menu dropdown */}
          <div className="relative">
            <span
              className="font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowAppleMenu(!showAppleMenu);
                setShowControlCenter(false);
              }}
            >
              EnvOS
            </span>

            {/* EnvOS / Workspace Menu Dropdown */}
            <AnimatePresence>
              {showAppleMenu && (
                <motion.div
                  key="apple-menu-flyout"
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-7 left-0 w-60 rounded-xl bg-black/85 backdrop-blur-2xl border border-white/15 p-1.5 shadow-2xl text-xs text-zinc-200 z-50 flex flex-col gap-0.5 font-manrope"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 font-semibold text-white border-b border-white/10 flex items-center justify-between">
                    <span>About EnvOS</span>
                    <span className="text-[10px] font-manrope text-cyan-400">v2.4 Tahoe</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleWindow("ide");
                      setShowAppleMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-white/15 transition-colors flex items-center justify-between"
                  >
                    <span>Open EnvOS IDE</span>
                    <span className="text-zinc-500 font-manrope text-[10px]">⌥I</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleWindow("settings");
                      setShowAppleMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-white/15 transition-colors flex items-center justify-between"
                  >
                    <span>System Settings...</span>
                    <span className="text-zinc-500 font-manrope text-[10px]">⌘,</span>
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    onClick={() => {
                      handleReturnToLobby();
                      setShowAppleMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-white/15 transition-colors text-amber-300 flex items-center justify-between"
                  >
                    <span>Return to Waiting Room</span>
                    <span className="text-[10px] font-manrope">LOBBY</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-white/15 transition-colors"
                  >
                    Mission Control
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    onClick={handleHostDiscard}
                    className="w-full px-3 py-1.5 text-left rounded-lg hover:bg-rose-500/20 text-rose-300 transition-colors"
                  >
                    Shut Down Workspace
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span
            className="font-normal text-white/90 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleWindow("finder")}
          >
            File
          </span>
          <span
            className="font-normal text-white/90 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsHelpOpen(true)}
          >
            Help
          </span>
        </div>

        {/* Right: Wi-Fi, Spotlight, Control Center, Thu 22 Oct 14:44 */}
        <div className="flex items-center gap-3.5 sm:gap-4 text-white/90">

          {/* Wi-Fi */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 20h.01" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M5 13a10 10 0 0 1 14 0" />
            <path d="M1.5 9.5a15 15 0 0 1 21 0" />
          </svg>

          {/* Spotlight Search Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSpotlight((prev) => {
                const next = !prev;
                if (next) setShowSpotlightActions(false);
                return next;
              });
              setShowAppleMenu(false);
              setShowControlCenter(false);
            }}
            className="p-1 rounded-md hover:bg-white/10 cursor-pointer transition-colors flex items-center text-white/90 hover:text-white"
            title="Spotlight Search (⌘Space)"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Control Center Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowControlCenter(!showControlCenter);
                setShowAppleMenu(false);
              }}
              className="p-0.5 cursor-pointer hover:opacity-80 transition-opacity flex items-center"
              title="Control Center"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="7" rx="3.5" />
                <circle cx="7" cy="7.5" r="2" fill="currentColor" />
                <rect x="2" y="13" width="20" height="7" rx="3.5" />
                <circle cx="17" cy="16.5" r="2" fill="currentColor" />
              </svg>
            </button>

            {/* Control Center Flyout */}
            <AnimatePresence>
              {showControlCenter && (
                <motion.div
                  key="control-center-flyout"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-8 right-0 w-80 text-xs text-zinc-200 z-50 flex flex-col gap-2 font-manrope"
                  onClick={(e) => e.stopPropagation()}
                >

                  {/* Room Info Tile */}
                  <LiquidMetalTile className="p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Workspace Room:</span>
                      <span className="font-manrope font-bold text-white tracking-wider">
                        {roomCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Your Role:</span>
                      <span className="text-white font-medium">
                        {ROLE_DEFINITIONS[currentUserRole]?.label || "Host"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Collaborators:</span>
                      <span className="text-white font-medium">
                        {roomState.collaborators.length} Online
                      </span>
                    </div>
                  </LiquidMetalTile>

                  {/* Quick Toggles */}
                  <div className="grid grid-cols-2 gap-2">
                    <LiquidMetalTile
                      onClick={() => {
                        toggleWindow("settings");
                        setShowControlCenter(false);
                      }}
                      className="py-2.5 px-3 flex items-center justify-center text-center"
                    >
                      <span className="font-medium text-white tracking-tight">Settings</span>
                    </LiquidMetalTile>
                    <LiquidMetalTile
                      onClick={() => {
                        toggleWindow("ide");
                        setShowControlCenter(false);
                      }}
                      className="py-2.5 px-3 flex items-center justify-center text-center"
                    >
                      <span className="font-medium text-white tracking-tight">EnvOS IDE</span>
                    </LiquidMetalTile>
                  </div>

                  {/* Return to Lobby / Mission Control */}
                  <div className="grid grid-cols-2 gap-2">
                    <LiquidMetalTile
                      onClick={() => {
                        handleReturnToLobby();
                        setShowControlCenter(false);
                      }}
                      className="py-2.5 px-3 flex items-center justify-center text-center"
                    >
                      <span className="font-medium text-zinc-200">Waiting Room</span>
                    </LiquidMetalTile>
                    <LiquidMetalTile
                      onClick={() => router.push("/dashboard")}
                      className="py-2.5 px-3 flex items-center justify-center text-center"
                    >
                      <span className="font-medium text-white">Dashboard</span>
                    </LiquidMetalTile>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date and Time (exact Thu 22 Oct 14:44 format) */}
          <span className="font-manrope font-medium tracking-tight text-white select-none whitespace-nowrap">
            {formattedDateTime}
          </span>
        </div>
      </header>

      {/* FULLSCREEN LAUNCHPAD OVERLAY */}
      <AnimatePresence>
        {showLaunchpad && (
          <motion.div
            key="launchpad-overlay"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-3xl flex flex-col items-center justify-center p-8 select-none"
            onClick={() => setShowLaunchpad(false)}
          >
            <div
              className="max-w-3xl w-full grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                {
                  id: "ide",
                  name: "EnvOS IDE",
                  icon: <Code2 className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />,
                },
                {
                  id: "safari",
                  name: "Safari Web",
                  icon: <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />,
                },
                {
                  id: "terminal",
                  name: "Terminal",
                  icon: <TerminalIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />,
                },
                {
                  id: "settings",
                  name: "System Settings",
                  icon: <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />,
                },
                {
                  id: "notes",
                  name: "Notes",
                  icon: <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />,
                },
                {
                  id: "messages",
                  name: "Team Chat",
                  icon: <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    toggleWindow(item.id);
                    setShowLaunchpad(false);
                  }}
                  className="flex flex-col items-center gap-2.5 group cursor-pointer focus:outline-none"
                >
                  <LiquidMetalTile
                    rounded="rounded-2xl"
                    speed={0.4}
                    containerClassName="w-16 h-16 sm:w-20 sm:h-20 shrink-0 shadow-2xl group-hover:scale-110 group-active:scale-95 group-hover:border-white/30 transition-transform duration-200 pointer-events-none"
                    className="h-full w-full flex items-center justify-center text-white"
                  >
                    {item.icon}
                  </LiquidMetalTile>
                  <span className="text-xs text-zinc-300 group-hover:text-white font-medium font-manrope transition-colors">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING MACOS WINDOWS (Finder, Code, Terminal, Safari, Settings, Notes, Messages) */}
      <AnimatePresence>
        {/* 1. ENVOS IDE WINDOW */}
        {openWindows.includes("ide") && (
          <MacWindow
            key="window-ide"
            id="ide"
            title={`EnvOS IDE — ws_${roomCode} (Laptop 2 Runner)`}
            icon={<Code2 className="w-3.5 h-3.5 text-cyan-400" />}
            isOpen={true}
            onClose={() => closeWindow("ide")}
            onFocus={() => setFocusedWindow("ide")}
            zIndex={focusedWindow === "ide" ? 35 : 25}
            defaultWidth="max-w-5xl w-[92vw]"
            defaultHeight="h-[620px]"
          >
            <WorkspaceIde
              roomCode={roomCode}
              files={workspaceFiles}
              onChangeFiles={handleFilesChange}
              onRunInSafari={handleRunInSafari}
              canEdit={roleMeta.caps.canEditCode}
              isSaving={isSavingFiles}
              lastSaved={lastSavedTime}
              terminalLogs={terminalLogs}
              onTerminalSubmit={executeCommand}
              isRunnerConnected={isRunnerConnected}
              runnerPing={runnerPing}
            />
          </MacWindow>
        )}

        {/* 2. FINDER / FILE EXPLORER WINDOW */}
        {openWindows.includes("finder") && (
          <MacWindow
            key="window-finder"
            id="finder"
            title={`Workspace Files — ws_${roomCode}`}
            icon={<Folder className="w-3.5 h-3.5 text-cyan-400" />}
            isOpen={true}
            onClose={() => closeWindow("finder")}
            onFocus={() => setFocusedWindow("finder")}
            zIndex={focusedWindow === "finder" ? 35 : 25}
            defaultWidth="max-w-4xl w-[88vw]"
            defaultHeight="h-[520px]"
          >
            <FileExplorer
              roomCode={roomCode}
              files={workspaceFiles}
              onOpenFileInIde={(fileName) => {
                if (!openWindows.includes("ide")) {
                  setOpenWindows((prev) => [...prev, "ide"]);
                }
                setFocusedWindow("ide");
              }}
              onDeleteFile={(fileName) => {
                const nextFiles = { ...workspaceFiles };
                delete nextFiles[fileName];
                handleFilesChange(nextFiles);
              }}
              onCreateFile={(fileName) => {
                const nextFiles = {
                  ...workspaceFiles,
                  [fileName]: fileName.endsWith(".json")
                    ? "{\n  \n}"
                    : fileName.endsWith(".html")
                    ? "<!DOCTYPE html>\n<html>\n<head></head>\n<body></body>\n</html>"
                    : `// ${fileName}\n`,
                };
                handleFilesChange(nextFiles);
              }}
            />
          </MacWindow>
        )}

        {/* 3. SAFARI BROWSER PREVIEW */}
        {openWindows.includes("safari") && (
          <MacWindow
            key="window-safari"
            id="safari"
            title="Safari — Local Preview (http://localhost:3000)"
            icon={<Globe className="w-3.5 h-3.5 text-blue-400" />}
            isOpen={true}
            onClose={() => closeWindow("safari")}
            onFocus={() => setFocusedWindow("safari")}
            zIndex={focusedWindow === "safari" ? 35 : 25}
            defaultWidth="max-w-5xl w-[90vw]"
            defaultHeight="h-[580px]"
          >
            <SafariBrowser
              compiledHtml={compiledAppHtml}
              roomCode={roomCode}
              onOpenIde={() => toggleWindow("ide")}
            />
          </MacWindow>
        )}

        {/* 4. SYSTEM SETTINGS WINDOW */}
        {openWindows.includes("settings") && (
          <MacWindow
            key="window-settings"
            id="settings"
            title="System Settings — EnvOS Room Configuration"
            icon={<Settings className="w-3.5 h-3.5 text-zinc-400" />}
            isOpen={true}
            onClose={() => closeWindow("settings")}
            onFocus={() => setFocusedWindow("settings")}
            zIndex={focusedWindow === "settings" ? 35 : 25}
            defaultWidth="max-w-2xl w-[85vw]"
            defaultHeight="h-[500px]"
          >
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-zinc-200 font-manrope">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 font-manrope">Room Policies</h3>
                <p className="text-zinc-400 font-manrope">Configure security and execution permissions for ws_{roomCode}.</p>
              </div>

              <div className="space-y-3 font-manrope">
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Allow PTY Execution</div>
                    <div className="text-zinc-400 text-[11px]">Enables interactive bash execution on Laptop 2 runner</div>
                  </div>
                  <button
                    type="button"
                    disabled={!isHost}
                    onClick={() => {
                      const updated = {
                        ...roomState,
                        policies: { ...roomState.policies, allowPty: !roomState.policies.allowPty },
                      };
                      persistRoomState(updated);
                      setRoomState(updated);
                      broadcastRoomEvent(roomCode, { type: "STATE_UPDATE", payload: updated });
                    }}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                      roomState.policies.allowPty ? "bg-cyan-500" : "bg-zinc-700"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                        roomState.policies.allowPty ? "left-5" : "left-1"
                      )}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Mask Environment Secrets</div>
                    <div className="text-zinc-400 text-[11px]">Hides sensitive keys from Editor B & C tiers</div>
                  </div>
                  <button
                    type="button"
                    disabled={!isHost}
                    onClick={() => {
                      const updated = {
                        ...roomState,
                        policies: { ...roomState.policies, maskSecrets: !roomState.policies.maskSecrets },
                      };
                      persistRoomState(updated);
                      setRoomState(updated);
                      broadcastRoomEvent(roomCode, { type: "STATE_UPDATE", payload: updated });
                    }}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                      roomState.policies.maskSecrets ? "bg-cyan-500" : "bg-zinc-700"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                        roomState.policies.maskSecrets ? "left-5" : "left-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Collaborator Roster in Settings */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2 font-manrope">Connected Collaborators</h3>
                <div className="space-y-2 font-manrope">
                  {roomState.collaborators.map((c, cIdx) => (
                    <div
                      key={c.id || `settings-collab-${cIdx}`}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-xs text-white font-manrope", c.avatarColor)}>
                          {c.name.slice(0, 1)}
                        </div>
                        <div>
                          <span className="font-semibold text-white">{c.name}</span>
                          {c.isHost && <span className="ml-2 text-[10px] text-amber-400 font-manrope">(Host)</span>}
                        </div>
                      </div>
                      <RoleBadge role={c.role} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MacWindow>
        )}

        {/* 5. NOTES WINDOW */}
        {openWindows.includes("notes") && (
          <MacWindow
            key="window-notes"
            id="notes"
            title="Notes — Workspace Scratchpad"
            icon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
            isOpen={true}
            onClose={() => closeWindow("notes")}
            onFocus={() => setFocusedWindow("notes")}
            zIndex={focusedWindow === "notes" ? 35 : 25}
            defaultWidth="max-w-xl w-[80vw]"
            defaultHeight="h-[460px]"
          >
            <div className="flex-1 flex flex-col bg-[#1c1917]/95 text-zinc-100 font-manrope overflow-hidden">
              <div className="px-3.5 py-2 bg-amber-950/30 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300/80">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Real-time Sync Active</span>
                </div>
                <span>{notesContent.length} chars • {notesContent.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                value={notesContent}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Type workspace notes, scratchpad items, or architecture plans..."
                className="flex-1 p-4 bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed text-amber-100/90 placeholder:text-amber-200/30 selection:bg-amber-500/30"
              />
              <div className="px-3 py-1.5 bg-black/30 border-t border-white/5 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Shared with all room collaborators</span>
                <span>Auto-saved to cloud</span>
              </div>
            </div>
          </MacWindow>
        )}

        {/* 6. MESSAGES WINDOW */}
        {openWindows.includes("messages") && (
          <MacWindow
            key="window-messages"
            id="messages"
            title={`Messages — Room ${roomCode} (${roomState.collaborators.length} online)`}
            icon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
            isOpen={true}
            onClose={() => closeWindow("messages")}
            onFocus={() => setFocusedWindow("messages")}
            zIndex={focusedWindow === "messages" ? 35 : 25}
            defaultWidth="max-w-md w-[85vw]"
            defaultHeight="h-[480px]"
          >
            <div className="flex-1 flex flex-col bg-zinc-950/95 text-xs font-manrope overflow-hidden">
              {/* Header Info */}
              <div className="px-3.5 py-2 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-zinc-200 font-medium">Team Chat</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{roomState.collaborators.length} collaborators</span>
              </div>

              {/* Messages list */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                {messages.map((msg) => {
                  const isMe = msg.sender.toLowerCase() === currentUserName.toLowerCase();
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col gap-1 max-w-[85%]",
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className={cn("font-semibold", isMe ? "text-cyan-300" : "text-zinc-300")}>
                          {isMe ? "You" : msg.sender}
                        </span>
                        {msg.isHost && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Host
                          </span>
                        )}
                        <span className="text-zinc-500 font-mono text-[9px]">{msg.timestamp}</span>
                      </div>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-xs leading-relaxed break-words",
                          isMe
                            ? "bg-cyan-600 text-white rounded-tr-none shadow-md"
                            : "bg-white/[0.08] text-zinc-100 rounded-tl-none border border-white/10 shadow-sm"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input form */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-black/40 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message to collaborators..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 text-xs font-manrope"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </MacWindow>
        )}
        {/* 6. SPOTLIGHT SEARCH (Centered in screen, matching macOS Spotlight) */}
        {showSpotlight && (
          <div
            key="window-spotlight"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[22vh] px-4 pointer-events-auto"
            onClick={() => {
              setShowSpotlight(false);
              setShowSpotlightActions(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Horizontal Bar: Search Pill + 4 Circular Action Buttons */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="flex items-center gap-2.5 sm:gap-3 w-full justify-center"
              >
                {/* Search Pill */}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="flex-1 max-w-lg"
                >
                  <LiquidMetalTile
                    rounded="rounded-full"
                    onClick={() => {
                      setShowSpotlightActions(true);
                      spotlightInputRef.current?.focus();
                    }}
                    containerClassName="w-full h-[52px] sm:h-[56px] shadow-[0_24px_60px_rgba(0,0,0,0.8)] cursor-text"
                    className="h-full px-5 flex items-center gap-3.5"
                  >
                    <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                    <input
                      ref={spotlightInputRef}
                      type="text"
                      value={spotlightQuery}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSpotlightActions(true);
                      }}
                      onChange={(e) => {
                        setSpotlightQuery(e.target.value);
                        if (!showSpotlightActions) setShowSpotlightActions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && filteredSpotlightItems.length > 0) {
                          filteredSpotlightItems[0].action();
                          setShowSpotlight(false);
                          setShowSpotlightActions(false);
                        }
                      }}
                      placeholder="Spotlight Search"
                      className="w-full bg-transparent text-white text-base sm:text-lg font-manrope placeholder:text-zinc-500 focus:outline-none"
                    />
                    {spotlightQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpotlightQuery("");
                          spotlightInputRef.current?.focus();
                        }}
                        className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </LiquidMetalTile>
                </motion.div>

                {/* 4 Quick Circular Action Buttons (Animated Sliding Entrance) */}
                <AnimatePresence>
                  {showSpotlightActions && (
                    <motion.div
                      key="spotlight-quick-actions"
                      layout
                      initial={{ opacity: 0, x: -24, scale: 0.85, width: 0 }}
                      animate={{ opacity: 1, x: 0, scale: 1, width: "auto" }}
                      exit={{ opacity: 0, x: -24, scale: 0.85, width: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 26,
                        mass: 0.8,
                      }}
                      className="flex items-center gap-2 sm:gap-2.5 shrink-0 overflow-hidden"
                    >
                      {/* 1. App Store / Applications */}
                      <motion.div
                        initial={{ opacity: 0, x: -16, scale: 0.7 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25, delay: 0.02 }}
                      >
                        <LiquidMetalTile
                          rounded="rounded-full"
                          onClick={() => {
                            toggleWindow("launchpad");
                            setShowSpotlight(false);
                            setShowSpotlightActions(false);
                          }}
                          title="Applications & Launchpad"
                          containerClassName="w-[52px] sm:w-[56px] h-[52px] sm:h-[56px] shrink-0 shadow-2xl hover:scale-105 active:scale-95"
                          className="h-full flex items-center justify-center text-white/90 hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 22 22 22" />
                            <line x1="6" y1="14" x2="18" y2="14" />
                          </svg>
                        </LiquidMetalTile>
                      </motion.div>

                      {/* 2. Folder / Workspace Files */}
                      <motion.div
                        initial={{ opacity: 0, x: -16, scale: 0.7 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25, delay: 0.06 }}
                      >
                        <LiquidMetalTile
                          rounded="rounded-full"
                          onClick={() => {
                            toggleWindow("ide");
                            setShowSpotlight(false);
                            setShowSpotlightActions(false);
                          }}
                          title="EnvOS IDE"
                          containerClassName="w-[52px] sm:w-[56px] h-[52px] sm:h-[56px] shrink-0 shadow-2xl hover:scale-105 active:scale-95"
                          className="h-full flex items-center justify-center text-white/90 hover:text-white"
                        >
                          <Code2 className="w-5 h-5 text-white" />
                        </LiquidMetalTile>
                      </motion.div>

                      {/* 3. Layers / Windows */}
                      <motion.div
                        initial={{ opacity: 0, x: -16, scale: 0.7 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25, delay: 0.10 }}
                      >
                        <LiquidMetalTile
                          rounded="rounded-full"
                          onClick={() => {
                            toggleWindow("settings");
                            setShowSpotlight(false);
                            setShowSpotlightActions(false);
                          }}
                          title="Settings & Policies"
                          containerClassName="w-[52px] sm:w-[56px] h-[52px] sm:h-[56px] shrink-0 shadow-2xl hover:scale-105 active:scale-95"
                          className="h-full flex items-center justify-center text-white/90 hover:text-white"
                        >
                          <Layers className="w-5 h-5 text-white" />
                        </LiquidMetalTile>
                      </motion.div>

                      {/* 4. Documents / Notes */}
                      <motion.div
                        initial={{ opacity: 0, x: -16, scale: 0.7 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25, delay: 0.14 }}
                      >
                        <LiquidMetalTile
                          rounded="rounded-full"
                          onClick={() => {
                            toggleWindow("notes");
                            setShowSpotlight(false);
                            setShowSpotlightActions(false);
                          }}
                          title="Notes & Scratchpad"
                          containerClassName="w-[52px] sm:w-[56px] h-[52px] sm:h-[56px] shrink-0 shadow-2xl hover:scale-105 active:scale-95"
                          className="h-full flex items-center justify-center text-white/90 hover:text-white"
                        >
                          <FileText className="w-5 h-5 text-white" />
                        </LiquidMetalTile>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Live Search Results Dropdown */}
              {spotlightQuery.trim().length > 0 && (
                <LiquidMetalTile
                  rounded="rounded-2xl"
                  containerClassName="w-full max-w-lg mt-3 shadow-2xl"
                  className="p-2 max-h-72 overflow-y-auto space-y-1 font-manrope"
                >
                  {filteredSpotlightItems.length > 0 ? (
                    filteredSpotlightItems.map((item, idx) => (
                      <button
                        key={`spotlight-item-${idx}-${item.title}`}
                        type="button"
                        onClick={() => {
                          item.action();
                          setShowSpotlight(false);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.title}</div>
                            <div className="text-xs text-zinc-400">{item.description}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-manrope px-2 py-0.5 rounded bg-white/10 text-zinc-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-zinc-500 text-xs font-manrope">
                      No results found for "{spotlightQuery}"
                    </div>
                  )}
                </LiquidMetalTile>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM FLOATING MACOS GLASS DOCK (matching screenshot) */}
      <div className="fixed bottom-3.5 inset-x-0 flex justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <MacDock
            onAppClick={toggleWindow}
            openApps={openWindows}
          />
        </div>
      </div>

      {/* WORKSPACE OPTIONS & ROLE-WISE ACCESS MATRIX MODAL (Triggered by Help in Top Bar) */}
      <RoleMatrixModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default function WorkspaceDesktopPage({ params }: WorkspacePageProps) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams?.roomCode?.toUpperCase() || "ENV789";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-screen bg-[#05060A] flex items-center justify-center text-zinc-400 font-mono text-xs">
          Loading EnvOS Sandbox ws_{roomCode}...
        </div>
      }
    >
      <WorkspaceContent roomCode={roomCode} />
    </Suspense>
  );
}
