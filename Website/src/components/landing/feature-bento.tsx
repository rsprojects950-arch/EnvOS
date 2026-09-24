"use client";

import { GlowCard } from "../ui/glow-card";
import { Terminal, Cpu, Users2, ShieldAlert, Zap, Clock, HardDrive, LayoutGrid } from "lucide-react";
import { BorderBeam } from "../ui/border-beam";

export function FeatureBento() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Core Engineering Highlights</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-orbitron text-zinc-100">
          Engineered for <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Power</span> &amp; <span className="text-emerald-400">Zero Cost</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-sans">
          EnvOS breaks the cloud VM barrier by decoupling presentation from execution. Experience a real Linux workstation in any browser tab.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Decoupled Compute Architecture (Wide) */}
        <GlowCard
          className="md:col-span-2 relative overflow-hidden"
          glowColor="rgba(99, 102, 241, 0.2)"
        >
          <BorderBeam size={220} duration={14} colorFrom="#6366f1" colorTo="#a855f7" />
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-white">
                Decoupled Tri-Tier Compute Plane
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Thin-client browser handles UI rendering at native DPI, while all compilation, node_modules installations, and bash executions run on your dedicated runner node.
              </p>
            </div>

            {/* Visual Diagram Snippet */}
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-zinc-300">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2 border-b border-white/5 pb-2">
                <span>CLIENT PRESENTATION TIER</span>
                <span className="text-emerald-400 font-semibold">0 MB FOOTPRINT</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>• Presentation Engine:</span>
                <span className="text-zinc-400">React 19 + Tailwind + Monaco Canvas</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>• Execution Node:</span>
                <span className="text-blue-400">Dedicated Node.js / WSL2 Daemon</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>• Cloud Cost:</span>
                <span className="text-emerald-400 font-bold">$0.00 / month</span>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Card 2: Real Bash Shell (node-pty) */}
        <GlowCard glowColor="rgba(16, 185, 129, 0.2)">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-orbitron text-white">
            Native Unix PTY
          </h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Spawns real <code className="text-emerald-400 font-mono text-xs">/dev/pts</code> Linux child processes using <code className="text-zinc-200 font-mono text-xs">node-pty</code>. Not a fake browser WASM sandbox.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-emerald-400">
            $ git clone &amp;&amp; npm install<br />
            <span className="text-zinc-500">Executing on real Linux SSD</span>
          </div>
        </GlowCard>

        {/* Card 3: Multiplayer RBAC */}
        <GlowCard glowColor="rgba(59, 130, 246, 0.2)">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
            <Users2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-orbitron text-white">
            Role-Based Access
          </h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Fine-grained access control: Host, Editor, and Viewer. Viewers watch ANSI stdout in real time without ability to modify disk or bash state.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">HOST: RW</span>
            <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-mono">EDITOR: RW</span>
            <span className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-mono">VIEWER: RO</span>
          </div>
        </GlowCard>

        {/* Card 4: 15-Min Reconnection Grace Period */}
        <GlowCard glowColor="rgba(245, 158, 11, 0.2)">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-orbitron text-white">
            15-Min Grace Reaper
          </h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Close your tab or switch laptops—your running processes stay alive in the background. Rejoin the 6-character room code to seamlessly resume.
          </p>
          <div className="mt-4 p-2.5 rounded bg-black/60 border border-white/5 font-mono text-[11px] text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>State preserved in memory</span>
          </div>
        </GlowCard>

        {/* Card 5: Path Traversal Protection (Jail Barrier) */}
        <GlowCard glowColor="rgba(239, 68, 68, 0.2)">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-orbitron text-white">
            Filesystem Jail Barrier
          </h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Strict path resolution containment enforces that every file CRUD operation stays confined within the allocated workspace directory.
          </p>
          <div className="mt-4 p-2.5 rounded bg-black/60 border border-white/5 font-mono text-[11px] text-red-400">
            path.normalize(req) ➔ BLOCKED
          </div>
        </GlowCard>
      </div>
    </section>
  );
}
