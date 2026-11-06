"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MacWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  children: React.ReactNode;
  defaultWidth?: string;
  defaultHeight?: string;
  zIndex?: number;
  onFocus?: () => void;
}

export function MacWindow({
  id,
  title,
  icon,
  isOpen,
  onClose,
  onMinimize,
  children,
  defaultWidth = "max-w-4xl w-[90vw]",
  defaultHeight = "h-[620px]",
  zIndex = 30,
  onFocus,
}: MacWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        width: isMaximized ? "98vw" : undefined,
        height: isMaximized ? "94vh" : undefined,
      }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      onMouseDown={onFocus}
      style={{ zIndex }}
      className={cn(
        "fixed inset-0 m-auto flex flex-col rounded-2xl backdrop-blur-2xl bg-black/75 border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.7)] overflow-hidden font-manrope",
        isMaximized ? "w-[98vw] h-[94vh]" : cn(defaultWidth, defaultHeight)
      )}
    >
      {/* macOS Window Titlebar */}
      <div className="h-10 px-4 bg-white/[0.04] border-b border-white/10 flex items-center justify-between select-none cursor-grab active:cursor-grabbing">
        {/* Traffic Lights */}
        <div className="flex items-center gap-2 group">
          <button
            type="button"
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <X className="w-2 h-2 text-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={onMinimize || onClose}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <Minus className="w-2 h-2 text-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <Maximize2 className="w-2 h-2 text-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Window Title */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          {icon}
          <span>{title}</span>
        </div>

        {/* Right Spacer */}
        <div className="w-14" />
      </div>

      {/* Window Body */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black/40">
        {children}
      </div>
    </motion.div>
  );
}
