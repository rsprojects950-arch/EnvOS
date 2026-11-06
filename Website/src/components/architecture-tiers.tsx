"use client";

import * as React from "react";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { TextAnimation } from "@/components/ui/text-animation";
import {
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface PanelProps extends React.ComponentProps<"section"> {
  className?: string;
  children: React.ReactNode;
}

function Panel({ className, children, ...props }: PanelProps) {
  return (
    <section
      {...props}
      className={cn(
        "relative isolate overflow-hidden rounded-[24px] p-6 sm:p-8 text-left transform-gpu",
        "glass-liquid-bar",
        "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
      style={{ transform: "translateZ(0)", ...props.style }}
    >
      {/* Liquid Metal Border Layer */}
      <div className="absolute inset-0 z-10 rounded-[24px] overflow-hidden pointer-events-none liquid-metal-border-mask">
        <LiquidMetal
          colorBack="#888888"
          colorTint="#ffffff"
          speed={0.3}
          repetition={4}
          distortion={0.15}
          scale={1}
          className="absolute inset-0 z-0 rounded-[24px]"
        />
      </div>

      {/* Subtle radial lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Lightweight micro-texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col h-full pointer-events-auto">
        {children}
      </div>
    </section>
  );
}

export function ArchitectureTiers() {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 mt-12 sm:mt-14">
      {/* ─────────────────────────────────────────────────────────────
          TIER 1: Client Presentation Tier (Thin Client) - Full Width
          ───────────────────────────────────────────────────────────── */}
      <Panel className="lg:col-span-12">
        <div className="pb-5 border-b border-white/10">
          <h3 className="font-instrument italic text-white text-2xl sm:text-3xl md:text-4xl font-normal leading-tight">
            <TextAnimation delay={0.05}>
              Tier 1: Client Presentation Tier (Thin Client)
            </TextAnimation>
          </h3>
        </div>

        {/* What it does */}
        <div className="pt-6 flex flex-col gap-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">What it does</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.1}>Desktop Canvas</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.2}>
                  Renders the macOS-inspired desktop canvas, floating dock, and draggable window manager locally.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.2}>Accelerated ANSI Grid</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.3}>
                  Streams ANSI escape codes directly into an accelerated canvas grid.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.3}>UI Permission Locks</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.4}>
                  Enforces client-side UI permission locks for Viewers.
                </TextAnimation>
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ─────────────────────────────────────────────────────────────
          TIER 2: Cloud Control Plane (Managed Orchestration) - Full Width
          ───────────────────────────────────────────────────────────── */}
      <Panel className="lg:col-span-12">
        <div className="pb-5 border-b border-white/10">
          <h3 className="font-instrument italic text-white text-2xl sm:text-3xl md:text-4xl font-normal leading-tight">
            <TextAnimation delay={0.05}>
              Tier 2: Cloud Control Plane (Managed Orchestration)
            </TextAnimation>
          </h3>
        </div>

        {/* What it does */}
        <div className="pt-6 flex flex-col gap-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">What it does</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-violet-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.1}>User Auth & Sessions</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.2}>
                  Handles user registration, sessions, and secure JWT verification.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-violet-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.2}>Relational Metastore</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.3}>
                  Stores relational workspace metadata and 6-character room codes.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-violet-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.3}>Row-Level Security</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.4}>
                  Enforces Row-Level Security (RLS) policies for workspace ownership and member registries.
                </TextAnimation>
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ─────────────────────────────────────────────────────────────
          TIER 3: Compute Plane (Dedicated Runner Node) - Full Width
          ───────────────────────────────────────────────────────────── */}
      <Panel className="lg:col-span-12">
        <div className="pb-5 border-b border-white/10">
          <h3 className="font-instrument italic text-white text-2xl sm:text-3xl md:text-4xl font-normal leading-tight">
            <TextAnimation delay={0.05}>
              Tier 3: Compute Plane (Dedicated Runner Node)
            </TextAnimation>
          </h3>
        </div>

        {/* What it does */}
        <div className="pt-6 flex flex-col gap-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">What it does</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.1}>POSIX Pseudo-Terminals</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.2}>
                  Spawns real POSIX pseudo-terminals locked to isolated directories.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.2}>Circular Scrollback Ring</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.3}>
                  Houses the in-memory 64 KB circular scrollback buffer to instantly hydrate reconnecting clients.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.3}>Background Process Reaper</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.4}>
                  Runs a 15-minute background reaper to preserve active builds and processes during brief network drops.
                </TextAnimation>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span className="font-manrope font-semibold text-xs text-white">
                  <TextAnimation delay={0.4}>Packet Validation & RBAC</TextAnimation>
                </span>
              </div>
              <p className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed">
                <TextAnimation delay={0.5}>
                  Validates every incoming WebSocket packet against active member roles, dropping unauthorized stdin keystrokes.
                </TextAnimation>
              </p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default ArchitectureTiers;
