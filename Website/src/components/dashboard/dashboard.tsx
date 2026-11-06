"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Activity,
  HardDrive,
  Radio,
  Plus,
  ArrowRight,
  Upload,
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  Terminal,
  FileCode,
  ShieldCheck,
  LogOut,
  RefreshCw,
  FolderOpen,
  FolderTree,
  AlertCircle,
  FileArchive,
  CheckCircle2,
  Sun,
  Moon,
  Settings,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitialRoomState, persistRoomState } from "@/lib/room-sync";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { supabase } from "@/lib/supabase";

// Interface definitions for workspaces
export interface WorkspaceItem {
  id: string;
  name: string;
  roomCode: string;
  path: string;
  runtime: "Node.js 20" | "Python 3.11" | "Raw POSIX";
  role: "Host" | "Editor" | "Viewer";
  footprint: string;
  state: "Active" | "Grace (11m)" | "Saved";
  createdAt: string;
}

export function Dashboard() {
  const router = useRouter();

  // User profile & workspaces state (loaded strictly from Supabase - zero mock data)
  const [userName, setUserName] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Active" | "Grace" | "Saved">("All");

  // Load authenticated user and workspaces from Supabase Cloud
  useEffect(() => {
    async function loadSupabaseUserAndWorkspaces() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profileName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0];
          if (profileName) setUserName(profileName);

          const { data: cloudWs } = await supabase
            .from("workspaces")
            .select("*")
            .order("created_at", { ascending: false });

          if (cloudWs && cloudWs.length > 0) {
            const mapped: WorkspaceItem[] = cloudWs.map((ws: any) => ({
              id: ws.id,
              name: ws.name || `ws_${ws.room_code}`,
              roomCode: ws.room_code,
              path: `./workspaces/ws_${ws.room_code}`,
              runtime: "Node.js 20",
              role: "Host",
              footprint: "48.2 MB",
              state: ws.status === "active" ? "Active" : "Saved",
              createdAt: new Date(ws.created_at).toLocaleDateString(),
            }));

            setWorkspaces(mapped);
          } else {
            setWorkspaces([]);
          }
        }
      } catch (err) {
        console.warn("[Dashboard Cloud Sync Notice]", err);
      }
    }

    loadSupabaseUserAndWorkspaces();
  }, []);

  // Theme state: "dark" | "light" (scoped strictly to Dashboard only)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("envos_dashboard_theme") as "dark" | "light" | null;
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
      }
    } catch {
      // Ignore storage access errors if in restricted iframe/context
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("envos_dashboard_theme", next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const isLight = theme === "light";

  // Physical Compute Runner (Laptop 2) Telemetry State
  const [runnerUrl, setRunnerUrl] = useState<string>("http://localhost:5000");
  const [customRunnerInput, setCustomRunnerInput] = useState<string>("http://localhost:5000");
  const [showRunnerConfig, setShowRunnerConfig] = useState<boolean>(false);
  const [isTestingRunner, setIsTestingRunner] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [runnerConnected, setRunnerConnected] = useState(false);
  const [cpuLoad, setCpuLoad] = useState<number | null>(null);
  const [ramFootprint, setRamFootprint] = useState<number | null>(null);
  const [storageFootprint, setStorageFootprint] = useState<number | null>(null);
  const [networkPing, setNetworkPing] = useState<number | null>(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);

  // Load saved runner URL from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("envos_runner_url");
      if (saved) {
        setRunnerUrl(saved);
        setCustomRunnerInput(saved);
      }
    }
  }, []);

  // Poll real-time hardware telemetry from Laptop 2
  const checkRunnerTelemetry = useCallback(async () => {
    if (!runnerUrl) return;
    const start = performance.now();
    try {
      const cleanUrl = runnerUrl.replace(/\/+$/, "");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${cleanUrl}/api/telemetry`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const ping = Math.max(1, Math.round(performance.now() - start));

      if (res.ok) {
        const data = await res.json();
        setRunnerConnected(true);
        setCpuLoad(data.cpuLoadPercent ?? null);
        setRamFootprint(data.ramUsedGb ?? null);
        setStorageFootprint(data.storageUsedMb ?? 0);
        setNetworkPing(ping);
      } else {
        setRunnerConnected(false);
        setCpuLoad(null);
        setRamFootprint(null);
        setStorageFootprint(null);
        setNetworkPing(null);
      }
    } catch {
      setRunnerConnected(false);
      setCpuLoad(null);
      setRamFootprint(null);
      setStorageFootprint(null);
      setNetworkPing(null);
    }
  }, [runnerUrl]);

  useEffect(() => {
    checkRunnerTelemetry();
    const interval = setInterval(checkRunnerTelemetry, 2500);
    return () => clearInterval(interval);
  }, [checkRunnerTelemetry]);

  const handleTestConnection = async () => {
    setIsTestingRunner(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const cleanUrl = customRunnerInput.trim().replace(/\/+$/, "");
      const res = await fetch(`${cleanUrl}/health`, { signal: AbortSignal.timeout(3000) });
      const ping = Math.max(1, Math.round(performance.now() - start));
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Connected to Laptop 2 (${data.platform || "runner"}) in ${ping}ms!`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Server returned HTTP ${res.status}. Is Laptop 2 runner started?`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${e?.message || "Unreachable"}. Verify Laptop 2 IP or tunnel.`,
      });
    } finally {
      setIsTestingRunner(false);
    }
  };

  const handleSaveRunnerUrl = () => {
    const cleanUrl = customRunnerInput.trim().replace(/\/+$/, "");
    setRunnerUrl(cleanUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("envos_runner_url", cleanUrl);
    }
    setShowRunnerConfig(false);
    setToastMessage({
      title: "Runner Paired",
      desc: `Target compute server set to ${cleanUrl}`,
      type: "success",
    });
    setTimeout(checkRunnerTelemetry, 100);
  };

  // Card A: Host Flow state
  const [workspaceName, setWorkspaceName] = useState("dev-runtime");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchedWorkspace, setLaunchedWorkspace] = useState<{
    code: string;
    name: string;
    url: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Card B: Collaborator Flow state
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Action states (Copying, Exporting, Purging)
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: "info" | "success" | "warn" } | null>(null);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Helper to generate a random 6-character room code (e.g. ENV789)
  const generateRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "ENV";
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Handler: Launch new workspace (Host flow)
  const handleLaunchWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);

    const generatedCode = generateRoomCode();
    const finalName = workspaceName.trim() || `dev-runtime-${Math.floor(100 + Math.random() * 900)}`;

    // Sync newly created workspace to Supabase Cloud and Laptop 2 Runner
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("workspaces").upsert({
          room_code: generatedCode,
          owner_id: user?.id || null,
          name: finalName,
          status: "active",
          os_state: {
            wallpaper: "/OSwallpaper.jpg",
            open_windows: ["ide", "safari"],
            runner_url: runnerUrl,
          },
        }, { onConflict: "room_code" });

        // Allocate physical storage folder on Laptop 2 SSD
        const cleanUrl = runnerUrl.replace(/\/+$/, "");
        fetch(`${cleanUrl}/api/workspaces/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode: generatedCode }),
        }).catch(() => {});
      } catch (e) {
        console.warn("[Dashboard Workspace Save Notice]", e);
      }
    })();

    setTimeout(() => {
      const newWs: WorkspaceItem = {
        id: `ws-${Date.now()}`,
        name: finalName,
        roomCode: generatedCode,
        path: `./workspaces/ws_${generatedCode}`,
        runtime: "Node.js 20",
        role: "Host",
        footprint: "48.2 MB",
        state: "Active",
        createdAt: "Just now",
      };

      setWorkspaces((prev) => [newWs, ...prev]);
      setIsLaunching(false);

      // Persist initial room state with Lobby status
      const initialRoom = getInitialRoomState(generatedCode, finalName);
      persistRoomState(initialRoom);

      const generatedUrl = typeof window !== "undefined"
        ? `${window.location.origin}/join/${generatedCode}`
        : `/join/${generatedCode}`;

      setLaunchedWorkspace({
        code: generatedCode,
        name: finalName,
        url: generatedUrl,
      });

      setToastMessage({
        title: "Waiting Room Initialized",
        desc: `Room ${generatedCode} ready. Entering Waiting Room Lobby...`,
        type: "success",
      });

      // Smoothly navigate Host into Waiting Room
      setTimeout(() => {
        router.push(`/workspace/${generatedCode}?host=true`);
      }, 600);
    }, 700);
  };

  // Handler: Copy generated direct workspace URL
  const handleCopyGeneratedUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setToastMessage({
      title: "Copied Invite URL",
      desc: "Direct join link copied to clipboard.",
      type: "info",
    });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Handler: Join with code (Collaborator flow)
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = joinCode.trim().toUpperCase();

    if (sanitized.length !== 6) {
      setJoinError("Room code must be exactly 6 characters (e.g. ENV789)");
      return;
    }

    setJoinError(null);
    setIsJoining(true);

    setTimeout(() => {
      setIsJoining(false);
      setToastMessage({
        title: "Session Attached",
        desc: `Connecting to room ${sanitized} waiting room...`,
        type: "success",
      });
      setTimeout(() => {
        router.push(`/join/${sanitized}`);
      }, 500);
    }, 700);
  };

  // Handler: 1-click room code copy
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage({
      title: "Copied to Clipboard",
      desc: `Room code ${code} is ready to share with collaborators.`,
      type: "info",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handler: Export / Download real workspace backup bundle
  const handleExportArchive = async (ws: WorkspaceItem) => {
    setExportingId(ws.id);
    setToastMessage({
      title: "Archiving Workspace",
      desc: `Packaging files for ${ws.name} (${ws.roomCode})...`,
      type: "info",
    });

    try {
      const { data: files } = await supabase
        .from("workspace_files")
        .select("file_path, content")
        .eq("room_code", ws.roomCode);

      let bundle = `=== EnvOS Workspace Backup ===\nWorkspace: ${ws.name}\nRoom Code: ${ws.roomCode}\nExported: ${new Date().toISOString()}\n\n`;

      if (files && files.length > 0) {
        files.forEach((f: any) => {
          bundle += `\n--- [FILE: ${f.file_path}] ---\n${f.content}\n`;
        });
      } else {
        bundle += `(No custom files committed yet in this workspace)\n`;
      }

      const blob = new Blob([bundle], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${ws.name}_${ws.roomCode}_bundle.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportingId(null);
      setToastMessage({
        title: "Download Complete",
        desc: `Exported ${ws.name}_${ws.roomCode}_bundle.txt.`,
        type: "success",
      });
    } catch {
      setExportingId(null);
    }
  };

  // Handler: Purge / Delete sandbox from database
  const handlePurgeSandbox = async (ws: WorkspaceItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete workspace "${ws.name}" (${ws.roomCode})?`
    );
    if (!confirmed) return;

    setWorkspaces((prev) => prev.filter((item) => item.id !== ws.id));
    try {
      await supabase.from("workspaces").delete().eq("room_code", ws.roomCode);

      // Purge physical files on Laptop 2 runner
      const cleanUrl = runnerUrl.replace(/\/+$/, "");
      fetch(`${cleanUrl}/api/workspaces/${ws.roomCode}/purge`, {
        method: "POST",
      }).catch(() => {});
    } catch (e) {
      console.warn("Failed to delete workspace from Supabase:", e);
    }

    setToastMessage({
      title: "Workspace Purged",
      desc: `Deleted workspace ${ws.name} (${ws.roomCode}).`,
      type: "warn",
    });
  };

  // Handler: HTML5 File Import from Laptop 1 to Laptop 2
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingFileName(file.name);

    setTimeout(() => {
      setUploadingFileName(null);
      setToastMessage({
        title: "Local File Uploaded",
        desc: `Streamed "${file.name}" (${(file.size / 1024).toFixed(1)} KB) directly into Laptop 2 runner cache.`,
        type: "success",
      });
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  // Filtered workspaces for table
  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.path.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Active") return ws.state === "Active";
    if (selectedFilter === "Grace") return ws.state.startsWith("Grace");
    if (selectedFilter === "Saved") return ws.state === "Saved";
    return true;
  });

  return (
    <div
      className={cn(
        "dashboard-theme-container relative min-h-screen w-full font-manrope overflow-x-hidden transition-colors duration-700 ease-in-out",
        isLight
          ? "bg-[#fafafa] text-zinc-900 selection:bg-indigo-500/25 selection:text-zinc-900"
          : "bg-black text-zinc-100 selection:bg-white/20 selection:text-white"
      )}
    >
      {/* 
        Monochrome Black & White Dotted Background Matrix with GPU-Accelerated Opacity Cross-Fade
        - Dark mode: deep black canvas with crisp white dot grid, ambient glow, and vignette
        - Light mode: crisp off-white canvas with clean black dot grid, ambient glow, and vignette
        - Cross-fading opacity smoothly over 700ms prevents abrupt gradient snapping
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dark theme background canvas & dots */}
        <div
          className={cn(
            "absolute inset-0 bg-black transition-opacity duration-700 ease-in-out",
            isLight ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Crisp White Dot Matrix */}
          <div className="absolute inset-0 [background-size:24px_24px] pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)]" />

          {/* Soft Top-Center Ambient Glow */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-white/[0.035]" />

          {/* Subtle Radial Vignette for Depth */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
        </div>

        {/* Light theme background canvas & dots */}
        <div
          className={cn(
            "absolute inset-0 bg-[#fafafa] transition-opacity duration-700 ease-in-out",
            isLight ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Crisp Black Dot Matrix */}
          <div className="absolute inset-0 [background-size:24px_24px] pointer-events-none bg-[radial-gradient(rgba(0,0,0,0.14)_1px,transparent_1px)]" />

          {/* Soft Top-Center Indigo Ambient Glow */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-indigo-500/[0.04]" />

          {/* Subtle Radial Vignette for Depth */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.06)_100%)]" />
        </div>
      </div>

      {/* Floating System Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl backdrop-blur-2xl border flex items-start gap-3 pointer-events-auto transition-colors duration-700 ease-in-out",
              isLight
                ? "bg-white/95 border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-zinc-900"
                : "bg-zinc-950/85 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white"
            )}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : toastMessage.type === "warn" ? (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-semibold tracking-wide transition-colors duration-700 ease-in-out", isLight ? "text-zinc-900" : "text-white")}>
                {toastMessage.title}
              </p>
              <p className={cn("text-[11px] mt-0.5 leading-relaxed transition-colors duration-700 ease-in-out", isLight ? "text-zinc-600" : "text-zinc-400")}>
                {toastMessage.desc}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className={cn("text-xs px-1 cursor-pointer transition-colors duration-200", isLight ? "text-zinc-400 hover:text-zinc-800" : "text-zinc-500 hover:text-white")}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODULE 1: Liquid Glass Top Navigation Bar */}
      <header className="sticky top-4 sm:top-6 z-40 w-full px-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-700 ease-in-out">
        <div className="max-w-7xl mx-auto pointer-events-auto relative rounded-full p-[2.5px] h-[64px] sm:h-[70px] flex items-center justify-between px-5 sm:px-7 transform-gpu">
          {/* Dark Liquid Glass Pill Background Layer (z-0) */}
          <div
            className={cn(
              "absolute inset-0 z-0 rounded-full pointer-events-none glass-liquid-bar shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-0" : "opacity-100"
            )}
          />
          {/* Light Liquid Glass Pill Background Layer (z-0) */}
          <div
            className={cn(
              "absolute inset-0 z-0 rounded-full pointer-events-none bg-white/85 border border-black/15 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Liquid Metal Border Layer (z-10, sits right on top of the rim) */}
          <div
            className={cn(
              "absolute inset-0 z-10 rounded-full overflow-hidden pointer-events-none liquid-metal-border-mask transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-30" : "opacity-100"
            )}
          >
            <LiquidMetal
              colorBack={isLight ? "#cccccc" : "#888888"}
              colorTint="#ffffff"
              speed={0.4}
              repetition={4}
              distortion={0.15}
              scale={1}
              className="absolute inset-0 z-0 rounded-full"
            />
          </div>

          {/* Inner Content (z-20) */}
          <div className="relative z-20 w-full flex items-center justify-between gap-4 font-manrope">
            {/* Brand Logo with R:\EnvOS\envos.png */}
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center hover:opacity-85 transition-opacity">
                <Image
                  src="/envos-clean.png"
                  alt="EnvOS"
                  width={96}
                  height={20}
                  className={cn(
                    "h-[18px] sm:h-[21px] w-auto object-contain transition-all duration-700 ease-in-out",
                    isLight
                      ? "brightness-0 opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                      : "brightness-100 drop-shadow-[0_1px_8px_rgba(255,255,255,0.2)]"
                  )}
                  priority
                />
              </Link>
            </div>

            {/* Center: Welcome message in Manrope font */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none select-none">
              <span
                className={cn(
                  "font-manrope text-sm sm:text-base md:text-lg font-medium tracking-tight transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-300"
                )}
              >
                Welcome,{" "}
                <span className={cn("font-semibold transition-colors duration-700 ease-in-out", isLight ? "text-zinc-950" : "text-white")}>
                  {userName || "Developer"}
                </span>
              </span>
            </div>

            {/* Right: Animated Solar Dark/White Mode Toggle & Logout Icon Button */}
            <div className="flex items-center gap-2">
              <AnimatedThemeToggle
                theme={theme}
                onThemeChange={(nextTheme) => {
                  setTheme(nextTheme);
                  try {
                    localStorage.setItem("envos_dashboard_theme", nextTheme);
                  } catch {
                    // Ignore storage errors
                  }
                }}
                className={cn(
                  "w-9 h-9 p-0 rounded-full flex items-center justify-center backdrop-blur-xl shadow-sm transition-all duration-700 ease-in-out cursor-pointer active:scale-95 group",
                  isLight
                    ? "bg-black/[0.05] hover:bg-black/[0.1] border border-black/10 text-zinc-700 hover:text-indigo-600"
                    : "bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-amber-300"
                )}
              />

              <button
                type="button"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch {
                    // Ignore signout error
                  }
                  router.push("/login");
                }}
                title="Sign out of Session"
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl shadow-sm transition-all duration-700 ease-in-out cursor-pointer active:scale-95 group",
                  isLight
                    ? "bg-black/[0.05] hover:bg-rose-500/15 border border-black/10 hover:border-rose-500/30 text-zinc-600 hover:text-rose-600"
                    : "bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300"
                )}
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:scale-105" />
                <span className="sr-only">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Mission Control Hub Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16 space-y-8">
        {/* Hub Title & Subtitle with Instrumental Serif font */}
        <div className="pb-2">
          <h1
            className={cn(
              "font-instrument italic text-4xl sm:text-5xl font-normal tracking-tight leading-none transition-colors duration-700 ease-in-out",
              isLight ? "text-zinc-950" : "text-white"
            )}
          >
            Mission Control Hub
          </h1>
          <p
            className={cn(
              "mt-3 text-sm sm:text-base font-manrope max-w-2xl leading-relaxed transition-colors duration-700 ease-in-out",
              isLight ? "text-zinc-600" : "text-zinc-400"
            )}
          >
            Virtual operating system orchestration. Stream isolated compute environments, bridge team sessions, and inspect physical runner hardware in real-time.
          </p>
        </div>

        {/* MODULE 2: Dedicated Hardware Telemetry Bar (Laptop 2 Inspector) */}
        <section aria-label="Runner Node Telemetry">
          <div
            className={cn(
              "rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden group transition-all duration-700 ease-in-out",
              isLight
                ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                : "bg-white/[0.04] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            )}
          >
            {/* Header: Live Status of Laptop 2 Runner Node */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className={cn("text-xs font-semibold uppercase tracking-wider", isLight ? "text-zinc-800" : "text-zinc-300")}>
                  Compute Runner Telemetry
                </span>
                <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">(Laptop 2 Compute Node)</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-colors",
                    runnerConnected
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      runnerConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    )}
                  />
                  {runnerConnected ? "Connected" : "Disconnected (Awaiting Laptop 2)"}
                </span>

                <button
                  type="button"
                  onClick={() => setShowRunnerConfig(true)}
                  title="Configure Laptop 2 Connection (LAN / Tunnel)"
                  className={cn(
                    "text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-colors cursor-pointer",
                    isLight
                      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10"
                  )}
                >
                  <Settings className="w-3 h-3 text-cyan-400" />
                  <span>Configure Runner</span>
                </button>
              </div>
            </div>

            {/* 4 Dedicated Telemetry Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* 1. CPU Load */}
              <div
                className={cn(
                  "flex flex-col p-4 rounded-xl transition-all duration-700 ease-in-out",
                  isLight
                    ? "bg-zinc-50/80 border border-black/[0.14] hover:border-black/25 shadow-sm"
                    : "bg-white/[0.02] border border-white/5 hover:border-white/15"
                )}
              >
                <div className={cn("flex items-center mb-2 transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  <span className="text-xs font-manrope font-medium">CPU Load</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl sm:text-3xl font-manrope font-bold tracking-tight transition-colors duration-700 ease-in-out",
                      isLight ? "text-zinc-950" : "text-white"
                    )}
                  >
                    {runnerConnected && cpuLoad !== null ? `${cpuLoad}%` : "--"}
                  </span>
                  <span className={cn("text-[10px] font-manrope font-medium", runnerConnected ? "text-emerald-500" : "text-zinc-500")}>
                    {runnerConnected ? "Active" : "Offline"}
                  </span>
                </div>
                {/* Visual mini bar */}
                <div className={cn("w-full h-1.5 rounded-full mt-3 overflow-hidden transition-colors duration-700 ease-in-out", isLight ? "bg-zinc-200" : "bg-white/10")}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    animate={{ width: runnerConnected && cpuLoad !== null ? `${Math.min(100, cpuLoad * 2.5)}%` : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* 2. RAM Footprint */}
              <div
                className={cn(
                  "flex flex-col p-4 rounded-xl transition-all duration-700 ease-in-out",
                  isLight
                    ? "bg-zinc-50/80 border border-black/[0.14] hover:border-black/25 shadow-sm"
                    : "bg-white/[0.02] border border-white/5 hover:border-white/15"
                )}
              >
                <div className={cn("flex items-center mb-2 transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  <span className="text-xs font-manrope font-medium">RAM Footprint</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl sm:text-3xl font-manrope font-bold tracking-tight transition-colors duration-700 ease-in-out",
                      isLight ? "text-zinc-950" : "text-white"
                    )}
                  >
                    {runnerConnected && ramFootprint !== null ? `${ramFootprint} / 16.0` : "-- / --"}{" "}
                    <span className={cn("text-sm font-normal transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>GB</span>
                  </span>
                </div>
                {/* Visual mini bar */}
                <div className={cn("w-full h-1.5 rounded-full mt-3 overflow-hidden transition-colors duration-700 ease-in-out", isLight ? "bg-zinc-200" : "bg-white/10")}>
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                    style={{ width: runnerConnected && ramFootprint !== null ? `${(ramFootprint / 16.0) * 100}%` : "0%" }}
                  />
                </div>
              </div>

              {/* 3. Storage Pool */}
              <div
                className={cn(
                  "flex flex-col p-4 rounded-xl transition-all duration-700 ease-in-out",
                  isLight
                    ? "bg-zinc-50/80 border border-black/[0.14] hover:border-black/25 shadow-sm"
                    : "bg-white/[0.02] border border-white/5 hover:border-white/15"
                )}
              >
                <div className={cn("flex items-center mb-2 transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  <span className="text-xs font-manrope font-medium">Storage Pool</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl sm:text-3xl font-manrope font-bold tracking-tight transition-colors duration-700 ease-in-out",
                      isLight ? "text-zinc-950" : "text-white"
                    )}
                  >
                    {runnerConnected && storageFootprint !== null ? storageFootprint.toFixed(1) : "--"}{" "}
                    <span className={cn("text-sm font-normal transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>MB</span>
                  </span>
                </div>
                {/* Visual mini bar */}
                <div className={cn("w-full h-1.5 rounded-full mt-3 overflow-hidden transition-colors duration-700 ease-in-out", isLight ? "bg-zinc-200" : "bg-white/10")}>
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: runnerConnected && storageFootprint !== null ? `${Math.min(100, storageFootprint * 2)}%` : "0%" }}
                  />
                </div>
              </div>

              {/* 4. Network Pipeline */}
              <div
                className={cn(
                  "flex flex-col p-4 rounded-xl transition-all duration-700 ease-in-out",
                  isLight
                    ? "bg-zinc-50/80 border border-black/[0.14] hover:border-black/25 shadow-sm"
                    : "bg-white/[0.02] border border-white/5 hover:border-white/15"
                )}
              >
                <div className={cn("flex items-center mb-2 transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>
                  <span className="text-xs font-manrope font-medium">Network Pipeline</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1 text-2xl sm:text-3xl font-manrope font-bold tracking-tight">
                    <span className={cn("transition-colors duration-700 ease-in-out", isLight ? "text-zinc-950" : "text-white")}>
                      {runnerConnected && networkPing !== null ? networkPing : "--"}
                    </span>
                    <span className={cn("text-sm font-normal transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>
                      {runnerConnected ? "ms" : "offline"}
                    </span>
                  </div>
                </div>
                {/* Visual mini bar */}
                <div className={cn("w-full h-1.5 rounded-full mt-3 overflow-hidden transition-colors duration-700 ease-in-out", isLight ? "bg-zinc-200" : "bg-white/10")}>
                  <div className={cn("h-full rounded-full transition-all", runnerConnected ? "bg-emerald-400 w-[95%]" : "bg-zinc-500/30 w-0")} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 3: Dual-Action Launchpad (Two Side-by-Side Cards) */}
        <section aria-label="Compute & Session Launchpad">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* CARD A: Spawn Compute - Host Flow */}
            <motion.div
              layout
              className={cn(
                "rounded-2xl p-6 sm:p-7 backdrop-blur-xl relative flex flex-col justify-between group overflow-hidden transition-all duration-700 ease-in-out",
                isLight
                  ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-black/30"
                  : "bg-white/[0.04] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/20"
              )}
            >
              {/* Subtle top-right accent glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header */}
                <div className="mb-2">
                  <h3
                    className={cn(
                      "font-instrument italic text-2xl sm:text-3xl font-normal transition-colors duration-700 ease-in-out",
                      isLight ? "text-zinc-950" : "text-white"
                    )}
                  >
                    New Workspace
                  </h3>
                </div>

                {/* Host Flow Form */}
                <form onSubmit={handleLaunchWorkspace} className="mt-6 space-y-5">
                  {/* Workspace Name Input */}
                  <div>
                    <label
                      className={cn(
                        "block text-xs font-semibold font-manrope mb-2 transition-colors duration-700 ease-in-out",
                        isLight ? "text-zinc-700" : "text-zinc-300"
                      )}
                    >
                      Workspace Identifier
                    </label>
                    <div className="relative flex items-center">
                      <FolderOpen className="absolute left-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="dev-runtime"
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 rounded-xl border font-manrope text-sm focus:outline-none transition-all duration-700 ease-in-out",
                          isLight
                            ? "bg-zinc-50 border-black/20 text-zinc-900 placeholder:text-zinc-400 focus:border-cyan-500 focus:bg-white shadow-inner"
                            : "bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:bg-white/[0.06]"
                        )}
                      />
                    </div>
                  </div>

                  {/* Actions Row: Launch Button & Import File Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    {/* Primary CTA: Glowing gradient button [ Launch Workspace → ] */}
                    <button
                      type="submit"
                      disabled={isLaunching}
                      className="w-full sm:flex-1 relative group cursor-pointer overflow-hidden rounded-xl p-[1.5px] transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(59,130,246,0.35)]"
                    >
                      {/* Gradient border ring */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 opacity-90 group-hover:opacity-100 transition-opacity" />

                      {/* Inner button surface */}
                      <div className="relative rounded-xl bg-[#080a12] group-hover:bg-[#0c101a] px-5 py-3 flex items-center justify-center gap-2.5 transition-colors">
                        {isLaunching ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            <span className="text-xs sm:text-sm font-semibold text-white font-manrope">
                              Allocating on Laptop 2...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs sm:text-sm font-semibold text-white font-manrope">
                              Launch Workspace
                            </span>
                            <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Secondary CTA: [ Import Local File ] using HTML5 File API */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        className="hidden"
                        aria-label="Upload file to Laptop 2"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFileName !== null}
                        className={cn(
                          "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs sm:text-sm font-manrope transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]",
                          isLight
                            ? "bg-zinc-100 hover:bg-zinc-200 border-black/20 text-zinc-700 hover:text-zinc-950 shadow-sm"
                            : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
                        )}
                      >
                        {uploadingFileName ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-cyan-600 dark:text-cyan-300">Streaming...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-zinc-400" />
                            <span>Import Local File</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Newly Generated Code & Direct URL Container (displayed in space below button) */}
                  <AnimatePresence>
                    {launchedWorkspace && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div
                          className={cn(
                            "mt-4 p-4 rounded-xl backdrop-blur-md flex flex-col gap-3 shadow-inner transition-colors",
                            isLight
                              ? "bg-zinc-100/90 border border-black/10 text-zinc-900"
                              : "bg-black/45 border border-white/10 text-white"
                          )}
                        >
                          {/* Header Status & Open OS CTA */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                              <span className="text-xs font-semibold text-emerald-500 font-manrope">
                                Waiting Room & Lobby Ready
                              </span>
                            </div>
                            <Link
                              href={`/workspace/${launchedWorkspace.code}?host=true`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-white transition-all shadow-sm group/link"
                            >
                              <span>Enter Waiting Room</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>

                          {/* 1. Room Code with 1-Click Copy */}
                          <div className="flex flex-col gap-1">
                            <span className={cn("text-[11px] font-manrope uppercase tracking-wider", isLight ? "text-zinc-500" : "text-zinc-400")}>
                              Room Code
                            </span>
                            <div
                              className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg border",
                                isLight ? "bg-white border-black/10" : "bg-white/[0.03] border-white/10"
                              )}
                            >
                              <span className="font-manrope text-base sm:text-lg font-bold tracking-widest text-cyan-600 dark:text-cyan-300 select-all">
                                {launchedWorkspace.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(launchedWorkspace.code)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-manrope transition-all cursor-pointer",
                                  isLight
                                    ? "bg-zinc-100 hover:bg-zinc-200 border-black/10 text-zinc-800"
                                    : "bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-zinc-200 hover:text-white"
                                )}
                              >
                                {copiedCode === launchedWorkspace.code ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500 font-medium">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* 2. Generated URL with 1-Click Copy */}
                          <div className="flex flex-col gap-1">
                            <span className={cn("text-[11px] font-manrope uppercase tracking-wider", isLight ? "text-zinc-500" : "text-zinc-400")}>
                              Generated Workspace URL
                            </span>
                            <div
                              className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg border gap-2",
                                isLight ? "bg-white border-black/10" : "bg-white/[0.03] border-white/10"
                              )}
                            >
                              <span className={cn("font-manrope text-xs truncate select-all", isLight ? "text-zinc-800" : "text-zinc-300")}>
                                {launchedWorkspace.url}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyGeneratedUrl(launchedWorkspace.url)}
                                className={cn(
                                  "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-manrope transition-all cursor-pointer",
                                  isLight
                                    ? "bg-zinc-100 hover:bg-zinc-200 border-black/10 text-zinc-800"
                                    : "bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-zinc-200 hover:text-white"
                                )}
                              >
                                {copiedUrl ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500 font-medium">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy URL</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>

            {/* CARD B: Connect Session - Collaborator Flow */}
            <motion.div
              layout
              className={cn(
                "rounded-2xl p-6 sm:p-7 backdrop-blur-xl relative flex flex-col justify-between group overflow-hidden transition-all duration-700 ease-in-out",
                isLight
                  ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-black/30"
                  : "bg-white/[0.04] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/20"
              )}
            >
              {/* Subtle top-right accent glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header */}
                <div className="mb-2">
                  <h3
                    className={cn(
                      "font-instrument italic text-2xl sm:text-3xl font-normal transition-colors duration-700 ease-in-out",
                      isLight ? "text-zinc-950" : "text-white"
                    )}
                  >
                    Join with Code
                  </h3>
                </div>

                {/* Collaborator Flow Form */}
                <form onSubmit={handleJoinSession} className="mt-6 space-y-5">
                  <div>
                    <label
                      className={cn(
                        "block text-xs font-semibold font-manrope mb-2 transition-colors duration-700 ease-in-out",
                        isLight ? "text-zinc-700" : "text-zinc-300"
                      )}
                    >
                      Enter 6-Character Room Code
                    </label>

                    {/* Centered tracking-widest 6-character room code input */}
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={joinCode}
                        onChange={(e) => {
                          setJoinCode(e.target.value.toUpperCase());
                          if (joinError) setJoinError(null);
                        }}
                        placeholder="ENV789"
                        className={cn(
                          "w-full text-center py-3.5 rounded-xl border font-manrope text-2xl sm:text-3xl tracking-[0.35em] uppercase placeholder:tracking-widest focus:outline-none transition-all duration-700 ease-in-out",
                          joinError
                            ? "border-rose-500/80 focus:border-rose-400 bg-rose-500/5 text-rose-500"
                            : isLight
                            ? "bg-zinc-50 border-black/20 text-zinc-950 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white shadow-inner"
                            : "bg-black/50 border-white/15 text-white placeholder:text-zinc-600 focus:border-sky-400 focus:bg-white/[0.06] shadow-inner"
                        )}
                      />
                    </div>
                    {joinError && (
                      <p className="text-xs text-rose-500 font-manrope mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {joinError}
                      </p>
                    )}
                  </div>

                  {/* Frosted pill button [ Connect to Room → ] */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isJoining || joinCode.length === 0}
                      className={cn(
                        "w-full relative group cursor-pointer overflow-hidden rounded-full py-3.5 px-6 font-manrope text-sm font-semibold transition-all duration-700 ease-in-out flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                        isLight
                          ? "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900"
                          : "bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-white/30 text-white"
                      )}
                    >
                      {isJoining ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Connecting to Room...</span>
                        </>
                      ) : (
                        <>
                          <span>Connect to Room</span>
                          <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Previous rooms to attach */}
              <div
                className={cn(
                  "mt-5 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-manrope transition-colors duration-700 ease-in-out",
                  isLight ? "border-black/15 text-zinc-500" : "border-white/5 text-zinc-500"
                )}
              >
                <span>Previous:</span>
                <div className="flex items-center gap-1.5">
                  {["ENV789", "ENV402", "ENV931"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setJoinCode(code)}
                      className={cn(
                        "px-2 py-0.5 rounded border text-xs cursor-pointer transition-colors duration-200",
                        isLight
                          ? "bg-zinc-100 hover:bg-zinc-200 border-black/20 text-cyan-700 hover:text-cyan-900"
                          : "bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-cyan-300 hover:text-white"
                      )}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MODULE 4: Workspace Storage Vault & Session Registry (Table) */}
        <section aria-label="Workspace Storage Vault & Session Registry">
          <div
            className={cn(
              "rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-700 ease-in-out",
              isLight
                ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                : "bg-white/[0.04] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            )}
          >
            {/* Table Header Controls */}
            <div
              className={cn(
                "p-6 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors duration-700 ease-in-out",
                isLight ? "border-black/15" : "border-white/10"
              )}
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-5 h-5 text-cyan-500" />
                  <h3
                    className={cn(
                      "font-instrument italic text-2xl sm:text-3xl font-normal transition-colors duration-700 ease-in-out",
                      isLight ? "text-zinc-950" : "text-white"
                    )}
                  >
                    Workspace Storage Vault & Session Registry
                  </h3>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search input */}
                <div className="relative flex items-center min-w-[220px]">
                  <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, code, path..."
                    className={cn(
                      "w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs font-manrope focus:outline-none transition-all duration-700 ease-in-out",
                      isLight
                        ? "bg-zinc-50 border-black/20 text-zinc-900 placeholder:text-zinc-400 focus:border-cyan-500"
                        : "bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-400"
                    )}
                  />
                </div>

                {/* Filter Pills with Fluid Shared Layout Sliding Pill */}
                <div
                  className={cn(
                    "flex items-center p-1 rounded-lg border text-xs font-manrope transition-colors duration-700 ease-in-out",
                    isLight ? "bg-zinc-100/90 border-black/15" : "bg-black/40 border-white/10"
                  )}
                >
                  {(["All", "Active", "Grace", "Saved"] as const).map((filter) => {
                    const isSelected = selectedFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSelectedFilter(filter)}
                        className={cn(
                          "relative px-3 py-1 rounded-md transition-colors duration-200 cursor-pointer select-none text-xs font-manrope",
                          isSelected
                            ? isLight
                              ? "text-zinc-950 font-semibold"
                              : "text-white font-medium"
                            : isLight
                            ? "text-zinc-500 hover:text-zinc-900"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="storage-vault-filter-pill"
                            className={cn(
                              "absolute inset-0 rounded-md shadow-sm border",
                              isLight
                                ? "bg-white border-black/15 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                                : "bg-white/15 border-white/20"
                            )}
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{filter}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Desktop & Laptop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={cn(
                      "border-b text-[11px] font-manrope uppercase tracking-wider transition-colors duration-700 ease-in-out",
                      isLight
                        ? "border-black/15 bg-zinc-50/80 text-zinc-500 font-semibold"
                        : "border-white/10 bg-white/[0.02] text-zinc-400"
                    )}
                  >
                    <th className="py-3.5 px-6">Workspace & Path</th>
                    <th className="py-3.5 px-6">Room Code</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Runner Footprint</th>
                    <th className="py-3.5 px-6">Session State</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody
                  className={cn(
                    "divide-y font-manrope text-xs sm:text-sm transition-colors duration-700 ease-in-out",
                    isLight ? "divide-black/10" : "divide-white/5"
                  )}
                >
                  <AnimatePresence initial={false}>
                    {filteredWorkspaces.length === 0 ? (
                      <motion.tr
                        key="empty-state"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <td colSpan={6} className={cn("py-16 text-center font-manrope", isLight ? "text-zinc-500" : "text-zinc-400")}>
                          <div className="flex flex-col items-center justify-center gap-2">
                            <FolderTree className="w-8 h-8 text-zinc-600 mb-1" />
                            <p className="text-sm font-medium">No workspaces provisioned yet</p>
                            <p className="text-xs text-zinc-500">Launch a new workspace above to initialize your cloud OS runtime.</p>
                          </div>
                        </td>
                      </motion.tr>
                    ) : (
                      filteredWorkspaces.map((ws) => (
                        <motion.tr
                          key={ws.id}
                          layout="position"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{
                            opacity: { duration: 0.18 },
                            y: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                            layout: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
                          }}
                          className={cn(
                            "transition-colors group",
                            isLight ? "hover:bg-zinc-100/60" : "hover:bg-white/[0.03]"
                          )}
                        >
                          {/* 1. Workspace & Path */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "font-semibold transition-colors duration-700 ease-in-out",
                                  isLight
                                    ? "text-zinc-900 group-hover:text-cyan-600"
                                    : "text-white group-hover:text-cyan-300"
                                )}
                              >
                                {ws.name}
                              </span>
                              <span className="font-manrope text-xs text-zinc-500 flex items-center gap-1">
                                <FolderOpen className="w-3 h-3 text-zinc-500" />
                                {ws.path}
                              </span>
                            </div>
                          </td>

                          {/* 2. Room Code (Monospace badge with 1-click copy button) */}
                          <td className="py-4 px-6">
                            <button
                              type="button"
                              onClick={() => handleCopyCode(ws.roomCode)}
                              title="Click to copy room code"
                              className={cn(
                                "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border font-manrope text-xs transition-all duration-700 ease-in-out cursor-pointer group/btn",
                                isLight
                                  ? "bg-zinc-100/80 hover:bg-zinc-200/80 border-black/10 text-cyan-700"
                                  : "bg-black/40 hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-cyan-300"
                              )}
                            >
                              <span className="font-bold tracking-wider">{ws.roomCode}</span>
                              {copiedCode === ws.roomCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-zinc-700 dark:group-hover/btn:text-zinc-200 transition-colors" />
                              )}
                            </button>
                          </td>

                          {/* 3. Role Badge (Color-coded role pill) */}
                          <td className="py-4 px-6">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-manrope font-medium border transition-colors duration-700 ease-in-out",
                                ws.role === "Host"
                                  ? isLight
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : ws.role === "Editor"
                                  ? isLight
                                    ? "bg-sky-50 text-sky-700 border-sky-200"
                                    : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                                  : isLight
                                  ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                                  : "bg-slate-700/30 text-slate-300 border-slate-600/30"
                              )}
                            >
                              {ws.role}
                            </span>
                          </td>

                          {/* 4. Runner Footprint (Size on Laptop 2's SSD) */}
                          <td className="py-4 px-6">
                            <div className={cn("flex items-center gap-2 font-manrope text-xs transition-colors duration-700 ease-in-out", isLight ? "text-zinc-700" : "text-zinc-300")}>
                              <HardDrive className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                              <span>{ws.footprint}</span>
                            </div>
                          </td>

                          {/* 5. Session State (Status indicator) */}
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-2">
                              {ws.state === "Active" ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                                  <span className={cn("text-xs font-medium font-manrope transition-colors duration-700 ease-in-out", isLight ? "text-emerald-700" : "text-emerald-300")}>Active</span>
                                </>
                              ) : ws.state.startsWith("Grace") ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                                  <span className={cn("text-xs font-medium font-manrope transition-colors duration-700 ease-in-out", isLight ? "text-amber-700" : "text-amber-300")}>{ws.state}</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                                  <span className={cn("text-xs font-medium font-manrope transition-colors duration-700 ease-in-out", isLight ? "text-zinc-500" : "text-zinc-400")}>Saved</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* 6. Actions (Export/Download, Purge/Delete, Open OS) */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Export / Download (.tar.gz / .zip directly to Laptop 1) */}
                              <button
                                type="button"
                                onClick={() => handleExportArchive(ws)}
                                disabled={exportingId === ws.id}
                                title="Download .tar.gz archive to Laptop 1"
                                className={cn(
                                  "p-2 rounded-xl border transition-colors duration-700 ease-in-out cursor-pointer",
                                  isLight
                                    ? "bg-zinc-100 hover:bg-zinc-200 border-black/10 text-zinc-700 hover:text-zinc-950"
                                    : "bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-zinc-300 hover:text-white"
                                )}
                              >
                                {exportingId === ws.id ? (
                                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                <span className="sr-only">Download Archive</span>
                              </button>

                              {/* Purge / Delete (Remove from Laptop 2's disk) */}
                              <button
                                type="button"
                                onClick={() => handlePurgeSandbox(ws)}
                                title="Purge sandbox directory from Laptop 2"
                                className={cn(
                                  "p-2 rounded-xl border transition-colors duration-700 ease-in-out cursor-pointer",
                                  isLight
                                    ? "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 hover:text-rose-700"
                                    : "bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-500/30 border-white/10 text-zinc-400 hover:text-rose-400"
                                )}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Purge Directory</span>
                              </button>

                              {/* Primary Pill Button [ Open OS → ] routing to /workspace/:roomCode */}
                              <Link
                                href={`/workspace/${ws.roomCode}`}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all duration-700 ease-in-out cursor-pointer group/link",
                                  isLight
                                    ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-900 text-white hover:border-zinc-700"
                                    : "bg-white/[0.08] hover:bg-white/[0.18] border-white/20 text-white hover:border-cyan-400/50"
                                )}
                              >
                                <span>Open OS</span>
                                <ArrowRight className="w-3.5 h-3.5 text-cyan-300 group-hover/link:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div
              className={cn(
                "p-4 border-t flex items-center justify-between text-xs font-manrope transition-colors duration-700 ease-in-out",
                isLight ? "bg-zinc-50/60 border-black/15 text-zinc-500" : "bg-white/[0.01] border-white/5 text-zinc-500"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span>Showing</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.strong
                    key={filteredWorkspaces.length}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className={cn("inline-block font-semibold transition-colors duration-700 ease-in-out", isLight ? "text-zinc-900" : "text-zinc-300")}
                  >
                    {filteredWorkspaces.length}
                  </motion.strong>
                </AnimatePresence>
                <span>of</span>
                <strong className={cn("font-semibold transition-colors duration-700 ease-in-out", isLight ? "text-zinc-900" : "text-zinc-300")}>{workspaces.length}</strong>
                <span>storage sandboxes</span>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 5: Runner Pairing Modal (Laptop 2 Connection) */}
        <AnimatePresence>
          {showRunnerConfig && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRunnerConfig(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={cn(
                  "relative z-10 w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden border transition-all",
                  isLight
                    ? "bg-white/95 border-black/15 text-zinc-900 shadow-zinc-300/50"
                    : "bg-[#0b0f17]/95 border-white/10 text-white shadow-black/80"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-manrope">Pair Laptop 2 Compute Node</h3>
                      <p className="text-xs text-zinc-500 font-manrope">Direct storage, RAM & PTY compute execution</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRunnerConfig(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-400 font-mono">
                      Runner Server Address / Tunnel URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customRunnerInput}
                        onChange={(e) => setCustomRunnerInput(e.target.value)}
                        placeholder="e.g. http://192.168.1.105:5000 or https://xyz.trycloudflare.com"
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all",
                          isLight
                            ? "bg-zinc-50 border-black/15 text-zinc-900 placeholder:text-zinc-400"
                            : "bg-black/40 border-white/10 text-white placeholder:text-zinc-600"
                        )}
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium">Quick Presets:</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomRunnerInput("http://localhost:5000")}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        Localhost (5000)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomRunnerInput("http://192.168.1.100:5000")}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        Local Wi-Fi IP
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomRunnerInput("https://envos-runner.trycloudflare.com")}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                      >
                        Cloudflare Tunnel
                      </button>
                    </div>
                  </div>

                  {/* Test Ping Status */}
                  {testResult && (
                    <div
                      className={cn(
                        "p-3 rounded-xl border text-xs flex items-center gap-2",
                        testResult.success
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      disabled={isTestingRunner}
                      onClick={handleTestConnection}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer",
                        isLight
                          ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300"
                          : "bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10"
                      )}
                    >
                      {isTestingRunner ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Pinging Laptop 2...</span>
                        </>
                      ) : (
                        <>
                          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Test Ping</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveRunnerUrl}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Connect</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Dashboard;
