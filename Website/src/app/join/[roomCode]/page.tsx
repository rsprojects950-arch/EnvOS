"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import {
  loadRoomState,
  persistRoomState,
  broadcastRoomEvent,
  subscribeToRoomEvents,
} from "@/lib/room-sync";
import { Collaborator, RoomState } from "@/types/workspace";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { RippleDotMatrix } from "@/components/workspace/ripple-dot-matrix";
import { RoleMatrixModal } from "@/components/workspace/role-matrix-modal";
import { LobbyRoom } from "@/components/workspace/lobby-room";
import { cn } from "@/lib/utils";

interface JoinPageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default function JoinRoomPage({ params }: JoinPageProps) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams?.roomCode?.toUpperCase() || "ENV789";
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [currentMemberId, setCurrentMemberId] = useState<string>("");
  const [stage, setStage] = useState<"enter_name" | "waiting_host" | "admitted">("enter_name");
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>(() => loadRoomState(roomCode));

  // Theme state: synchronized with user preference in dashboard & host room
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("envos_dashboard_theme") as "dark" | "light" | null;
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
      }
    } catch {
      // Ignore storage errors
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "envos_dashboard_theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Check existing session for member state recovery
  useEffect(() => {
    const state = loadRoomState(roomCode);
    setRoomState(state);

    if (typeof window !== "undefined") {
      try {
        const savedId = sessionStorage.getItem(`envos_member_id_${roomCode}`);
        const savedName = sessionStorage.getItem(`envos_member_name_${roomCode}`);
        if (savedName) setDisplayName(savedName);
        if (savedId) {
          setCurrentMemberId(savedId);
          const existing = state.collaborators.find((c) => c.id === savedId);
          if (existing) {
            if (existing.status === "admitted" || existing.status === "ready") {
              setStage("admitted");
            } else if (existing.status === "pending") {
              setStage("waiting_host");
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }, [roomCode]);

  // Subscribe to host events (admit, start workspace, discard)
  useEffect(() => {
    const unsubscribe = subscribeToRoomEvents(roomCode, (event) => {
      if (event.type === "STATE_UPDATE") {
        setRoomState(event.payload);
        if (currentMemberId) {
          const me = event.payload.collaborators.find((c) => c.id === currentMemberId);
          if (me) {
            if (me.status === "admitted" || me.status === "ready") {
              setStage("admitted");
            } else if (me.status === "pending") {
              setStage("waiting_host");
            }
          }
        }
      } else if (event.type === "WORKSPACE_START") {
        const finalName = displayName.trim() || "Guest";
        router.push(
          `/workspace/${roomCode}?user=${encodeURIComponent(finalName)}&role=admitted`
        );
      } else if (event.type === "WORKSPACE_DISCARD") {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [roomCode, currentMemberId, displayName, router]);

  const isLight = theme === "light";
  const workspaceDisplayName =
    roomState.workspaceName && roomState.workspaceName !== "web-runtime (Node.js)"
      ? roomState.workspaceName
      : "dev-runtime";

  // Handler: Member enters room
  const handleEnterRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = displayName.trim() || `Guest-${Math.floor(100 + Math.random() * 900)}`;

    const currentRoomState = loadRoomState(roomCode);
    const isAutoAdmitted = currentRoomState.policies.autoAdmit;

    // Check if member already registered
    const existing = currentRoomState.collaborators.find(
      (c) => c.name.toLowerCase() === finalName.toLowerCase()
    );

    const memberId = existing ? existing.id : `user-join-${Date.now()}`;
    setCurrentMemberId(memberId);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`envos_member_id_${roomCode}`, memberId);
        sessionStorage.setItem(`envos_member_name_${roomCode}`, finalName);
      } catch {
        // ignore
      }
    }

    if (!existing) {
      const newMember: Collaborator = {
        id: memberId,
        name: finalName,
        role: "viewer",
        status: isAutoAdmitted ? "admitted" : "pending",
        avatarColor: "from-zinc-400 to-zinc-600",
        ping: Number((3.2 + Math.random() * 2).toFixed(1)),
        joinedAt: "Just now",
        runnerClient: "Web Peer",
      };

      const updated = {
        ...currentRoomState,
        collaborators: [...currentRoomState.collaborators, newMember],
      };

      persistRoomState(updated);
      setRoomState(updated);
      broadcastRoomEvent(roomCode, {
        type: "MEMBER_JOIN",
        payload: newMember,
      });

      if (isAutoAdmitted) {
        setStage("admitted");
      } else {
        setStage("waiting_host");
      }
    } else {
      if (existing.status === "admitted" || existing.status === "ready") {
        setStage("admitted");
      } else {
        setStage("waiting_host");
      }
    }
  };

  // Handler: Member leaves room
  const handleLeaveRoom = () => {
    if (currentMemberId) {
      const current = loadRoomState(roomCode);
      const updatedCollabs = current.collaborators.filter((c) => c.id !== currentMemberId);
      const updated = { ...current, collaborators: updatedCollabs };
      persistRoomState(updated);
      setRoomState(updated);
      broadcastRoomEvent(roomCode, {
        type: "STATE_UPDATE",
        payload: updated,
      });
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(`envos_member_id_${roomCode}`);
          sessionStorage.removeItem(`envos_member_name_${roomCode}`);
        } catch {
          // ignore
        }
      }
    }
    router.push("/dashboard");
  };

  // -------------------------------------------------------------
  // STAGE 3: Admitted Waiting Room
  // "when host admits him then he should see the waiting room without launch desktop option
  // and admit, kick, admit all, assigning roles options should also be disabled.
  // and there should be leave room button. now again the ripple effect will be shown"
  // -------------------------------------------------------------
  if (stage === "admitted") {
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
        currentMemberId={currentMemberId}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // -------------------------------------------------------------
  // STAGE 1 & 2: Empty page with input pill / "Wait till Host lets you in"
  // -------------------------------------------------------------
  const showRipples = stage === "waiting_host";

  return (
    <div
      className={cn(
        "dashboard-theme-container relative min-h-screen w-full font-manrope overflow-x-hidden select-none flex flex-col justify-between transition-colors duration-700 ease-in-out cursor-default",
        isLight
          ? "bg-[#fafafa] text-zinc-900 selection:bg-indigo-500/25 selection:text-zinc-900"
          : "bg-black text-zinc-100 selection:bg-white/20 selection:text-white"
      )}
    >
      {/* 
        Monochrome Black & White Dotted Background Matrix
        - Ripple effect is DISABLED in Stage 1 ("until this the ripple effect should not shown")
        - Ripple effect is ENABLED in Stage 2 & 3 ("when this statement is shown then the ripple effect should start")
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dark theme background canvas */}
        <div
          className={cn(
            "absolute inset-0 bg-black transition-opacity duration-700 ease-in-out",
            isLight ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Soft Top-Center Ambient Glow */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-white/[0.035]" />

          {/* Subtle Radial Vignette for Depth */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
        </div>

        {/* Light theme background canvas */}
        <div
          className={cn(
            "absolute inset-0 bg-[#fafafa] transition-opacity duration-700 ease-in-out",
            isLight ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Soft Top-Center Indigo Ambient Glow */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-indigo-500/[0.04]" />

          {/* Subtle Radial Vignette for Depth */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.06)_100%)]" />
        </div>

        {/* Dot Matrix with conditional water ripple brightening */}
        <RippleDotMatrix isLight={isLight} enableRipples={showRipples} />
      </div>

      {/* Top Left subtle Dashboard Link */}
      <div className="fixed top-5 left-6 z-50">
        <Link
          href="/dashboard"
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-manrope font-medium transition-all duration-300 active:scale-95 shadow-xs",
            isLight
              ? "bg-white/80 hover:bg-zinc-100 border-black/10 text-zinc-700 hover:text-zinc-950"
              : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-zinc-300 hover:text-white"
          )}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Top Workspace Name Pill & Permissions Matrix Info Pill - Shown in both enter_name and waiting_host */}
      <header className="sticky top-4 sm:top-6 z-40 w-full flex items-center justify-center gap-3 px-4 pointer-events-none transition-all duration-700 ease-in-out mb-4 sm:mb-6">
        {/* Workspace dev-runtime pill */}
        <div
          className="pointer-events-auto relative rounded-full p-[2.5px] h-[52px] sm:h-[58px] flex items-center justify-center px-8 sm:px-10 transform-gpu"
          style={{ transform: "translateZ(0)" }}
        >
          {/* Dark Liquid Glass Pill Background Layer */}
          <div
            className={cn(
              "absolute inset-0 z-0 rounded-full pointer-events-none glass-liquid-bar shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Light Liquid Glass Pill Background Layer */}
          <div
            className={cn(
              "absolute inset-0 z-0 rounded-full pointer-events-none bg-white/85 border border-black/15 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Liquid Metal Border Layer */}
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

          {/* Inner Content: Workspace Name */}
          <div className="relative z-20 flex items-center justify-center">
            <span
              className={cn(
                "font-manrope text-sm sm:text-base md:text-lg font-semibold tracking-wide transition-colors duration-700 ease-in-out",
                isLight ? "text-zinc-950" : "text-white"
              )}
            >
              {workspaceDisplayName}
            </span>
          </div>
        </div>

        {/* Info Icon Liquid Metal Pill beside dev-runtime */}
        <button
          type="button"
          onClick={() => setIsRoleMatrixOpen(true)}
          title="Role Capabilities & Permissions"
          aria-label="View role capabilities and permissions"
          className="pointer-events-auto relative rounded-full p-[2.5px] h-[52px] sm:h-[58px] w-[52px] sm:w-[58px] flex items-center justify-center transform-gpu cursor-pointer transition-transform hover:scale-105 active:scale-95 group focus:outline-none shadow-md"
          style={{ transform: "translateZ(0)" }}
        >
          {/* Dark Liquid Glass Pill Background Layer */}
          <div
            className={cn(
              "absolute inset-0 z-0 rounded-full pointer-events-none glass-liquid-bar shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Light Liquid Glass Pill Background Layer */}
          <div
            className={cn(
              "absolute inset-0 z-0 rounded-full pointer-events-none bg-white/85 border border-black/15 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] transition-opacity duration-700 ease-in-out",
              isLight ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Liquid Metal Border Layer */}
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

          {/* Inner Content: Info Icon */}
          <div className="relative z-20 flex items-center justify-center">
            <Info
              className={cn(
                "w-5 h-5 transition-all duration-300 group-hover:scale-110",
                isLight ? "text-zinc-950" : "text-white"
              )}
            />
          </div>
        </button>
      </header>

      {/* Role Capabilities & Permissions Matrix Modal */}
      <RoleMatrixModal
        isOpen={isRoleMatrixOpen}
        onClose={() => setIsRoleMatrixOpen(false)}
        isLight={isLight}
      />

      {/* MAIN STAGE */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 pb-16 sm:pb-24">
        <AnimatePresence mode="wait">
          {/* 
            STAGE 1: Display Name Input Pill + Enter Room Button
            - "in this empty page there should be a pill with same style like dev-runtime, where we can write our display name."
            - "down of it there should be enter room button."
            - "until this the ripple effect should not shown"
          */}
          {stage === "enter_name" && (
            <motion.div
              key="enter_name_stage"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto -translate-y-8 sm:-translate-y-12"
            >
              {/* Pill with same style like dev-runtime where we can write our display name */}
              <div
                className="relative rounded-full p-[3px] h-[60px] sm:h-[68px] w-full max-w-[340px] sm:max-w-[420px] flex items-center justify-center transform-gpu shadow-xl"
                style={{ transform: "translateZ(0)" }}
              >
                {/* Dark Liquid Glass Pill Background */}
                <div
                  className={cn(
                    "absolute inset-0 z-0 rounded-full pointer-events-none glass-liquid-bar shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] transition-opacity duration-700 ease-in-out",
                    isLight ? "opacity-0" : "opacity-100"
                  )}
                />

                {/* Light Liquid Glass Pill Background */}
                <div
                  className={cn(
                    "absolute inset-0 z-0 rounded-full pointer-events-none bg-white/90 border border-black/15 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] transition-opacity duration-700 ease-in-out",
                    isLight ? "opacity-100" : "opacity-0"
                  )}
                />

                {/* Liquid Metal Border Layer */}
                <div
                  className={cn(
                    "absolute inset-0 z-10 rounded-full overflow-hidden pointer-events-none liquid-metal-border-mask transition-opacity duration-700 ease-in-out",
                    isLight ? "opacity-35" : "opacity-100"
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

                {/* Input field inside this liquid metal pill */}
                <form
                  onSubmit={handleEnterRoom}
                  className="relative z-20 w-full h-full flex items-center px-6"
                >
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name..."
                    autoFocus
                    className={cn(
                      "w-full bg-transparent border-none outline-none text-center font-manrope font-semibold text-base sm:text-lg tracking-wide placeholder:font-normal transition-colors",
                      isLight
                        ? "text-zinc-950 placeholder:text-zinc-400"
                        : "text-white placeholder:text-zinc-500"
                    )}
                  />
                </form>
              </div>

              {/* Down of it: Enter Room button */}
              <button
                type="button"
                onClick={handleEnterRoom}
                className="relative group cursor-pointer overflow-hidden rounded-xl p-[1.5px] transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 opacity-90 group-hover:opacity-100 transition-opacity" />

                <div
                  className={cn(
                    "relative rounded-xl px-9 py-3 flex items-center justify-center gap-2.5 transition-colors",
                    isLight ? "bg-zinc-950 group-hover:bg-zinc-900" : "bg-[#080a12] group-hover:bg-[#0c101a]"
                  )}
                >
                  <span className="text-xs sm:text-sm font-bold text-white font-manrope tracking-wide">
                    Enter Room
                  </span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          )}

          {/* 
            STAGE 2: "Wait till Host lets you in" Statement
            - "after user enters the name and clicks the enter room button, then there should be a statement 'Wait till Host lets you in'"
            - "and when this statement is shown then the ripple effect should start"
          */}
          {stage === "waiting_host" && (
            <motion.div
              key="waiting_host_stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center space-y-4 px-4 -translate-y-8 sm:-translate-y-12"
            >
              {/* Subtle status tag */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-manrope font-semibold transition-colors duration-700",
                  isLight
                    ? "bg-zinc-100 border border-black/10 text-zinc-800"
                    : "bg-white/[0.06] border border-white/15 text-zinc-200"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isLight ? "bg-zinc-900" : "bg-white"
                  )}
                />
                <span>Waiting for Approval</span>
              </div>

              {/* The required statement */}
              <h2
                className={cn(
                  "text-3xl sm:text-4xl md:text-5xl font-bold font-instrument italic tracking-tight transition-colors duration-700",
                  isLight ? "text-zinc-950" : "text-white"
                )}
              >
                Wait till Host lets you in
              </h2>

              <p
                className={cn(
                  "text-xs sm:text-sm font-manrope max-w-md transition-colors duration-700",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Host <strong className={isLight ? "text-zinc-950" : "text-white"}>{roomState.hostName}</strong> has been notified of your arrival in room{" "}
                <code className="font-mono font-bold">{roomCode}</code>.
              </p>

              {/* Leave room option */}
              <button
                type="button"
                onClick={handleLeaveRoom}
                className={cn(
                  "text-xs font-manrope underline underline-offset-4 transition-colors pt-2 cursor-pointer",
                  isLight ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-400 hover:text-white"
                )}
              >
                Leave Room
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
