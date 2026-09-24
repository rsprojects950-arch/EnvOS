"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  Code,
  TerminalWindow,
  GitBranch,
  ShieldCheck,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { TextAnimation } from "@/components/ui/text-animation";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  className?: string;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  delay: number;
  children: React.ReactNode;
}

function FeatureCard({
  className,
  icon,
  iconColor,
  title,
  delay,
  children,
}: FeatureCardProps) {
  const grainId = React.useId().replace(/:/g, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: delay * 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[24px] p-6 sm:p-7 text-left",
        "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Liquid Glass Background Layer */}
      <div className="absolute inset-0 z-0 rounded-[24px] pointer-events-none glass-liquid-bar backdrop-blur-xl backdrop-saturate-150" />

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
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Micro-grain texture overlay */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 size-full opacity-[0.05] mix-blend-soft-light"
      >
        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            seed="11"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.55" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col h-full pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.04]",
              iconColor
            )}
          >
            {icon}
          </div>
        </div>

        <h3 className="font-instrument italic text-white text-2xl sm:text-3xl font-normal leading-tight mb-3">
          <TextAnimation delay={delay}>
            {title}
          </TextAnimation>
        </h3>

        <div className="font-manrope text-xs sm:text-[13px] text-zinc-300/85 leading-relaxed flex-1">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="min-h-[70vh] pt-28 sm:pt-36 flex flex-col items-center text-center">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white font-manrope">
        Features
      </h2>
      <p className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-instrument italic text-white max-w-3xl sm:max-w-4xl mx-auto leading-snug drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
        <TextAnimation delay={0.05}>
          Everything Your Team Needs.
        </TextAnimation>
      </p>
      <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-white font-manrope font-normal max-w-2xl sm:max-w-3xl leading-relaxed">
        <TextAnimation delay={0.15}>
          Build, collaborate, test, and manage code from a browser-native operating system powered by private compute nodes.
        </TextAnimation>
      </p>

      {/* 7 Features Bento Grid */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 mt-12 sm:mt-14">
        {/* Feature 1: Real-Time Room Collaboration (Col 4) */}
        <FeatureCard
          className="md:col-span-6 lg:col-span-4"
          icon={<Users className="w-5 h-5" weight="duotone" />}
          iconColor="text-cyan-400"
          title="Real-Time Room Collaboration"
          delay={0.05}
        >
          <TextAnimation delay={0.15}>
            Hop into the same virtual desktop using a 6-digit room code (ENV789). Monitor active collaborators in the system dock and coordinate work inside a shared OS canvas without heavy video streaming or fighting over one mouse.
          </TextAnimation>
        </FeatureCard>

        {/* Feature 2: Synced Workspace Filesystem (Col 4) */}
        <FeatureCard
          className="md:col-span-6 lg:col-span-4"
          icon={<FolderOpen className="w-5 h-5" weight="duotone" />}
          iconColor="text-blue-400"
          title="Synced Workspace Filesystem"
          delay={0.2}
        >
          <TextAnimation delay={0.3}>
            All files live on the dedicated runner node inside isolated workspace sandboxes (./workspaces/ws_&lt;CODE&gt;/). Modifications trigger automatic directory updates via chokidar, so everyone's file tree stays synchronized in real time.
          </TextAnimation>
        </FeatureCard>

        {/* Feature 3: Monaco Code Studio (Col 4) */}
        <FeatureCard
          className="md:col-span-12 lg:col-span-4"
          icon={<Code className="w-5 h-5" weight="duotone" />}
          iconColor="text-violet-400"
          title="Monaco Code Studio"
          delay={0.35}
        >
          <TextAnimation delay={0.45}>
            The full VS Code editing core running natively in your browser tab. Features multi-tab file switching, syntax highlighting, and automatic save pipelines with zero client-side installation.
          </TextAnimation>
        </FeatureCard>

        {/* Feature 4: Hardware-Accelerated Cloud Shell (Col 6) */}
        <FeatureCard
          className="md:col-span-6"
          icon={<TerminalWindow className="w-5 h-5" weight="duotone" />}
          iconColor="text-emerald-400"
          title="Hardware-Accelerated Cloud Shell"
          delay={0.15}
        >
          <TextAnimation delay={0.25}>
            A real Linux /bin/bash terminal powered by node-pty and @xterm/xterm. Execute native compiler commands, install npm packages, and run scripts with sub-8ms ANSI text streaming instead of sluggish screen sharing.
          </TextAnimation>
        </FeatureCard>

        {/* Feature 5: Native Git & Toolchain (Col 6) */}
        <FeatureCard
          className="md:col-span-6"
          icon={<GitBranch className="w-5 h-5" weight="duotone" />}
          iconColor="text-amber-400"
          title="Native Git & Toolchain"
          delay={0.3}
        >
          <TextAnimation delay={0.4}>
            Because the terminal connects to a genuine POSIX environment, you have access to real developer toolchains out of the box—git clone, branch switching, commit management, and build tasks run directly on bare metal.
          </TextAnimation>
        </FeatureCard>

        {/* Feature 6: Server-Enforced RBAC (Col 6) */}
        <FeatureCard
          className="md:col-span-6"
          icon={<ShieldCheck className="w-5 h-5" weight="duotone" />}
          iconColor="text-purple-400"
          title="Server-Enforced RBAC"
          delay={0.15}
        >
          <div className="flex flex-col gap-2.5">
            <p>
              <TextAnimation delay={0.25}>
                Fine-grained access control enforced at the WebSocket layer:
              </TextAnimation>
            </p>
            <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">Host:</span>
                <TextAnimation delay={0.35}>
                  Full root management, role delegation, and room controls.
                </TextAnimation>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">Editor:</span>
                <TextAnimation delay={0.45}>
                  Code editing and interactive terminal execution.
                </TextAnimation>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">Viewer:</span>
                <TextAnimation delay={0.55}>
                  Read-only Monaco access with terminal input blocked before it reaches bash.
                </TextAnimation>
              </div>
            </div>
          </div>
        </FeatureCard>

        {/* Feature 7: Stateful Session Memory (Col 6) */}
        <FeatureCard
          className="md:col-span-6"
          icon={<ClockCounterClockwise className="w-5 h-5" weight="duotone" />}
          iconColor="text-rose-400"
          title="Stateful Session Memory"
          delay={0.3}
        >
          <TextAnimation delay={0.4}>
            Closing a browser tab will not kill your active workspace. Disconnected clients trigger a 15-minute background grace period, and rejoining instantly replays a 64 KB rolling ANSI buffer so your terminal state and long-running processes are preserved.
          </TextAnimation>
        </FeatureCard>
      </div>
    </section>
  );
}

export default FeaturesSection;
