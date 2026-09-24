"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChatCircle,
  Brain,
  Database,
  TerminalWindow,
  Code,
  FileText,
  Check,
  CircleNotch,
  Clock,
  Minus,
  Globe,
  ShieldCheck,
} from "@phosphor-icons/react";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { TextAnimation } from "@/components/ui/text-animation";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────
   Bento Grid: 5 Pillars of the EnvOS Approach
   Grid: 3 cards top row · 2 cards bottom row
   Each FeatCard takes: title, description, children (visual)
────────────────────────────────────────────────────── */

interface FeatCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Optional extra classes for sizing/spanning */
  className?: string;
  delay?: number;
}

export function FeatCard({ title, description, children, className = "", delay = 0 }: FeatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-[24px] p-4 sm:p-5",
        "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Liquid Glass Background Layer (z-0) - Exactly like the Navbar */}
      <div className="absolute inset-0 z-0 rounded-[24px] pointer-events-none glass-liquid-bar backdrop-blur-xl backdrop-saturate-150" />

      {/* Liquid Metal Border Layer (z-10, sits right on top of the rim) */}
      <div className="absolute inset-0 z-10 rounded-[24px] overflow-hidden pointer-events-none liquid-metal-border-mask">
        <LiquidMetal
          colorBack="#888888"
          colorTint="#ffffff"
          speed={0.35}
          repetition={4}
          distortion={0.15}
          scale={1}
          className="absolute inset-0 z-0 rounded-[24px]"
        />
      </div>

      {/* Content (z-20) */}
      <div className="relative z-20 flex flex-col gap-1 text-left pointer-events-auto">
        <h3 className="font-instrument italic text-white text-xl sm:text-2xl tracking-normal font-normal leading-snug">
          <TextAnimation delay={delay}>
            {title}
          </TextAnimation>
        </h3>
        <p className="text-zinc-300/85 text-xs sm:text-[13px] font-manrope font-normal leading-relaxed max-w-[95%]">
          <TextAnimation delay={delay + 0.15}>
            {description}
          </TextAnimation>
        </p>
      </div>
      <div className="relative z-20 mt-2 flex-1 w-full min-h-[170px] rounded-[16px] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md pointer-events-auto">
        {children}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Card1 – 01 / Execution: ANSI Delta Streaming
   Node graph showing data flow from Browser to Runner
   ───────────────────────────────────────────── */

type ActiveStep = 'request' | 'router' | 'agent' | 'memory' | 'tools' | 'response';

const VW = 320;
const VH = 240;

interface NodeConfig {
  id: string;
  x: number;
  y: number;
  icon?: any;
  label?: string;
  type: 'box' | 'circle';
}

const NODES: NodeConfig[] = [
  { id: 'A', x: 50, y: 120, icon: Globe, label: "BROWSER", type: 'box' },
  { id: 'Router', x: 125, y: 120, type: 'circle' },
  { id: 'C', x: 200, y: 120, icon: TerminalWindow, label: "RUNNER", type: 'box' },
  { id: 'B', x: 280, y: 50, icon: Code, label: "MONACO", type: 'box' },
  { id: 'D', x: 280, y: 190, icon: Database, label: "XTERM", type: 'box' },
];

interface FlowPath {
  id: string;
  d: string;
  activeSteps: ActiveStep[];
  flowDirection: 'forward' | 'backward' | 'both';
  colorClass: string;
}

const PATHS: FlowPath[] = [
  {
    id: "a-to-router",
    d: "M 78 120 L 113 120",
    activeSteps: ["request"],
    flowDirection: "forward",
    colorClass: "text-cyan-500 dark:text-cyan-400",
  },
  {
    id: "router-to-agent",
    d: "M 137 120 L 172 120",
    activeSteps: ["agent"],
    flowDirection: "forward",
    colorClass: "text-violet-500 dark:text-violet-400",
  },
  {
    id: "agent-to-memory",
    d: "M 200 92 L 200 50 L 252 50",
    activeSteps: ["memory"],
    flowDirection: "both",
    colorClass: "text-fuchsia-500 dark:text-fuchsia-400",
  },
  {
    id: "agent-to-tools",
    d: "M 200 148 L 200 190 L 252 190",
    activeSteps: ["tools"],
    flowDirection: "both",
    colorClass: "text-emerald-500 dark:text-emerald-400",
  },
  {
    id: "response-flow-1",
    d: "M 172 120 L 137 120",
    activeSteps: ["response"],
    flowDirection: "forward",
    colorClass: "text-cyan-500 dark:text-cyan-400",
  },
  {
    id: "response-flow-2",
    d: "M 113 120 L 78 120",
    activeSteps: ["response"],
    flowDirection: "forward",
    colorClass: "text-cyan-500 dark:text-cyan-400",
  },
];

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; buttonBg: string; buttonBorder: string }> = {
  A: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/5",
    border: "border-cyan-500/60 dark:border-cyan-400/50",
    text: "text-cyan-400",
    buttonBg: "bg-cyan-500",
    buttonBorder: "border-cyan-600",
  },
  Router: {
    bg: "bg-amber-500/10 dark:bg-amber-500/5",
    border: "border-amber-500/60 dark:border-amber-400/50",
    text: "text-amber-400",
    buttonBg: "bg-amber-500",
    buttonBorder: "border-amber-600",
  },
  C: {
    bg: "bg-violet-500/10 dark:bg-violet-500/5",
    border: "border-violet-500/60 dark:border-violet-400/50",
    text: "text-violet-400",
    buttonBg: "bg-violet-500",
    buttonBorder: "border-violet-600",
  },
  B: {
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/5",
    border: "border-fuchsia-500/60 dark:border-fuchsia-400/50",
    text: "text-fuchsia-400",
    buttonBg: "bg-fuchsia-500",
    buttonBorder: "border-fuchsia-600",
  },
  D: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
    border: "border-emerald-500/60 dark:border-emerald-400/50",
    text: "text-emerald-400",
    buttonBg: "bg-emerald-500",
    buttonBorder: "border-emerald-600",
  },
};

export function Card1() {
  const [step, setStep] = useState<ActiveStep>("request");

  useEffect(() => {
    const steps: ActiveStep[] = ["request", "router", "agent", "memory", "tools", "response"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setStep(steps[idx]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isNodeActive = (nodeId: string) => {
    switch (step) {
      case 'request':
        return nodeId === 'A';
      case 'router':
        return nodeId === 'Router';
      case 'agent':
        return nodeId === 'C';
      case 'memory':
        return nodeId === 'C' || nodeId === 'B';
      case 'tools':
        return nodeId === 'C' || nodeId === 'D';
      case 'response':
        return nodeId === 'C' || nodeId === 'Router' || nodeId === 'A';
      default:
        return false;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-transparent rounded-xl flex items-center justify-center p-2">
      {/* ── Layer 1: Clean dotted grid ── */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <pattern id="clean-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.75" fill="currentColor" className="text-zinc-800/60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#clean-grid)" />
      </svg>

      {/* ── Layer 2: Connector SVG & Nodes ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {/* Base Static Connection Paths */}
        <path d="M 78 120 L 113 120" fill="none" stroke="currentColor" className="text-zinc-800/80" strokeWidth="1" />
        <path d="M 137 120 L 172 120" fill="none" stroke="currentColor" className="text-zinc-800/80" strokeWidth="1" />
        <path d="M 200 92 L 200 50 L 252 50" fill="none" stroke="currentColor" className="text-zinc-800/80" strokeWidth="1" />
        <path d="M 200 148 L 200 190 L 252 190" fill="none" stroke="currentColor" className="text-zinc-800/80" strokeWidth="1" />

        {/* Animated Flow Overlays */}
        {PATHS.map((p) => {
          const isActive = p.activeSteps.includes(step);
          if (!isActive) return null;

          return (
            <g key={p.id}>
              <motion.path
                d={p.d}
                fill="none"
                stroke="currentColor"
                className={p.colorClass}
                strokeWidth="3.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              <motion.path
                d={p.d}
                fill="none"
                stroke="currentColor"
                className={p.colorClass}
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </g>
          );
        })}

        {/* ForeignObjects for Nodes */}
        {NODES.map((node) => {
          const isBox = node.type === 'box';
          const w = isBox ? 56 : 24;
          const h = isBox ? 56 : 24;
          const isActive = isNodeActive(node.id);
          const colorStyles = NODE_COLORS[node.id];

          return (
            <foreignObject
              key={node.id}
              x={node.x - w / 2}
              y={node.y - h / 2}
              width={w}
              height={h}
              className="overflow-visible"
            >
              <div className="w-full h-full flex items-center justify-center">
                {isBox && node.icon ? (
                  <div
                    className={`w-full h-full rounded-[14px] border flex flex-col items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_0_rgba(0,0,0,0.3)] text-white ${colorStyles.buttonBg} ${colorStyles.buttonBorder}`}
                  >
                    <div className="mb-0.5 flex items-center justify-center">
                      <node.icon className="w-5 h-5" weight="fill" />
                    </div>
                    <span className="text-[8px] font-mono font-bold tracking-wider select-none">
                      {node.label}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all duration-300 ${isActive
                      ? "bg-amber-500/20 border-amber-500/70"
                      : "bg-neutral-900 border-zinc-700"
                      }`}
                  >
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full border border-dashed ${isActive ? "border-amber-500" : "border-zinc-500"
                        }`}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card2 – 02 / Portability: Decoupled Dedicated Nodes
───────────────────────────────────────────── */
export function Card2() {
  const bars = [45, 75, 35, 85, 60, 95, 50];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-3.5 justify-between p-2">
      {/* Stats row */}
      <div className="flex gap-3 pt-1 pr-1 pb-0.5 pl-0.5">
        {[
          { label: "PTY Latency", value: "1.2ms", trend: "-24%" },
          { label: "Bandwidth", value: "18 KB/s", trend: "-95%" },
        ].map((s, i) => {
          const isActive = i === activeIdx || hoveredIdx === i;

          return (
            <div key={i} className="flex-1 h-[72px] relative select-none">
              <div
                className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.02]"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 7px)",
                  color: "rgba(255,255,255,0.05)"
                }}
              />

              <motion.div
                className="absolute inset-0 w-full h-full rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 p-2.5 hover:bg-white/[0.1] transition-colors duration-300 flex items-center justify-between gap-2 cursor-pointer shadow-sm"
                animate={{
                  x: isActive ? "0.35rem" : "0rem",
                  y: isActive ? "-0.35rem" : "0rem",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[7.5px] text-zinc-400 font-mono uppercase tracking-widest leading-none">{s.label}</span>
                  <span className="text-sm font-bold font-mono text-white leading-none mt-1.5 tracking-tight">{s.value}</span>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[7.5px] font-mono font-bold text-emerald-400">
                      {s.trend}
                    </span>
                    <span className="text-[7.5px] text-zinc-500 font-mono">prev</span>
                  </div>
                </div>

                <div className="w-10 h-5 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 48 24">
                    <motion.path
                      d={i === 0
                        ? "M 0 18 L 16 11 L 32 14 L 48 4"
                        : "M 0 4 L 16 12 L 32 8 L 48 18"
                      }
                      fill="none"
                      stroke="currentColor"
                      className="text-zinc-500"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                    />
                    {(i === 0
                      ? [{ x: 0, y: 18 }, { x: 16, y: 11 }, { x: 32, y: 14 }, { x: 48, y: 4 }]
                      : [{ x: 0, y: 4 }, { x: 16, y: 12 }, { x: 32, y: 8 }, { x: 48, y: 18 }]
                    ).map((pt, idx) => (
                      <motion.circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="1.5"
                        className="fill-neutral-900 stroke-zinc-400"
                        strokeWidth="1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.08, duration: 0.25 }}
                      />
                    ))}
                  </svg>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex items-end gap-2 px-1 min-h-[75px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 h-full rounded-xl bg-white/[0.03] border border-white/10 relative overflow-hidden"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 7px)",
              color: "rgba(255,255,255,0.03)"
            }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-blue-500 border-t border-blue-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] rounded-t-[8px]"
              initial={{ height: "0%" }}
              animate={{
                height: [
                  `${h}%`,
                  `${Math.min(95, h + 15)}%`,
                  `${Math.max(10, h - 20)}%`,
                  `${Math.min(90, h + 8)}%`,
                  `${h}%`
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + (i % 3) * 0.8,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          </div>
        ))}
      </div>

      {/* X labels */}
      <div className="flex gap-2 px-1">
        {days.map((d, i) => (
          <p key={i} className="flex-1 text-center text-[7.5px] text-zinc-500 font-mono font-medium">{d}</p>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card3 – 03 / Collaboration: True Operating System Feel
   Stacked Infinite-Scroll Activity Feed
   ───────────────────────────────────────────── */

const STATUS_ICONS: Record<string, { icon: any; color: string; bg: string; gradient: string; border: string }> = {
  done: { icon: Check, color: "text-lime-400", bg: "bg-lime-500/15", gradient: "bg-gradient-to-b from-lime-400 to-lime-600", border: "border-lime-600" },
  running: { icon: CircleNotch, color: "text-blue-400", bg: "bg-blue-400/15", gradient: "bg-gradient-to-b from-blue-400 to-blue-600", border: "border-blue-600" },
  waiting: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/15", gradient: "bg-gradient-to-b from-amber-400 to-amber-600", border: "border-amber-600" },
  idle: { icon: Minus, color: "text-zinc-500", bg: "bg-zinc-800/40", gradient: "bg-gradient-to-b from-zinc-500 to-zinc-700", border: "border-zinc-700" },
};

export function Card3() {
  const logs = [
    { agent: "Host", action: "Shared room: #ENV789 (Host mode)", status: "done", t: "0.1s" },
    { agent: "Editor", action: "Attached to bash /dev/pts/1", status: "running", t: "1.1s" },
    { agent: "Viewer", action: "Streaming ANSI terminal output", status: "running", t: "2.3s" },
    { agent: "Monaco", action: "Collaborative multi-cursor sync", status: "done", t: "0.2s" },
    { agent: "Runner", action: "POSIX node process active", status: "done", t: "—" },
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % logs.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [logs.length]);

  const getSlot = (i: number) => {
    const N = logs.length;
    let rel = i - activeIdx;
    if (rel > Math.floor(N / 2)) rel -= N;
    if (rel < -Math.floor(N / 2)) rel += N;
    return rel;
  };

  const Y: Record<string, number> = { "-2": -64, "-1": -34, "0": 0, "1": 34, "2": 64 };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden p-2">
      {logs.map((l, i) => {
        const slot = getSlot(i);
        const si = STATUS_ICONS[l.status];
        const abs = Math.abs(slot);
        const isActive = slot === 0;
        const isVisible = abs <= 2;

        const yOffset = Y[String(slot)] ?? (slot < 0 ? -120 : 120);
        const scale = isActive ? 1 : abs === 1 ? 0.93 : 0.87;
        const opacity = isActive ? 1 : abs === 1 ? 0.65 : 0.38;
        const zIndex = isActive ? 30 : abs === 1 ? 20 : 10;

        return (
          <motion.div
            key={l.agent}
            className="absolute left-0 right-0 mx-auto px-2"
            style={{ zIndex }}
            animate={{
              y: isVisible ? yOffset : slot < 0 ? -150 : 150,
              scale,
              opacity: isVisible ? opacity : 0,
            }}
            transition={{
              y: { type: "spring", stiffness: 500, damping: 35 },
              scale: { type: "spring", stiffness: 500, damping: 35 },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
          >
            <div className={`w-full rounded-2xl border flex items-center gap-2.5 backdrop-blur-md ${isActive
              ? "px-3 py-2 bg-white/[0.08] border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
              : "px-2.5 py-1.5 bg-white/[0.03] border-white/10"
              }`}>

              <div className={`shrink-0 rounded-[8px] flex items-center justify-center font-bold text-white transition-all duration-300 ${si.gradient} border ${si.border} shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.6)] ${isActive ? "w-7 h-7" : "w-5 h-5"
                }`}>
                <si.icon weight="bold" className={`${isActive ? "w-3.5 h-3.5" : "w-2.5 h-2.5"} ${l.status === "running" ? "animate-spin" : ""}`} />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono font-semibold text-white leading-none ${isActive ? "text-[10px]" : "text-[9px]"
                    }`}>{l.agent}</span>
                  <span className={`font-mono uppercase tracking-wide rounded px-1 py-0.5 ${si.bg} ${si.color} ${isActive ? "text-[7px]" : "text-[6px]"
                    }`}>{l.status}</span>
                </div>
                {isActive && (
                  <p className="text-[9px] text-zinc-400 truncate mt-0.5 leading-tight">{l.action}</p>
                )}
              </div>

              {isActive && (
                <span className="text-[8.5px] font-mono text-zinc-500 shrink-0">{l.t}</span>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Progress dots */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {logs.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full bg-white/25"
            animate={{
              width: i === activeIdx ? 14 : 4,
              opacity: i === activeIdx ? 0.7 : 0.2,
            }}
            style={{ height: 3 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card4 – 04 / Continuity: Stateful Session Memory
   Rolling 64KB scrollback ring + 15m grace reaper
   ───────────────────────────────────────────── */

const NS_ICONS: Record<string, React.ElementType> = {
  scrollback: Database,
  grace_timer: Clock,
  workspace: FileText,
  pty_stream: TerminalWindow,
};

const NS_COLORS: Record<string, { bar: string; dot: string; badge: string; buttonBg: string; buttonBorder: string }> = {
  scrollback: { bar: "from-violet-500 to-violet-400", dot: "bg-violet-500", badge: "bg-violet-500/15 text-violet-400", buttonBg: "bg-violet-500", buttonBorder: "border-violet-600" },
  grace_timer: { bar: "from-sky-500 to-sky-400", dot: "bg-sky-500", badge: "bg-sky-500/15 text-sky-400", buttonBg: "bg-sky-500", buttonBorder: "border-sky-600" },
  workspace: { bar: "from-emerald-500 to-emerald-400", dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-400", buttonBg: "bg-emerald-500", buttonBorder: "border-emerald-600" },
  pty_stream: { bar: "from-amber-500 to-amber-400", dot: "bg-amber-500", badge: "bg-amber-500/15 text-amber-400", buttonBg: "bg-amber-500", buttonBorder: "border-amber-600" },
};

const RETRIEVAL_QUERIES = [
  { ns: "scrollback", q: "replay 64 KB rolling ANSI buffer", t: "0.1s" },
  { ns: "grace_timer", q: "15-minute background grace period", t: "0.9s" },
  { ns: "workspace", q: "chokidar file-tree delta synchronized", t: "1.4s" },
  { ns: "pty_stream", q: "terminal socket session reconnected", t: "2.3s" },
  { ns: "scrollback", q: "restored exact terminal grid state", t: "3.5s" },
];

export function Card4() {
  const namespaces = [
    { name: "scrollback", hits: 64, fill: 95 },
    { name: "grace_timer", hits: 15, fill: 75 },
    { name: "workspace", hits: 342, fill: 88 },
    { name: "pty_stream", hits: 128, fill: 50 },
  ];

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % RETRIEVAL_QUERIES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeNs = RETRIEVAL_QUERIES[tick].ns;
  const recentQueries = [0, 1, 2, 3].map(
    (offset) => RETRIEVAL_QUERIES[(tick - offset + RETRIEVAL_QUERIES.length) % RETRIEVAL_QUERIES.length]
  );

  return (
    <div className="w-full h-full flex flex-col sm:flex-row gap-4 py-2.5 px-3">

      {/* ── Left panel: Memory ring buffers ── */}
      <div className="flex-1 flex flex-col gap-0 min-w-0 pr-1">
        <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-2.5 text-left">Session Memory Buffers</p>

        <div className="flex flex-col gap-2.5 flex-1">
          {namespaces.map((ns, i) => {
            const c = NS_COLORS[ns.name];
            const isActive = ns.name === activeNs;
            const Icon = (NS_ICONS[ns.name] || Database) as React.ComponentType<{ size?: number; weight?: string; className?: string }>;

            return (
              <div key={ns.name} className="flex items-center gap-2.5 group relative">
                <div
                  className={`relative flex shrink-0 items-center justify-center w-[30px] h-[30px] rounded-[10px] border transition-all duration-500 ${isActive ? `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] text-white ${c.buttonBg} ${c.buttonBorder} scale-105` : 'bg-white/[0.05] border-white/10 text-zinc-400'}`}
                >
                  <Icon size={14} weight={isActive ? "fill" : "regular"} className="relative z-10" />
                </div>

                <span className={`text-[9.5px] font-mono w-20 shrink-0 text-left transition-colors duration-300 ${isActive ? "text-white font-semibold" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                  {ns.name}
                </span>

                <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden relative">
                  <motion.div
                    className={`absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r ${c.bar}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${ns.fill}%`, opacity: isActive ? 1 : 0.3 }}
                    transition={{
                      width: { duration: 1.2, delay: i * 0.1, type: "spring", bounce: 0.2 },
                      opacity: { duration: 0.4 },
                    }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    )}
                  </motion.div>
                </div>

                <div className={`flex items-center gap-1.5 w-10 justify-end transition-all duration-300 ${isActive ? "opacity-100 scale-105" : "opacity-60 scale-100"}`}>
                  <span className={`text-[8.5px] font-mono font-medium ${isActive ? "text-white" : "text-zinc-400"}`}>
                    {ns.hits}
                  </span>
                  {isActive && (
                    <motion.div
                      className={`w-1 h-1 rounded-full ${c.dot}`}
                      animate={{ opacity: [1, 0.2, 1], scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Thin divider */}
      <div className="hidden sm:block w-px bg-white/10 self-stretch shrink-0" />

      {/* ── Right panel: Replay log ── */}
      <div className="w-full sm:w-[190px] shrink-0 flex flex-col gap-0 text-left">
        <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-2">State Replay Log</p>

        <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
          {recentQueries.map((q, qi) => {
            const c = NS_COLORS[q.ns];
            return (
              <motion.div
                key={`${q.ns}-${q.q}-${qi}`}
                className="rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-md px-2 py-1.5"
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: qi === 0 ? 1 : qi === 1 ? 0.8 : qi === 2 ? 0.5 : 0.25,
                  y: 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35, delay: qi * 0.05 }}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`text-[6.5px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded-md ${c.badge}`}>
                    {q.ns}
                  </span>
                  <span className="text-[7px] font-mono text-zinc-500 ml-auto tabular-nums">{q.t}</span>
                </div>
                <p className="text-[7.5px] text-zinc-300 leading-tight font-mono truncate">{q.q}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────
   Card5 – 05 / Governance: Server-Enforced RBAC
   Inspector for socket roles and permission guards
───────────────────────────────────────────── */
export function Card5() {
  const tools = [
    { name: "ws_auth_guard", calls: 42, icon: ShieldCheck, latency: "0.4ms", color: "bg-gradient-to-b from-sky-400 to-sky-600", borderColor: "border-sky-600" },
    { name: "pty_intercept", calls: 18, icon: TerminalWindow, latency: "0.9ms", color: "bg-gradient-to-b from-emerald-400 to-emerald-600", borderColor: "border-emerald-600" },
    { name: "role_switch", calls: 7, icon: Clock, latency: "12ms", color: "bg-gradient-to-b from-amber-400 to-amber-600", borderColor: "border-amber-600" },
    { name: "rbac_validate", calls: 56, icon: Check, latency: "0.6ms", color: "bg-gradient-to-b from-violet-400 to-violet-600", borderColor: "border-violet-600" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="grid grid-cols-2 gap-2 w-full">
        {tools.map((t, i) => (
          <motion.div
            key={i}
            className="relative rounded-[16px] border border-white/10 bg-white/[0.05] backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between p-2.5 group hover:border-white/20 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-start justify-between">
              <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-white ${t.color} border ${t.borderColor} shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.6)] group-hover:scale-105 transition-transform duration-300`}>
                <t.icon weight="fill" className="w-3.5 h-3.5 relative z-10" />
              </div>

              <div className="flex flex-col items-end gap-0.5 mt-0.5">
                <span className="text-[11px] font-mono font-bold text-white leading-none">{t.calls}</span>
                <span className="text-[6.5px] font-mono text-zinc-400 uppercase tracking-widest leading-none">Passed</span>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-mono font-medium text-zinc-200 tracking-tight">{t.name}</span>
                <span className="text-[7.5px] font-mono text-zinc-400 tabular-nums">{t.latency}</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden relative">
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 rounded-full ${t.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${(t.calls / 56) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Bento Grid Component
───────────────────────────────────────────── */
const CARDS = [
  {
    title: "Execution",
    description: "ANSI Delta Streaming: Zero screen capture. The browser renders native Monaco and xterm canvases locally, transmitting only lightweight text packets over WebSockets.",
    visual: <Card1 />,
    colSpan: "lg:col-span-1",
    height: "min-h-[350px]",
  },
  {
    title: "Portability",
    description: "Decoupled Dedicated Nodes: Run builds, bash commands, and scripts on your own dedicated runner hardware with real POSIX stability.",
    visual: <Card2 />,
    colSpan: "lg:col-span-1",
    height: "min-h-[350px]",
  },
  {
    title: "Collaboration",
    description: "True Operating System Feel: A cohesive, multi-window desktop interface with instant 6-digit room sharing and live RBAC (Host, Editor, Viewer).",
    visual: <Card3 />,
    colSpan: "lg:col-span-1",
    height: "min-h-[350px]",
  },
  {
    title: "Continuity",
    description: "Stateful Session Memory: Disconnected clients trigger a 15-minute background grace period instead of an instant kill. Rejoining instantly replays a 64 KB rolling ANSI scrollback ring, restoring the exact terminal state.",
    visual: <Card4 />,
    colSpan: "lg:col-span-2",
    height: "min-h-[350px]",
  },
  {
    title: "Governance",
    description: "Server-Enforced RBAC: Fine-grained role switching on the fly. The host dynamically delegates Host, Editor, or Viewer roles, with permission checks validated at the runner's WebSocket layer—blocking unauthorized terminal input before it ever touches bash.",
    visual: <Card5 />,
    colSpan: "lg:col-span-1",
    height: "min-h-[350px]",
  }
];

export interface BentoGridProps {
  className?: string;
}

export function BentoGrid({ className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-6xl mx-auto", className)}>
      {CARDS.map((card, idx) => (
        <FeatCard
          key={idx}
          title={card.title}
          description={card.description}
          delay={idx * 0.1}
          className={cn(card.colSpan, card.height)}
        >
          {card.visual}
        </FeatCard>
      ))}
    </div>
  );
}

export default BentoGrid;
