"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Code2, Users, ShieldCheck, Play, Copy, Check } from "lucide-react";
import { GlassDock } from "../ui/glass-dock";
import { BorderBeam } from "../ui/border-beam";

export function DesktopCanvasHero() {
  const [activeTab, setActiveTab] = useState<"terminal" | "editor">("terminal");
  const [copied, setCopied] = useState(false);

  const handleCopyRoom = () => {
    navigator.clipboard.writeText("ENV789");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-3xl border border-white/10 bg-[#07090e]/80 shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)] overflow-hidden backdrop-blur-2xl">
      <BorderBeam size={280} duration={12} colorFrom="#6366f1" colorTo="#38bdf8" />

      {/* Desktop OS Top Menu Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-400 select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-100 flex items-center gap-1.5 font-orbitron tracking-wide">
            <span className="text-blue-400">🪐</span> EnvOS
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline hover:text-zinc-200 cursor-pointer">Workspace</span>
          <span className="hidden sm:inline hover:text-zinc-200 cursor-pointer">Terminal</span>
          <span className="hidden sm:inline hover:text-zinc-200 cursor-pointer">Collaborators</span>
        </div>

        {/* Room Code Indicator & Live Presence */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            onClick={handleCopyRoom}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[11px] cursor-pointer hover:bg-blue-500/20 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ROOM: ENV789</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-300" />}
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-zinc-300">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>3 Online</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">HOST PRIVILEGES</span>
          </div>
        </div>
      </div>

      {/* OS Canvas Content Area */}
      <div className="p-4 sm:p-6 min-h-[460px] flex flex-col justify-between relative bg-gradient-to-b from-transparent via-blue-950/[0.05] to-purple-950/[0.08]">
        {/* Floating Windows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Window 1: Code Studio (Monaco Editor Mock) */}
          <motion.div
            layout
            onClick={() => setActiveTab("editor")}
            className={`lg:col-span-6 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
              activeTab === "editor"
                ? "border-blue-500/40 bg-zinc-950/90 shadow-2xl ring-1 ring-blue-500/20"
                : "border-white/10 bg-zinc-950/60 opacity-80 hover:opacity-100"
            }`}
          >
            {/* Window Titlebar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-1.5 ml-2 text-xs font-mono text-zinc-300">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>main.ts</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Monaco Editor v0.45</span>
            </div>

            {/* Code Studio Content */}
            <div className="p-4 font-mono text-xs leading-relaxed text-zinc-300 flex-1 overflow-x-auto bg-[#0a0d14]/70">
              <div className="flex">
                <div className="text-zinc-600 pr-4 select-none text-right font-mono text-[11px] leading-relaxed">
                  1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10
                </div>
                <div className="flex-1">
                  <p><span className="text-purple-400">import</span> &#123; spawnPty &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&quot;@envos/runner&quot;</span>;</p>
                  <p><span className="text-purple-400">import</span> &#123; createRoom &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&quot;@envos/core&quot;</span>;</p>
                  <p className="text-zinc-500">// Initialize distributed workspace for room ENV789</p>
                  <p><span className="text-blue-400">const</span> session = <span className="text-yellow-400">createRoom</span>(&#123;</p>
                  <p className="pl-4">code: <span className="text-emerald-300">&quot;ENV789&quot;</span>,</p>
                  <p className="pl-4">shell: <span className="text-emerald-300">&quot;/bin/bash&quot;</span>,</p>
                  <p className="pl-4">rbac: &#123; host: <span className="text-emerald-300">&quot;rohit&quot;</span>, allowKeystrokes: <span className="text-yellow-400">true</span> &#125;,</p>
                  <p>&#125;);</p>
                  <p><span className="text-purple-400">await</span> session.<span className="text-blue-400">connectRunner</span>();</p>
                  <p className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-4 bg-blue-400 animate-pulse inline-block" />
                    <span>console.log(&quot;EnvOS Engine active: 0ms lag&quot;);</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Window 2: Cloud Shell (xterm.js Mock) */}
          <motion.div
            layout
            onClick={() => setActiveTab("terminal")}
            className={`lg:col-span-6 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
              activeTab === "terminal"
                ? "border-emerald-500/40 bg-zinc-950/90 shadow-2xl ring-1 ring-emerald-500/20"
                : "border-white/10 bg-zinc-950/60 opacity-80 hover:opacity-100"
            }`}
          >
            {/* Terminal Titlebar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-1.5 ml-2 text-xs font-mono text-zinc-300">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>bash — node-pty session (Laptop 2 Runner)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">xterm.js Canvas • 80x24</span>
            </div>

            {/* Terminal Stream Content */}
            <div className="p-4 font-mono text-xs leading-relaxed text-zinc-300 flex-1 bg-[#050608]/90 overflow-x-auto">
              <p className="text-zinc-500">EnvOS Pseudo-Terminal Relay v1.0.4 [node-pty active]</p>
              <p className="text-zinc-500">Attached to sandboxed path: /workspaces/ws_ENV789/</p>
              <p className="mt-2 text-zinc-200">
                <span className="text-emerald-400 font-bold">host@runner-node</span>:
                <span className="text-blue-400">~/ws_ENV789</span>$ npm run build
              </p>
              <p className="text-zinc-400 mt-1">
                &gt; envos-core@0.1.0 build<br />
                &gt; tsc &amp;&amp; vite build
              </p>
              <p className="text-emerald-400">✓ 42 modules transformed into static bundle in 312ms</p>
              <p className="text-zinc-400">✓ Memory footprint: 18.4 MB | Active WebSockets: 3</p>
              <p className="text-zinc-200 mt-2">
                <span className="text-emerald-400 font-bold">host@runner-node</span>:
                <span className="text-blue-400">~/ws_ENV789</span>${" "}
                <span className="text-zinc-100 font-medium">echo &quot;Zero cloud bills!&quot;</span>
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 translate-y-0.5 animate-pulse" />
              </p>
            </div>
          </motion.div>
        </div>

        {/* macOS Floating Glass Dock at bottom of OS Canvas */}
        <div className="flex justify-center mt-6 z-20">
          <GlassDock
            onSelectApp={(app) => {
              if (app === "editor") setActiveTab("editor");
              if (app === "terminal") setActiveTab("terminal");
            }}
          />
        </div>
      </div>
    </div>
  );
}
