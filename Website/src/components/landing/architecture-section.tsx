"use client";

import { ArrowRight, Server, Laptop, Cloud, Shield, Terminal, ArrowUpRight } from "lucide-react";
import { GlowCard } from "../ui/glow-card";
import { BorderBeam } from "../ui/border-beam";

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono uppercase tracking-wider mb-4">
          <Server className="w-3.5 h-3.5" />
          <span>Tri-Tier Decoupled Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-orbitron text-zinc-100">
          How EnvOS <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Bypasses</span> the Cloud VM Wall
        </h2>
        <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-sans">
          Traditional cloud editors cost hundreds of dollars each month and sleep after 5 minutes of inactivity. EnvOS decouples compute from presentation for continuous, free performance.
        </p>
      </div>

      {/* 3-Tier Physical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Tier 1 */}
        <GlowCard className="flex flex-col justify-between" glowColor="rgba(59, 130, 246, 0.15)">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                TIER 1
              </span>
              <Laptop className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold font-orbitron text-white">Presentation Plane</h3>
            <p className="mt-1 text-xs text-zinc-400 font-mono">Host &amp; Guest Client Browsers</p>
            <ul className="mt-6 space-y-3 text-xs text-zinc-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">▹</span>
                <span><strong>No Video Streaming</strong>: 100% native DOM canvas rendering for crisp text and zero compression artifacts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">▹</span>
                <span><strong>Monaco Code Studio</strong>: Tabbed VS Code editor engine with TypeScript syntax highlighting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">▹</span>
                <span><strong>xterm.js Canvas</strong>: Hardware-accelerated terminal with WebGL rendering.</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500">
            Storage footprint: 0 MB locally
          </div>
        </GlowCard>

        {/* Tier 2 */}
        <GlowCard className="flex flex-col justify-between" glowColor="rgba(168, 85, 247, 0.15)">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                TIER 2
              </span>
              <Cloud className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold font-orbitron text-white">Control Plane</h3>
            <p className="mt-1 text-xs text-zinc-400 font-mono">Managed Cloud: Supabase</p>
            <ul className="mt-6 space-y-3 text-xs text-zinc-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">▹</span>
                <span><strong>GoTrue Authentication</strong>: User logins, password resets, and cryptographically signed JWT sessions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">▹</span>
                <span><strong>PostgreSQL Metastore</strong>: Profiles, room codes (`ENV789`), and role assignments.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">▹</span>
                <span><strong>Row-Level Security (RLS)</strong>: DB-level security preventing unauthorized metadata tampering.</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500">
            Never touches terminal stream packets
          </div>
        </GlowCard>

        {/* Tier 3 */}
        <GlowCard className="flex flex-col justify-between relative overflow-hidden" glowColor="rgba(16, 185, 129, 0.15)">
          <BorderBeam size={180} duration={10} colorFrom="#10b981" colorTo="#3b82f6" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TIER 3
              </span>
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold font-orbitron text-white">Compute Execution Plane</h3>
            <p className="mt-1 text-xs text-zinc-400 font-mono">Dedicated Runner Node (Laptop 2 / WSL2)</p>
            <ul className="mt-6 space-y-3 text-xs text-zinc-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">▹</span>
                <span><strong>node-pty Engine</strong>: Forks native Linux `/dev/pts` bash shells with live ANSI streaming.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">▹</span>
                <span><strong>Socket.io &amp; Express Daemon</strong>: Ultra-low latency WebSocket pipe with RBAC packet filtering.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">▹</span>
                <span><strong>Circular Scrollback Ring</strong>: 64 KB in-memory rolling buffer for instant state recovery on reconnect.</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500">
            15-minute grace period teardown reaper
          </div>
        </GlowCard>
      </div>

      {/* Docs Link Banner */}
      <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-orbitron font-semibold text-white text-base">Want to dive deeper into the protocols?</h4>
          <p className="text-sm text-zinc-400">Explore full UML component diagrams, sequence flows, and network traversal options in Fumadocs.</p>
        </div>
        <a
          href="http://localhost:3000/docs/architecture"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white whitespace-nowrap transition-colors"
        >
          <span>View UML Architecture Docs</span>
          <ArrowUpRight className="w-4 h-4 text-blue-400" />
        </a>
      </div>
    </section>
  );
}
