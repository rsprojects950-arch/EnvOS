"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CollaboratorRole,
  ROLE_DEFINITIONS,
  ASSIGNABLE_ROLES,
  RoleMetadata,
} from "@/types/workspace";
import { RoleBadge } from "./role-badge";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleDropdownProps {
  currentRole: CollaboratorRole;
  onChangeRole: (newRole: CollaboratorRole) => void;
  disabled?: boolean;
  isLight?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RoleDropdown({
  currentRole,
  onChangeRole,
  disabled = false,
  isLight: propIsLight,
  onOpenChange,
}: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [internalIsLight, setInternalIsLight] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("envos_dashboard_theme");
      setInternalIsLight(saved === "light");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isLight = propIsLight !== undefined ? propIsLight : internalIsLight;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  const rolesList = ASSIGNABLE_ROLES;
  const currentMeta = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.viewer;

  return (
    <div className={cn("relative inline-block text-left", isOpen ? "z-50" : "z-auto")} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-manrope font-semibold transition-all cursor-pointer group shadow-xs",
          isLight
            ? "bg-zinc-100 hover:bg-zinc-200/80 border-black/10 text-zinc-900"
            : "bg-white/[0.05] hover:bg-white/[0.09] border-white/10 text-zinc-100",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && (isLight ? "border-zinc-400 bg-zinc-200" : "border-white/30 bg-white/[0.12]")
        )}
      >
        <span>{currentMeta.label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-white",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border p-2 z-[60] shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150",
            isLight
              ? "bg-white border-black/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-zinc-900"
              : "bg-black border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white"
          )}
        >
          <div
            className={cn(
              "px-3 py-2 border-b mb-1",
              isLight ? "border-black/10 text-zinc-600" : "border-white/10 text-zinc-400"
            )}
          >
            <span className="text-[11px] font-manrope font-semibold uppercase tracking-wider">
              Select Access Level
            </span>
          </div>

          <div className="space-y-1">
            {rolesList.map((role) => {
              const isSelected =
                role.id === currentRole ||
                (currentRole === "copilot" && role.id === "editor_full") ||
                (currentRole === "reviewer" && role.id === "editor_code") ||
                (currentRole === "spectator" && role.id === "viewer");
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    onChangeRole(role.id);
                    setIsOpen(false);
                    onOpenChange?.(false);
                  }}
                  className={cn(
                    "w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between border cursor-pointer group",
                    isSelected
                      ? isLight
                        ? "bg-zinc-100 border-zinc-300 text-zinc-950 shadow-xs"
                        : "bg-white/10 border-white/20 text-white"
                      : isLight
                      ? "bg-transparent border-transparent hover:bg-zinc-100 hover:border-black/10 text-zinc-700"
                      : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10 text-zinc-300"
                  )}
                >
                  <span className={cn("text-xs font-semibold font-manrope", isLight ? "text-zinc-900" : "text-white")}>
                    {role.label}
                  </span>

                  {isSelected && (
                    <Check className={cn("w-3.5 h-3.5 shrink-0 ml-2", isLight ? "text-zinc-900" : "text-white")} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
