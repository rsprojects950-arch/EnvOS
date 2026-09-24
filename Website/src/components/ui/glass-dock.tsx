"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import {
  Terminal,
  Code2,
  FolderTree,
  Users2,
  Cpu,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  title: string;
  icon: React.ElementType;
  active?: boolean;
}

const defaultItems: DockItem[] = [
  { id: "editor", title: "Code Studio", icon: Code2, active: true },
  { id: "terminal", title: "Cloud Shell", icon: Terminal, active: true },
  { id: "files", title: "File Tree", icon: FolderTree },
  { id: "multiplayer", title: "Room (6-Char)", icon: Users2 },
  { id: "compute", title: "Compute Runner", icon: Cpu },
  { id: "settings", title: "Preferences", icon: Settings },
];

function DockIcon({
  item,
  mouseX,
  onClick,
}: {
  item: DockItem;
  mouseX: any;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [42, 60, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="relative aspect-square flex items-center justify-center cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute -top-10 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-white/10 text-[11px] font-medium text-zinc-200 whitespace-nowrap shadow-xl pointer-events-none z-50 backdrop-blur-md"
        >
          {item.title}
        </motion.div>
      )}

      {/* Icon Capsule */}
      <div className="w-full h-full rounded-2xl flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 shadow-lg transition-colors">
        <Icon className="w-5 h-5 text-zinc-200" />
      </div>

      {/* Running Indicator Dot */}
      {item.active && (
        <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-blue-400" />
      )}
    </motion.div>
  );
}

export function GlassDock({
  onSelectApp,
  className,
}: {
  onSelectApp?: (appId: string) => void;
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "flex h-16 items-end gap-3 rounded-3xl border border-white/10 bg-black/40 px-4 pb-2.5 pt-2 backdrop-blur-2xl shadow-2xl",
        className
      )}
    >
      {defaultItems.map((item) => (
        <DockIcon
          key={item.id}
          item={item}
          mouseX={mouseX}
          onClick={() => onSelectApp?.(item.id)}
        />
      ))}
    </div>
  );
}
