"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockAppItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  isOpen?: boolean;
}

interface MacDockProps {
  onAppClick: (appId: string) => void;
  openApps: string[];
  className?: string;
}

// Crisp Vector SVGs for macOS Tahoe / Sonoma Apps matching the screenshot
export function FinderIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#1e40af] flex items-center justify-center border border-white/25">
      {/* Two tone face */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-[#38bdf8]/60" />
        <div className="w-1/2 h-full bg-[#0284c7]/40" />
      </div>
      <svg viewBox="0 0 48 48" className="w-8 h-8 relative z-10" fill="none">
        {/* Left eye */}
        <ellipse cx="16" cy="18" rx="2.5" ry="3.5" fill="#1e293b" />
        {/* Right eye */}
        <ellipse cx="32" cy="18" rx="2.5" ry="3.5" fill="#1e293b" />
        {/* Smile */}
        <path
          d="M14 26C16 32 32 32 34 26"
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Division line */}
        <path
          d="M24 10V22C24 24 21 26 21 26"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function SafariIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#60a5fa] via-[#2563eb] to-[#1d4ed8] flex items-center justify-center border border-white/25">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white via-[#f1f5f9] to-[#cbd5e1] p-0.5 shadow-md flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] flex items-center justify-center relative overflow-hidden">
          {/* Compass ticks */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-white" />
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-white" />
            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-white" />
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-white" />
          </div>
          {/* Compass Needle */}
          <div className="relative w-7 h-7 flex items-center justify-center rotate-45">
            <div className="w-1.5 h-3.5 bg-red-500 rounded-t-sm shadow-sm" />
            <div className="w-1.5 h-3.5 bg-white rounded-b-sm shadow-sm" />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function MessagesIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-b from-[#4ade80] via-[#22c55e] to-[#16a34a] flex items-center justify-center border border-white/25">
      <div className="w-7 h-6 rounded-2xl bg-white shadow-md relative flex items-center justify-center">
        <div className="absolute -bottom-1 left-2 w-2.5 h-2.5 bg-white rotate-45 rounded-sm" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function MailIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#0369a1] flex items-center justify-center border border-white/25">
      <div className="w-7 h-5 bg-white rounded-md shadow-md relative overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 28 20" className="w-full h-full" fill="none">
          <path d="M0 0L14 11L28 0" stroke="#0284c7" strokeWidth="2.5" />
          <path d="M0 20L10 9" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M28 20L18 9" stroke="#94a3b8" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function NotesIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-b from-[#fef08a] via-[#fde047] to-[#eab308] flex flex-col border border-white/25">
      {/* Brown leather binding */}
      <div className="h-2.5 bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f] border-b border-amber-900/30" />
      {/* Note lines */}
      <div className="flex-1 p-1.5 flex flex-col justify-around">
        <div className="w-full h-0.5 bg-amber-400/50 rounded" />
        <div className="w-4/5 h-0.5 bg-amber-400/50 rounded" />
        <div className="w-full h-0.5 bg-amber-400/50 rounded" />
        <div className="w-3/5 h-0.5 bg-amber-400/50 rounded" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function PhotosIcon() {
  const petals = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-white flex items-center justify-center border border-white/40">
      <div className="relative w-7 h-7 flex items-center justify-center">
        {petals.map((color, i) => (
          <div
            key={i}
            className="absolute w-2 h-4 rounded-full opacity-80"
            style={{
              backgroundColor: color,
              transform: `rotate(${i * 45}deg) translateY(-5px)`,
              transformOrigin: "center bottom",
            }}
          />
        ))}
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner relative z-10" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function AppleTvIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-b from-[#27272a] via-[#18181b] to-[#09090b] flex items-center justify-center border border-white/20">
      <div className="flex items-center gap-0.5 text-zinc-100 font-bold tracking-tight">
        <span className="text-base"></span>
        <span className="text-[11px] font-sans">tv</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}

export function AppStoreIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#0369a1] flex items-center justify-center border border-white/25">
      <div className="text-white font-extrabold text-xl font-sans tracking-tighter drop-shadow-md">
        A
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function FreeformIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-white flex items-center justify-center border border-white/40">
      <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
        <path
          d="M6 16C6 10 14 6 18 10C22 14 10 24 16 26C20 27 26 22 26 16"
          stroke="url(#freeform-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="freeform-grad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="0.5" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function KeynoteIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#1e40af] flex items-center justify-center border border-white/25">
      <div className="w-6 h-6 flex flex-col items-center justify-center">
        <div className="w-5 h-4 bg-white/95 rounded-sm shadow-sm flex items-end justify-center gap-0.5 p-0.5">
          <div className="w-1 h-1.5 bg-blue-500 rounded-xs" />
          <div className="w-1 h-2.5 bg-amber-500 rounded-xs" />
          <div className="w-1 h-3 bg-emerald-500 rounded-xs" />
        </div>
        <div className="w-3.5 h-1 border-b-2 border-white/80" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
}

export function LaunchpadIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-b from-[#3f3f46] via-[#27272a] to-[#18181b] flex items-center justify-center border border-white/20">
      <div className="grid grid-cols-3 gap-1">
        <div className="w-1.5 h-1.5 rounded-xs bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-amber-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-emerald-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-cyan-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-blue-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-purple-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-pink-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-orange-400" />
        <div className="w-1.5 h-1.5 rounded-xs bg-teal-400" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}

export function SettingsIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-b from-[#71717a] via-[#52525b] to-[#27272a] flex items-center justify-center border border-white/25">
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-100 fill-zinc-200" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="3" fill="#3f3f46" stroke="none" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/25 pointer-events-none" />
    </div>
  );
}

export function IdeIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] flex items-center justify-center border border-indigo-500/40">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.4),transparent_70%)]" />
      <div className="relative z-10 flex items-center justify-center gap-0.5">
        <span className="text-cyan-400 font-mono font-black text-base tracking-tighter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
          &lt;
        </span>
        <span className="text-indigo-300 font-mono font-bold text-sm">/</span>
        <span className="text-cyan-400 font-mono font-black text-base tracking-tighter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
          &gt;
        </span>
      </div>
      <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}

// EnvOS Developer App Icons (appear in dock when running/toggled)
export function CodeStudioIcon() {
  return <IdeIcon />;
}

export function TerminalAppIcon() {
  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden shadow-lg relative bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#000000] flex items-center justify-center border border-emerald-500/30">
      <span className="text-emerald-400 font-mono font-bold text-sm">$_</span>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-emerald-400/20 pointer-events-none" />
    </div>
  );
}

// Active Dock Icons (EnvOS IDE, Safari, Messages, Notes, Launchpad, Settings)
export const MACOS_APPS: DockAppItem[] = [
  { id: "ide", name: "EnvOS IDE", icon: <IdeIcon /> },
  { id: "safari", name: "Safari Browser", icon: <SafariIcon /> },
  { id: "messages", name: "Messages", icon: <MessagesIcon /> },
  { id: "notes", name: "Notes", icon: <NotesIcon /> },
  { id: "launchpad", name: "Launchpad", icon: <LaunchpadIcon /> },
  { id: "settings", name: "System Settings", icon: <SettingsIcon /> },
];

function MacDockItem({
  app,
  mouseX,
  isOpen,
  onClick,
}: {
  app: DockAppItem;
  mouseX: any;
  isOpen: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Magnification curve
  const widthSync = useTransform(distance, [-120, 0, 120], [44, 64, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="group relative aspect-square flex flex-col items-center justify-end cursor-pointer"
      onClick={onClick}
    >
      {/* Tooltip via pure CSS: zero React re-renders, 100% smooth */}
      <div className="absolute -top-10 px-3 py-1 rounded-md bg-black/85 border border-white/15 text-[11px] font-manrope font-medium text-white whitespace-nowrap shadow-xl pointer-events-none z-50 backdrop-blur-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-150">
        {app.name}
      </div>

      {/* Icon Frame */}
      <div className="w-full h-full flex items-center justify-center transition-transform hover:-translate-y-1">
        {app.icon}
      </div>

      {/* Running indicator dot */}
      {isOpen && (
        <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
      )}
    </motion.div>
  );
}

export function MacDock({ onAppClick, openApps, className }: MacDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "flex h-[68px] items-end gap-2.5 sm:gap-3 rounded-[24px] border border-white/20 bg-black/35 px-4 pb-2 pt-2 backdrop-blur-2xl shadow-2xl transition-all",
        className
      )}
    >
      {MACOS_APPS.map((app) => (
        <MacDockItem
          key={app.id}
          app={app}
          mouseX={mouseX}
          isOpen={openApps.includes(app.id)}
          onClick={() => onAppClick(app.id)}
        />
      ))}
    </div>
  );
}
