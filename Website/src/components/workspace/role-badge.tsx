"use client";

import React from "react";
import { CollaboratorRole, ROLE_DEFINITIONS } from "@/types/workspace";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Code2,
  Terminal,
  Eye,
  UserCheck,
} from "lucide-react";

interface RoleBadgeProps {
  role: CollaboratorRole;
  showCapabilities?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  isLight?: boolean;
}

export function getRoleIcon(role: CollaboratorRole, className = "w-3 h-3") {
  switch (role) {
    case "host":
      return <ShieldCheck className={className} />;
    case "editor_full":
    case "copilot":
    case "ai":
      return <Terminal className={className} />;
    case "editor_code":
    case "reviewer":
    case "auditor":
      return <Code2 className={className} />;
    case "editor_scoped":
    case "qa":
      return <UserCheck className={className} />;
    case "viewer":
    case "spectator":
    case "presenter":
      return <Eye className={className} />;
    default:
      return <Eye className={className} />;
  }
}

export function RoleBadge({
  role,
  showCapabilities = false,
  size = "md",
  className,
  isLight,
}: RoleBadgeProps) {
  const meta = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.spectator;

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-xs",
  };

  return (
    <div className="inline-flex flex-col gap-0.5">
      <span
        className={cn(
          "inline-flex items-center font-manrope font-medium rounded-full border transition-all",
          isLight === true
            ? "bg-zinc-100 text-zinc-800 border-black/10"
            : isLight === false
            ? "bg-white/[0.06] text-zinc-200 border-white/10"
            : "bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border-black/10 dark:border-white/10",
          sizeStyles[size],
          className
        )}
      >
        <span>{meta.badgeLabel}</span>
      </span>

      {showCapabilities && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-manrope">
          {meta.accessLevel}
        </span>
      )}
    </div>
  );
}
