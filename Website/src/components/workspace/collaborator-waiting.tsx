"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Collaborator, CollaboratorRole, RoomState, ROLE_DEFINITIONS } from "@/types/workspace";
import { RoleBadge } from "./role-badge";
import { RoleMatrixModal } from "./role-matrix-modal";
import { RippleDotMatrix } from "./ripple-dot-matrix";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Terminal,
  Code2,
  Users,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidMetal } from "@/components/ui/liquid-metal";

interface CollaboratorWaitingProps {
  roomState: RoomState;
  currentMember: Collaborator;
  onSignalReady?: () => void;
}

export function CollaboratorWaiting({
  roomState,
  currentMember,
  onSignalReady,
}: CollaboratorWaitingProps) {
  const roleMeta =
    ROLE_DEFINITIONS[currentMember.role] || ROLE_DEFINITIONS.spectator;
  const isAdmitted = currentMember.status === "admitted" || currentMember.status === "ready";
  const isPending = currentMember.status === "pending";
  const isDeclined = currentMember.status === "declined";

  const [signalSent, setSignalSent] = useState(false);
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  // Theme state: synchronized with user preference in dashboard
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

  const isLight = theme === "light";

  return (
    <div
      className={cn(
        "dashboard-theme-container relative min-h-screen w-full font-manrope overflow-hidden select-none flex flex-col justify-between transition-colors duration-700 ease-in-out",
        isLight
          ? "bg-[#fafafa] text-zinc-900 selection:bg-indigo-500/25 selection:text-zinc-900"
          : "bg-black text-zinc-100 selection:bg-white/20 selection:text-white"
      )}
    >
      {/* 
        Monochrome Black & White Dotted Background Matrix with Water Ripple Effect
        - Matches host lobby room exactly
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

        {/* Dynamic Water Ripple Dot Matrix with Pulsating Waiting Room Indicator */}
        <RippleDotMatrix isLight={isLight} />
      </div>

      {/* Top Workspace Name Pill & Permissions Matrix Info Pill - Centered */}
      <header className="sticky top-4 sm:top-6 z-40 w-full flex items-center justify-center gap-3 px-4 pointer-events-none transition-all duration-700 ease-in-out mb-6 sm:mb-8 lg:mb-10">
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
              {roomState.workspaceName}
            </span>
          </div>
        </div>

        {/* Info Icon Liquid Metal Pill beside dev-runtime */}
        <button
          type="button"
          onClick={() => setIsRoleMatrixOpen(true)}
          title="Role Capabilities & Permissions"
          aria-label="View role capabilities and permissions"
          className="pointer-events-auto relative rounded-full p-[2.5px] h-[52px] sm:h-[58px] w-[52px] sm:w-[58px] flex items-center justify-center transform-gpu cursor-pointer transition-transform hover:scale-105 active:scale-95 group focus:outline-none"
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
                isLight ? "text-zinc-950 group-hover:text-zinc-700" : "text-white group-hover:text-zinc-300"
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

      {/* MAIN WAITING STAGE */}
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center text-center">
        {/* Pulsing Sonar / Hologram Ring */}
        <div className="relative mb-6">
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-700 ease-in-out",
              isLight
                ? "bg-zinc-100 border border-black/15 shadow-[0_0_30px_rgba(0,0,0,0.06)]"
                : "bg-white/[0.04] border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.06)]"
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center animate-pulse transition-colors duration-700 ease-in-out",
                isLight
                  ? "bg-zinc-200/80 border border-black/20 text-zinc-900"
                  : "bg-white/[0.08] border border-white/30 text-white"
              )}
            >
              <Users className="w-8 h-8" />
            </div>
          </div>
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-30",
              isLight ? "border border-black/20" : "border border-white/30"
            )}
          />
        </div>

        {/* Status Heading */}
        <motion.div
          key={currentMember.status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2 mb-6"
        >
          {isPending && (
            <>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-manrope font-medium transition-colors duration-700 ease-in-out",
                  isLight
                    ? "bg-amber-100/80 border border-amber-300 text-amber-900"
                    : "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                )}
              >
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Pending Host Admission</span>
              </div>
              <h1
                className={cn(
                  "text-2xl sm:text-3xl font-bold font-instrument italic transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-950" : "text-white"
                )}
              >
                Waiting for Host {roomState.hostName} to admit you...
              </h1>
              <p
                className={cn(
                  "text-xs sm:text-sm max-w-md mx-auto leading-relaxed transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                You are in the waiting queue for room{" "}
                <code
                  className={cn(
                    "font-manrope font-bold",
                    isLight ? "text-zinc-950" : "text-white"
                  )}
                >
                  {roomState.roomCode}
                </code>
                . The host is reviewing the roster and tuning permissions.
              </p>
            </>
          )}

          {isAdmitted && (
            <>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-manrope font-medium transition-colors duration-700 ease-in-out",
                  isLight
                    ? "bg-emerald-100/80 border border-emerald-300 text-emerald-900"
                    : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Admitted to Workspace Roster</span>
              </div>
              <h1
                className={cn(
                  "text-2xl sm:text-3xl font-bold font-instrument italic transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-950" : "text-white"
                )}
              >
                You are Admitted & Ready
              </h1>
              <p
                className={cn(
                  "text-xs sm:text-sm max-w-md mx-auto leading-relaxed transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Host <strong className={isLight ? "text-zinc-950" : "text-white"}>{roomState.hostName}</strong> will launch the Desktop OS momentarily.
                Your screen will smoothly boot into the sandbox simultaneously.
              </p>
            </>
          )}

          {isDeclined && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-manrope font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Access Request Declined</span>
              </div>
              <h1 className={cn("text-2xl font-bold", isLight ? "text-zinc-950" : "text-white")}>Entry Declined</h1>
              <p className={cn("text-xs max-w-md mx-auto", isLight ? "text-zinc-600" : "text-zinc-400")}>
                The host did not admit this session into the workspace.
              </p>
            </>
          )}
        </motion.div>

        {/* Assigned Role & Capabilities Box */}
        <motion.div
          key={currentMember.role}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "w-full max-w-lg rounded-2xl p-5 backdrop-blur-xl text-left space-y-4 transition-all duration-700 ease-in-out shadow-2xl",
            isLight
              ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : "bg-white/[0.03] border border-white/10 shadow-2xl"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between border-b pb-3 transition-colors duration-700 ease-in-out",
              isLight ? "border-black/10" : "border-white/10"
            )}
          >
            <span
              className={cn(
                "text-xs font-manrope uppercase tracking-wider transition-colors duration-700 ease-in-out",
                isLight ? "text-zinc-500 font-semibold" : "text-zinc-400"
              )}
            >
              Your Assigned Role
            </span>
            <RoleBadge role={currentMember.role} size="md" isLight={isLight} />
          </div>

          <div>
            <h3
              className={cn(
                "text-sm font-semibold font-manrope transition-colors duration-700 ease-in-out",
                isLight ? "text-zinc-950" : "text-white"
              )}
            >
              {roleMeta.label}
            </h3>
            <p
              className={cn(
                "text-xs font-manrope mt-1 leading-relaxed transition-colors duration-700 ease-in-out",
                isLight ? "text-zinc-600" : "text-zinc-400"
              )}
            >
              {roleMeta.capabilities}
            </p>
          </div>

          {/* Capabilities breakdown pills */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs font-manrope">
            <div
              className={cn(
                "p-2.5 rounded-xl border flex items-center gap-2 transition-colors duration-700 ease-in-out",
                roleMeta.caps.canEditCode
                  ? isLight
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : isLight
                  ? "bg-zinc-100 border-black/10 text-zinc-500"
                  : "bg-white/[0.02] border-white/10 text-zinc-500"
              )}
            >
              <Code2 className="w-4 h-4 shrink-0" />
              <span>
                Monaco Editor: {roleMeta.caps.canEditCode ? "Read & Write" : "Read-Only"}
              </span>
            </div>

            <div
              className={cn(
                "p-2.5 rounded-xl border flex items-center gap-2 transition-colors duration-700 ease-in-out",
                roleMeta.caps.canExecuteTerminal
                  ? isLight
                    ? "bg-zinc-100 border-zinc-300 text-zinc-900"
                    : "bg-white/[0.06] border-white/20 text-zinc-200"
                  : isLight
                  ? "bg-zinc-100 border-black/10 text-zinc-500"
                  : "bg-white/[0.02] border-white/10 text-zinc-500"
              )}
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>
                Terminal Shell:{" "}
                {roleMeta.caps.canExecuteTerminal ? "Bash Execute" : "Locked / Read-Only"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Readiness Ping / Signal to Host */}
        {isAdmitted && (
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSignalSent(true);
                onSignalReady?.();
              }}
              disabled={signalSent}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold font-manrope transition-all cursor-pointer shadow-md",
                signalSent
                  ? isLight
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : isLight
                  ? "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900"
                  : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15"
              )}
            >
              {signalSent ? "✓ Ready Signal Sent to Host" : "Signal Host I'm Ready"}
            </button>

            <Link
              href="/dashboard"
              className={cn(
                "text-xs underline-offset-4 hover:underline transition-colors",
                isLight ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Leave Waiting Room
            </Link>
          </div>
        )}
      </main>

      {/* FOOTER TELEMETRY */}
      <footer
        className={cn(
          "relative z-40 h-11 border-t px-6 flex items-center justify-between text-[11px] font-manrope transition-colors duration-700 ease-in-out",
          isLight
            ? "bg-white/40 border-black/15 text-zinc-500"
            : "bg-black/40 border-white/10 text-zinc-500"
        )}
      >
        <div className="flex items-center gap-2">
          <Cpu className={cn("w-3.5 h-3.5", isLight ? "text-zinc-700" : "text-zinc-400")} />
          <span>Physical Runner: Laptop 2 (WS-HOST)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Active Peers: {roomState.collaborators.length}</span>
        </div>
      </footer>
    </div>
  );
}

export default CollaboratorWaiting;
