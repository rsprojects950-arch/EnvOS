"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collaborator,
  CollaboratorRole,
  RoomPolicies,
  RoomState,
  ROLE_DEFINITIONS,
  ASSIGNABLE_ROLES,
  RoleMetadata,
} from "@/types/workspace";
import { RoleBadge } from "./role-badge";
import { RoleDropdown } from "./role-dropdown";
import { RoleMatrixModal } from "./role-matrix-modal";
import { RippleDotMatrix } from "./ripple-dot-matrix";
import {
  Copy,
  Check,
  Radio,
  Users,
  Shield,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Cpu,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Info,
} from "lucide-react";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { cn } from "@/lib/utils";

interface LobbyRoomProps {
  roomState: RoomState;
  onUpdateState: (newState: RoomState) => void;
  onLaunchWorkspace?: () => void;
  onDiscardRoom?: () => void;
  isMemberView?: boolean;
  currentMemberId?: string;
  onLeaveRoom?: () => void;
}

export function LobbyRoom({
  roomState,
  onUpdateState,
  onLaunchWorkspace,
  onDiscardRoom,
  isMemberView = false,
  currentMemberId,
  onLeaveRoom,
}: LobbyRoomProps) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [joinUrl, setJoinUrl] = useState(`/join/${roomState.roomCode}`);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);
  const [openDropdownMemberId, setOpenDropdownMemberId] = useState<string | null>(null);

  // Theme state: synchronized with user preference in dashboard
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${roomState.roomCode}`);
    }
  }, [roomState.roomCode]);

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

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopiedCode(true);
    setToastMessage(`Room Code ${roomState.roomCode} copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}/join/${roomState.roomCode}`
      : joinUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setToastMessage(`Joining URL copied to clipboard!`);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRoleChange = (memberId: string, newRole: CollaboratorRole) => {
    const updated = roomState.collaborators.map((c) =>
      c.id === memberId ? { ...c, role: newRole } : c
    );
    const member = roomState.collaborators.find((c) => c.id === memberId);
    onUpdateState({ ...roomState, collaborators: updated });
    setToastMessage(
      `Updated ${member?.name || "collaborator"}'s role to ${newRole.toUpperCase()}`
    );
  };

  const handleAdmit = (memberId: string) => {
    const updated = roomState.collaborators.map((c) =>
      c.id === memberId ? { ...c, status: "admitted" as const } : c
    );
    const member = roomState.collaborators.find((c) => c.id === memberId);
    onUpdateState({ ...roomState, collaborators: updated });
    setToastMessage(`Admitted ${member?.name || "collaborator"} into workspace roster.`);
  };

  const handleDecline = (memberId: string) => {
    const member = roomState.collaborators.find((c) => c.id === memberId);
    const updated = roomState.collaborators.filter((c) => c.id !== memberId);
    onUpdateState({ ...roomState, collaborators: updated });
    setToastMessage(`Declined join request from ${member?.name || "collaborator"}.`);
  };

  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const assignRoleRef = useRef<HTMLDivElement>(null);

  const assignableRoles = ASSIGNABLE_ROLES;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        assignRoleRef.current &&
        !assignRoleRef.current.contains(e.target as Node)
      ) {
        setIsAssignRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKick = (memberId: string) => {
    const member = roomState.collaborators.find((c) => c.id === memberId);
    const updated = roomState.collaborators.filter((c) => c.id !== memberId);
    onUpdateState({ ...roomState, collaborators: updated });
    setToastMessage(`Removed ${member?.name || "collaborator"} from room.`);
  };

  const handleAdmitAll = () => {
    const pendingMembers = roomState.collaborators.filter(
      (c) => c.status === "pending"
    );
    if (pendingMembers.length === 0) return;
    const updated = roomState.collaborators.map((c) =>
      c.status === "pending" ? { ...c, status: "admitted" as const } : c
    );
    onUpdateState({ ...roomState, collaborators: updated });
    setToastMessage(
      `Admitted all ${pendingMembers.length} waiting collaborator${
        pendingMembers.length > 1 ? "s" : ""
      }!`
    );
  };

  const handleAssignRoleToAll = (newRole: CollaboratorRole) => {
    const updated = roomState.collaborators.map((c) =>
      c.isHost || c.role === "host" ? c : { ...c, role: newRole }
    );
    onUpdateState({ ...roomState, collaborators: updated });
    const count = updated.filter((c) => !c.isHost && c.role !== "host").length;
    setToastMessage(
      `Assigned ${ROLE_DEFINITIONS[newRole]?.badgeLabel || newRole.toUpperCase()} role to all ${count} team member${
        count !== 1 ? "s" : ""
      }!`
    );
    setIsAssignRoleOpen(false);
  };

  const handleTogglePolicy = (key: keyof RoomPolicies) => {
    const updatedPolicies = {
      ...roomState.policies,
      [key]: !roomState.policies[key],
    };
    onUpdateState({ ...roomState, policies: updatedPolicies });
  };

  const pendingCount = roomState.collaborators.filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <div
      className={cn(
        "dashboard-theme-container relative min-h-screen w-full font-manrope overflow-x-hidden select-none flex flex-col justify-between transition-colors duration-700 ease-in-out",
        isLight
          ? "bg-[#fafafa] text-zinc-900 selection:bg-indigo-500/25 selection:text-zinc-900"
          : "bg-black text-zinc-100 selection:bg-white/20 selection:text-white"
      )}
    >
      {/* 
        Monochrome Black & White Dotted Background Matrix with GPU-Accelerated Opacity Cross-Fade
        - Dark mode: deep black canvas with crisp white dot grid, ambient glow, and vignette
        - Light mode: crisp off-white canvas with clean black dot grid, ambient glow, and vignette
        - Matches exactly the dashboard visual identity
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

      {/* MAIN LOBBY CONTENT CONTAINER */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-2 sm:pt-4 flex flex-col gap-6">
        {/* ROOM BANNER METADATA */}
        <div
          className={cn(
            "rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-700 ease-in-out flex flex-col md:flex-row md:items-center justify-between gap-5",
            isLight
              ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : "bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          )}
        >
          {/* Left: Room Code & Workspace Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div>
              <span
                className={cn(
                  "text-[11px] font-manrope uppercase tracking-wider block mb-1 transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-500 font-semibold" : "text-zinc-400"
                )}
              >
                Room Code
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-2xl sm:text-3xl font-manrope font-bold tracking-[0.25em] transition-colors duration-700 ease-in-out",
                    isLight ? "text-zinc-950" : "text-white"
                  )}
                >
                  {roomState.roomCode.split("").join(" ")}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={cn(
                    "p-1.5 rounded-lg border transition-all duration-700 ease-in-out cursor-pointer",
                    isLight
                      ? "bg-zinc-100 hover:bg-zinc-200 border-black/10 text-zinc-700 hover:text-zinc-950"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white"
                  )}
                  title="Copy room code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div
              className={cn(
                "hidden sm:block h-10 w-px transition-colors duration-700 ease-in-out",
                isLight ? "bg-black/10" : "bg-white/10"
              )}
            />

            <div>
              <span
                className={cn(
                  "text-[11px] font-manrope uppercase tracking-wider block mb-1 transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-500 font-semibold" : "text-zinc-400"
                )}
              >
                Joining URL
              </span>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open joining URL"
                  className={cn(
                    "text-2xl sm:text-3xl font-manrope font-bold transition-colors duration-700 ease-in-out truncate max-w-[260px] sm:max-w-[380px] md:max-w-[480px] hover:underline underline-offset-4 cursor-pointer",
                    isLight ? "text-zinc-950" : "text-white"
                  )}
                >
                  {joinUrl}
                </a>

                {/* Redirect Icon */}
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-1.5 rounded-lg border transition-all duration-700 ease-in-out cursor-pointer active:scale-95 flex items-center justify-center shrink-0",
                    isLight
                      ? "bg-zinc-100 hover:bg-zinc-200 border-black/10 text-zinc-700 hover:text-zinc-950"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white"
                  )}
                  title="Open joining URL in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Copy Icon */}
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className={cn(
                    "p-1.5 rounded-lg border transition-all duration-700 ease-in-out cursor-pointer active:scale-95 flex items-center justify-center shrink-0",
                    isLight
                      ? "bg-zinc-100 hover:bg-zinc-200 border-black/10 text-zinc-700 hover:text-zinc-950"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white"
                  )}
                  title="Copy joining URL"
                >
                  {copiedUrl ? (
                    <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLLABORATOR ROSTER (Waiting to enter) */}
        <div
          className={cn(
            "rounded-2xl backdrop-blur-xl transition-all duration-700 ease-in-out relative z-20",
            isLight
              ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : "bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          )}
        >
          {/* Card Header */}
          <div
            className={cn(
              "px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-700 ease-in-out rounded-t-2xl",
              isLight ? "bg-zinc-50/80 border-black/15" : "bg-white/[0.02] border-white/10"
            )}
          >
            <div>
              <h2
                className={cn(
                  "text-base font-semibold font-manrope transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-950" : "text-white"
                )}
              >
                Collaborator Roster
              </h2>
              <p
                className={cn(
                  "text-xs transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Team members waiting to enter the room.
              </p>
            </div>

            {/* Action Pills: Admit All & Assign Same Role to All */}
            {!isMemberView && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Pill 1: Admit All */}
                <button
                  type="button"
                  onClick={handleAdmitAll}
                  disabled={pendingCount === 0}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-manrope font-semibold flex items-center gap-1.5 transition-all duration-700 ease-in-out active:scale-95 shadow-sm",
                    pendingCount > 0
                      ? isLight
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 hover:border-emerald-400 cursor-pointer"
                        : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.15)] cursor-pointer"
                      : isLight
                      ? "bg-zinc-100 text-zinc-400 border border-black/5 cursor-not-allowed opacity-60"
                      : "bg-white/[0.03] text-zinc-500 border border-white/5 cursor-not-allowed opacity-50"
                  )}
                  title={
                    pendingCount > 0
                      ? `Admit all ${pendingCount} waiting collaborator${pendingCount > 1 ? "s" : ""}`
                      : "No collaborators waiting for admission"
                  }
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admit All{pendingCount > 0 ? ` (${pendingCount})` : ""}</span>
                </button>

                {/* Pill 2: Assign Same Role to All */}
                <div className={cn("relative inline-block", isAssignRoleOpen && "z-50")} ref={assignRoleRef}>
                  <button
                    type="button"
                    onClick={() => setIsAssignRoleOpen(!isAssignRoleOpen)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-manrope font-semibold flex items-center gap-1.5 transition-all duration-700 ease-in-out active:scale-95 shadow-sm",
                      isLight
                        ? "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 border border-black/10 hover:border-black/20 cursor-pointer"
                        : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 hover:border-white/20 cursor-pointer",
                      isAssignRoleOpen &&
                        (isLight
                          ? "border-zinc-400 bg-zinc-200"
                          : "border-white/30 bg-white/[0.12]")
                    )}
                    title="Assign the same role to all team members"
                  >
                    <span>Assign Role to All</span>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isAssignRoleOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isAssignRoleOpen && (
                    <div
                      className={cn(
                        "absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl backdrop-blur-2xl border p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl",
                        isLight
                          ? "bg-white border-black/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-zinc-900"
                          : "bg-black border-white/15 shadow-2xl text-white"
                      )}
                    >
                      <div
                        className={cn(
                          "px-3 py-2 border-b mb-1 flex items-center justify-between",
                          isLight
                            ? "border-black/10 text-zinc-600"
                            : "border-white/10 text-zinc-400"
                        )}
                      >
                        <span className="text-[11px] font-manrope font-semibold uppercase tracking-wider">
                          Assign Role to All
                        </span>
                        <span className={cn("text-[10px] font-manrope font-medium", isLight ? "text-zinc-500" : "text-zinc-400")}>
                          Team Members
                        </span>
                      </div>

                      <div className="space-y-1">
                        {assignableRoles.map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => handleAssignRoleToAll(role.id)}
                            className={cn(
                              "w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between border border-transparent cursor-pointer group",
                              isLight
                                ? "hover:bg-zinc-100 hover:border-black/10 text-zinc-700"
                                : "hover:bg-white/[0.06] hover:border-white/10 text-zinc-300"
                            )}
                          >
                            <span
                              className={cn(
                                "text-xs font-semibold font-manrope truncate",
                                isLight ? "text-zinc-900" : "text-white"
                              )}
                            >
                              {role.label}
                            </span>
                            <span className={cn("text-[10px] font-manrope opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0", isLight ? "text-zinc-900" : "text-white")}>
                              Set All →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Roster List / Table */}
          <div
            className={cn(
              "divide-y transition-colors duration-700 ease-in-out",
              isLight ? "divide-black/10" : "divide-white/5"
            )}
          >
            {roomState.collaborators.map((member, mIdx) => {
              const isHostMember = member.isHost || member.role === "host";
              const isPending = member.status === "pending";

              return (
                <div
                  key={member.id || `lobby-collab-${mIdx}`}
                  className={cn(
                    "px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 relative",
                    openDropdownMemberId === member.id ? "z-30" : "z-auto",
                    isPending
                      ? isLight
                        ? "bg-zinc-100/40 hover:bg-zinc-100/70"
                        : "bg-white/[0.02] hover:bg-white/[0.04]"
                      : isLight
                      ? "hover:bg-zinc-100/60"
                      : "hover:bg-white/[0.02]"
                  )}
                >
                  {/* Left: Member Identity & Avatar */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-colors duration-700 ease-in-out",
                        isLight
                          ? "bg-zinc-100 text-zinc-900 border-black/15 shadow-xs"
                          : "bg-zinc-900 text-white border-white/15 shadow-xs"
                      )}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold font-manrope transition-colors duration-700 ease-in-out",
                            isLight ? "text-zinc-950" : "text-white"
                          )}
                        >
                          {member.name}
                        </span>
                        {isHostMember && !isMemberView && (
                          <span
                            className={cn(
                              "text-[11px] font-manrope font-semibold transition-colors duration-700 ease-in-out",
                              isLight ? "text-zinc-500" : "text-zinc-400"
                            )}
                          >
                            (You · Host)
                          </span>
                        )}
                        {isMemberView && member.id === currentMemberId && (
                          <span
                            className={cn(
                              "text-[11px] font-manrope font-semibold transition-colors duration-700 ease-in-out",
                              isLight ? "text-zinc-500" : "text-zinc-400"
                            )}
                          >
                            (You)
                          </span>
                        )}
                        {isPending && (
                          <span
                            className={cn(
                              "text-[10px] font-manrope px-2 py-0.5 rounded border transition-colors duration-700 ease-in-out",
                              isLight
                                ? "text-zinc-700 bg-zinc-100 border-zinc-300"
                                : "text-zinc-300 bg-zinc-800/80 border-zinc-700"
                            )}
                          >
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-[11px] font-manrope mt-0.5 transition-colors duration-700 ease-in-out",
                          isLight ? "text-zinc-600" : "text-zinc-400"
                        )}
                      >
                        <span>{member.runnerClient || "Web Peer"}</span>
                        <span>•</span>
                        <span className={isLight ? "text-zinc-500 font-medium" : "text-zinc-400"}>
                          {member.ping}ms ping
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Dynamic Role Dropdown & Action Controls */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Role Selector */}
                    {isHostMember || isMemberView ? (
                      <RoleBadge role={member.role} size="md" isLight={isLight} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs hidden lg:inline transition-colors duration-700 ease-in-out",
                            isLight ? "text-zinc-600" : "text-zinc-400"
                          )}
                        >
                          Access:
                        </span>
                        <RoleDropdown
                          currentRole={member.role}
                          isLight={isLight}
                          onChangeRole={(newRole) =>
                            handleRoleChange(member.id, newRole)
                          }
                          onOpenChange={(open) =>
                            setOpenDropdownMemberId(open ? member.id : null)
                          }
                        />
                      </div>
                    )}

                    {/* Member Actions: Admit, Kick, Decline (or read-only for Member View) */}
                    {(!isHostMember || !isMemberView) && (
                      <div
                        className={cn(
                          "flex items-center gap-1.5 pl-2 border-l transition-colors duration-700 ease-in-out",
                          isLight ? "border-black/10" : "border-white/10"
                        )}
                      >
                        {isMemberView ? (
                          isPending ? (
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-manrope font-medium border transition-colors duration-700 ease-in-out",
                              isLight
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            )}
                          >
                            Pending
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-manrope font-medium border transition-colors duration-700 ease-in-out",
                              isLight
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            )}
                          >
                            Admitted
                          </span>
                        )
                      ) : isHostMember ? (
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-manrope font-medium border transition-colors duration-700 ease-in-out",
                            isLight
                              ? "bg-zinc-100 text-zinc-800 border-zinc-300"
                              : "bg-white/[0.06] text-zinc-300 border-white/10"
                          )}
                        >
                          Ready
                        </span>
                      ) : isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAdmit(member.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-manrope font-semibold transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(52,211,153,0.3)] active:scale-95"
                          >
                            Admit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(member.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-manrope transition-all cursor-pointer active:scale-95"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className={cn(
                              "text-[11px] font-manrope hidden sm:inline mr-1 transition-colors duration-700 ease-in-out",
                              isLight ? "text-zinc-500 font-medium" : "text-zinc-400"
                            )}
                          >
                            Admitted
                          </span>
                          <button
                            type="button"
                            onClick={() => handleKick(member.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg border text-xs font-manrope transition-all cursor-pointer active:scale-95",
                              isLight
                                ? "bg-zinc-100 hover:bg-rose-50 border-black/10 hover:border-rose-300 text-zinc-700 hover:text-rose-600 shadow-sm"
                                : "bg-white/[0.04] hover:bg-rose-500/20 border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300"
                            )}
                          >
                            Kick
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROOM POLICIES SECTION */}
        {!isMemberView && (
          <div
          className={cn(
            "rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-700 ease-in-out",
            isLight
              ? "bg-white/80 border border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : "bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          )}
        >
          <div className="mb-4">
            <h3
              className={cn(
                "text-sm font-semibold font-manrope uppercase tracking-wider transition-colors duration-700 ease-in-out",
                isLight ? "text-zinc-950" : "text-white"
              )}
            >
              Room Policies & Security Gates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Allow PTY Execution */}
            <label
              className={cn(
                "p-3.5 rounded-xl border transition-all duration-700 ease-in-out flex flex-col justify-between gap-3",
                isMemberView ? "cursor-default" : "cursor-pointer",
                roomState.policies.allowPty
                  ? isLight
                    ? "bg-zinc-100 border-zinc-400 text-zinc-950 shadow-xs"
                    : "bg-white/[0.06] border-white/30 text-white"
                  : isLight
                  ? "bg-zinc-50/80 border-black/15 text-zinc-600 hover:border-black/25"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold font-manrope transition-colors duration-700 ease-in-out",
                    isLight ? "text-zinc-900" : "text-white"
                  )}
                >
                  Allow PTY Execution
                </span>
                <input
                  type="checkbox"
                  disabled={isMemberView}
                  checked={roomState.policies.allowPty}
                  onChange={() => !isMemberView && handleTogglePolicy("allowPty")}
                  className={cn(
                    "rounded border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100 mt-0.5 accent-zinc-900 dark:accent-white",
                    isMemberView ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-[11px] font-manrope leading-tight transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Controls whether terminal shells on Laptop 2 can execute commands.
              </p>
            </label>

            {/* 2. Auto-admit link joins */}
            <label
              className={cn(
                "p-3.5 rounded-xl border transition-all duration-700 ease-in-out flex flex-col justify-between gap-3",
                isMemberView ? "cursor-default" : "cursor-pointer",
                roomState.policies.autoAdmit
                  ? isLight
                    ? "bg-zinc-100 border-zinc-400 text-zinc-950 shadow-xs"
                    : "bg-white/[0.06] border-white/30 text-white"
                  : isLight
                  ? "bg-zinc-50/80 border-black/15 text-zinc-600 hover:border-black/25"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold font-manrope transition-colors duration-700 ease-in-out",
                    isLight ? "text-zinc-900" : "text-white"
                  )}
                >
                  Auto-admit Link Joins
                </span>
                <input
                  type="checkbox"
                  disabled={isMemberView}
                  checked={roomState.policies.autoAdmit}
                  onChange={() => !isMemberView && handleTogglePolicy("autoAdmit")}
                  className={cn(
                    "rounded border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100 mt-0.5 accent-zinc-900 dark:accent-white",
                    isMemberView ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-[11px] font-manrope leading-tight transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Teammates with invite link bypass the pending review queue.
              </p>
            </label>

            {/* 3. Mask Environment Secrets */}
            <label
              className={cn(
                "p-3.5 rounded-xl border transition-all duration-700 ease-in-out flex flex-col justify-between gap-3",
                isMemberView ? "cursor-default" : "cursor-pointer",
                roomState.policies.maskSecrets
                  ? isLight
                    ? "bg-zinc-100 border-zinc-400 text-zinc-950 shadow-xs"
                    : "bg-white/[0.06] border-white/30 text-white"
                  : isLight
                  ? "bg-zinc-50/80 border-black/15 text-zinc-600 hover:border-black/25"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold font-manrope transition-colors duration-700 ease-in-out",
                    isLight ? "text-zinc-900" : "text-white"
                  )}
                >
                  Mask Secrets (.env)
                </span>
                <input
                  type="checkbox"
                  disabled={isMemberView}
                  checked={roomState.policies.maskSecrets}
                  onChange={() => !isMemberView && handleTogglePolicy("maskSecrets")}
                  className={cn(
                    "rounded border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100 mt-0.5 accent-zinc-900 dark:accent-white",
                    isMemberView ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-[11px] font-manrope leading-tight transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Redacts sensitive environment tokens from non-host viewers.
              </p>
            </label>

            {/* 4. ANSI Delta Compression */}
            <label
              className={cn(
                "p-3.5 rounded-xl border transition-all duration-700 ease-in-out flex flex-col justify-between gap-3",
                isMemberView ? "cursor-default" : "cursor-pointer",
                roomState.policies.ansiCompression
                  ? isLight
                    ? "bg-zinc-100 border-zinc-400 text-zinc-950 shadow-xs"
                    : "bg-white/[0.06] border-white/30 text-white"
                  : isLight
                  ? "bg-zinc-50/80 border-black/15 text-zinc-600 hover:border-black/25"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold font-manrope transition-colors duration-700 ease-in-out",
                    isLight ? "text-zinc-900" : "text-white"
                  )}
                >
                  ANSI Compression
                </span>
                <input
                  type="checkbox"
                  disabled={isMemberView}
                  checked={roomState.policies.ansiCompression}
                  onChange={() => !isMemberView && handleTogglePolicy("ansiCompression")}
                  className={cn(
                    "rounded border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100 mt-0.5 accent-zinc-900 dark:accent-white",
                    isMemberView ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-[11px] font-manrope leading-tight transition-colors duration-700 ease-in-out",
                  isLight ? "text-zinc-600" : "text-zinc-400"
                )}
              >
                Minimizes packet size across WebSocket duplex connections.
              </p>
            </label>
          </div>
        </div>
      )}

        {/* BOTTOM ACTION BAR: [ Leave Room ] (for member) or [ Discard Room ] + [ Launch Desktop OS ] (for host) */}
        <div
          className={cn(
            "py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t transition-colors duration-700 ease-in-out",
            isLight ? "border-black/15" : "border-white/10"
          )}
        >
          {isMemberView ? (
            <button
              type="button"
              onClick={onLeaveRoom || (() => router.push("/dashboard"))}
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs sm:text-sm font-semibold font-manrope transition-all duration-300 cursor-pointer active:scale-95 shadow-sm",
                isLight
                  ? "bg-white hover:bg-zinc-100 border-black/10 hover:border-black/20 text-zinc-700 hover:text-zinc-950 shadow-sm"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Room</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDiscardRoom}
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border text-xs sm:text-sm font-semibold font-manrope transition-all duration-700 ease-in-out cursor-pointer active:scale-95",
                isLight
                  ? "bg-white hover:bg-zinc-100 border-black/10 hover:border-black/20 text-zinc-700 hover:text-zinc-950 shadow-sm"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
              )}
            >
              <span>Discard Room</span>
            </button>
          )}

          {!isMemberView && onLaunchWorkspace && (
            <div className="w-full sm:w-auto flex items-center gap-4">
              {/* Primary Launch CTA */}
              <button
                type="button"
                onClick={onLaunchWorkspace}
                className="w-full sm:w-auto relative group cursor-pointer overflow-hidden rounded-xl p-[1.5px] transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 opacity-90 group-hover:opacity-100 transition-opacity" />

                <div className="relative rounded-xl bg-[#080a12] group-hover:bg-[#0c101a] px-7 py-3 flex items-center justify-center gap-2.5 transition-colors">
                  <span className="text-xs sm:text-sm font-bold text-white font-manrope tracking-wide">
                    Launch Desktop OS
                  </span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="lobby-toast-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border backdrop-blur-xl flex items-center gap-2.5 text-xs transition-colors duration-700 ease-in-out shadow-2xl",
              isLight
                ? "bg-white/95 border-black/10 text-zinc-900 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                : "bg-black/90 border-white/20 text-white shadow-2xl"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-white animate-pulse" />
            <span className="font-manrope">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LobbyRoom;
