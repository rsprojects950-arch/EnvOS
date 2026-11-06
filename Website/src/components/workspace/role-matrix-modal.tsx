"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export function RoleMatrixModal({ isOpen, onClose, isLight: isLightProp }: RoleMatrixModalProps) {
  const [internalIsLight, setInternalIsLight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with localStorage theme if isLightProp is not explicitly controlled
  useEffect(() => {
    try {
      const saved = localStorage.getItem("envos_dashboard_theme");
      if (saved === "light") setInternalIsLight(true);
      else if (saved === "dark") setInternalIsLight(false);
    } catch {
      // Ignore storage errors
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "envos_dashboard_theme") {
        setInternalIsLight(e.newValue === "light");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isOpen]);

  const isLight = isLightProp ?? internalIsLight;

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Robust mouse-wheel scrolling that bypasses any external smooth-scroll/Lenis interceptors
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      if (el.scrollHeight > el.clientHeight) {
        e.stopPropagation();
        const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaMode === 2 ? e.deltaY * 200 : e.deltaY;
        el.scrollTop += delta;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="role-matrix-modal-wrapper"
          data-lenis-prevent="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn(
              "fixed inset-0 backdrop-blur-md transition-opacity",
              isLight ? "bg-black/45" : "bg-black/75"
            )}
          />

          {/* Modal Container with Liquid Glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            data-lenis-prevent="true"
            className={cn(
              "relative isolate w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] flex flex-col rounded-3xl overflow-hidden z-10 font-manrope transition-colors duration-300 transform-gpu",
              isLight
                ? "bg-white/85 text-zinc-900 border border-black/10 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.14),inset_0_1.5px_2px_rgba(255,255,255,0.9)]"
                : "liquid-glass-tile text-white border border-white/10"
            )}
          >
            {/* Liquid Glass Border Layer (Refractive fluid rim) */}
            <div
              className={cn(
                "absolute inset-0 z-20 rounded-3xl overflow-hidden pointer-events-none liquid-glass-border-mask transition-opacity duration-300",
                isLight ? "opacity-35" : "opacity-90"
              )}
            >
              <div className="absolute inset-0 liquid-glass-border-gradient" />
            </div>

            {/* Specular Glass Bevel Highlight */}
            <div
              className={cn(
                "absolute inset-0 z-20 rounded-3xl pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent_75%)]",
                isLight ? "border border-white/70" : "border border-white/25"
              )}
            />

            {/* Subtle radial caustics lighting */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_65%)]" />

            {/* Header */}
            <div
              className={cn(
                "relative p-5 sm:p-6 border-b flex items-center justify-center shrink-0 transition-colors duration-300 z-30",
                isLight
                  ? "border-black/10 bg-white/70 backdrop-blur-md"
                  : "border-white/10 bg-black/40 backdrop-blur-md"
              )}
            >
              <h2
                className={cn(
                  "text-2xl sm:text-3xl font-normal font-instrument italic tracking-tight text-center px-10",
                  isLight ? "text-zinc-950" : "text-white"
                )}
              >
                Role Capabilities & Permissions
              </h2>

              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-2 rounded-xl border transition-colors cursor-pointer",
                  isLight
                    ? "border-black/10 hover:bg-black/5 text-zinc-600 hover:text-zinc-950"
                    : "border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white"
                )}
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content - Scrollable via mouse/touch without visible scrollbar */}
            <div
              ref={scrollRef}
              data-lenis-prevent="true"
              className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 pb-8 sm:pb-10 space-y-6 overscroll-contain relative z-20"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* 1. ROLE DEFINITIONS BREAKDOWN */}
              <div className="space-y-4">
                <h3
                  className={cn(
                    "text-xs uppercase tracking-wider font-semibold",
                    isLight ? "text-zinc-500" : "text-zinc-400"
                  )}
                >
                  Role Definitions & Scope Boundaries
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {/* 1. Host */}
                  <div
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      isLight
                        ? "bg-white/60 border-black/10 text-zinc-900 shadow-xs"
                        : "bg-white/[0.03] border-white/10 text-zinc-200 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                    )}
                  >
                    <div className="mb-2">
                      <h4
                        className={cn(
                          "font-bold text-sm sm:text-base",
                          isLight ? "text-zinc-950" : "text-white"
                        )}
                      >
                        1. Host
                      </h4>
                    </div>
                    <ul
                      className={cn(
                        "text-xs space-y-1.5 leading-relaxed pl-6 list-disc",
                        isLight ? "text-zinc-700" : "text-zinc-300"
                      )}
                    >
                      <li>
                        <strong>Room Lifecycle:</strong> Created the room; controls lifecycle, boots the session from the lobby, and can close/kill it.
                      </li>
                      <li>
                        <strong>User Delegation:</strong> Assigns or changes roles (Host, Editor, Viewer) and admits/kicks participants.
                      </li>
                      <li>
                        <strong>Full Privileges:</strong> Has unrestricted read, write, and execute permissions across Monaco Editor and the POSIX terminal.
                      </li>
                      <li>
                        <strong>Host Controls:</strong> Can purge the sandbox from Laptop 2's physical disk or trigger .zip exports.
                      </li>
                    </ul>
                  </div>

                  {/* 2. Editor */}
                  <div
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      isLight
                        ? "bg-white/60 border-black/10 text-zinc-900 shadow-xs"
                        : "bg-white/[0.03] border-white/10 text-zinc-200 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                    )}
                  >
                    <div className="mb-2">
                      <h4
                        className={cn(
                          "font-bold text-sm sm:text-base",
                          isLight ? "text-zinc-950" : "text-white"
                        )}
                      >
                        2. Editor (With Scoped Permission Tiers)
                      </h4>
                    </div>
                    <p
                      className={cn(
                        "text-xs leading-relaxed mb-3",
                        isLight ? "text-zinc-700" : "text-zinc-300"
                      )}
                    >
                      The Editor role grants write access to project files, with the Host assigning one of three scope levels to control how much the editor can touch:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Tier A */}
                      <div
                        className={cn(
                          "p-3 rounded-xl border flex flex-col justify-between",
                          isLight
                            ? "bg-white/80 border-black/10 shadow-xs"
                            : "bg-white/[0.025] border-white/10 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                        )}
                      >
                        <div>
                          <div
                            className={cn(
                              "text-xs font-bold mb-1",
                              isLight ? "text-zinc-950" : "text-white"
                            )}
                          >
                            <span>Editor A (Tier A)</span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-semibold",
                              isLight ? "text-zinc-500" : "text-zinc-400"
                            )}
                          >
                            Code + Shell Execution
                          </span>
                          <p
                            className={cn(
                              "text-[11px] leading-snug mt-2",
                              isLight ? "text-zinc-600" : "text-zinc-300"
                            )}
                          >
                            Can edit, create, and delete all project files in Monaco Editor. Interactive terminal access (stdin) to run bash commands, install packages (npm, pip), and execute scripts on Laptop 2.
                          </p>
                        </div>
                      </div>

                      {/* Tier B */}
                      <div
                        className={cn(
                          "p-3 rounded-xl border flex flex-col justify-between",
                          isLight
                            ? "bg-white/80 border-black/10 shadow-xs"
                            : "bg-white/[0.025] border-white/10 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                        )}
                      >
                        <div>
                          <div
                            className={cn(
                              "text-xs font-bold mb-1",
                              isLight ? "text-zinc-950" : "text-white"
                            )}
                          >
                            <span>Editor B (Tier B)</span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-semibold",
                              isLight ? "text-zinc-500" : "text-zinc-400"
                            )}
                          >
                            No Terminal Access
                          </span>
                          <p
                            className={cn(
                              "text-[11px] leading-snug mt-2",
                              isLight ? "text-zinc-600" : "text-zinc-300"
                            )}
                          >
                            Can edit, create, and save code files in Monaco Editor. The cloud terminal is completely locked or read-only (keystrokes to shell are discarded at server socket to prevent execution).
                          </p>
                        </div>
                      </div>

                      {/* Tier C */}
                      <div
                        className={cn(
                          "p-3 rounded-xl border flex flex-col justify-between",
                          isLight
                            ? "bg-white/80 border-black/10 shadow-xs"
                            : "bg-white/[0.025] border-white/10 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                        )}
                      >
                        <div>
                          <div
                            className={cn(
                              "text-xs font-bold mb-1",
                              isLight ? "text-zinc-950" : "text-white"
                            )}
                          >
                            <span>Editor C (Tier C)</span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-semibold",
                              isLight ? "text-zinc-500" : "text-zinc-400"
                            )}
                          >
                            Directory / File-Restricted
                          </span>
                          <p
                            className={cn(
                              "text-[11px] leading-snug mt-2",
                              isLight ? "text-zinc-600" : "text-zinc-300"
                            )}
                          >
                            Write access is restricted to a specific subfolder (e.g. only <code className="text-[10px] font-mono">./src/</code> or <code className="text-[10px] font-mono">./frontend/</code>, while config files like package.json, .env remain read-only). No terminal privileges.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Viewer */}
                  <div
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      isLight
                        ? "bg-white/60 border-black/10 text-zinc-900 shadow-xs"
                        : "bg-white/[0.03] border-white/10 text-zinc-200 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                    )}
                  >
                    <div className="mb-2">
                      <h4
                        className={cn(
                          "font-bold text-sm sm:text-base",
                          isLight ? "text-zinc-950" : "text-white"
                        )}
                      >
                        3. Viewer
                      </h4>
                    </div>
                    <ul
                      className={cn(
                        "text-xs space-y-1.5 leading-relaxed pl-6 list-disc",
                        isLight ? "text-zinc-700" : "text-zinc-300"
                      )}
                    >
                      <li>
                        <strong>Observation:</strong> Can observe files being edited in real-time in Monaco Editor.
                      </li>
                      <li>
                        <strong>Live ANSI Stream:</strong> Can watch terminal output and build logs live via the ANSI stream.
                      </li>
                      <li>
                        <strong>Strict Boundary:</strong> All write events (saving files, modifying code) and all terminal keystrokes are blocked before reaching Laptop 2. Cannot download .zip archives or alter room state.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. PERMISSIONS SUMMARY MATRIX TABLE */}
              <div>
                <h3
                  className={cn(
                    "text-xs uppercase tracking-wider font-semibold mb-3",
                    isLight ? "text-zinc-500" : "text-zinc-400"
                  )}
                >
                  Permissions Summary Matrix
                </h3>

                <div
                  className={cn(
                    "rounded-2xl border overflow-x-auto shadow-sm",
                    isLight
                      ? "bg-white/80 border-black/10"
                      : "bg-white/[0.025] border-white/10 backdrop-blur-sm"
                  )}
                >
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className={cn(
                          "border-b text-[11px] font-semibold uppercase tracking-wider",
                          isLight
                            ? "bg-black/[0.03] border-black/10 text-zinc-700"
                            : "bg-white/[0.04] border-white/10 text-zinc-300"
                        )}
                      >
                        <th className="py-3 px-4">Role & Sub-Category</th>
                        <th className="py-3 px-3 text-center">View Code & Logs</th>
                        <th className="py-3 px-3 text-center">Edit All Files</th>
                        <th className="py-3 px-3 text-center">Edit Restricted Files Only</th>
                        <th className="py-3 px-3 text-center">Interactive Terminal (stdin)</th>
                        <th className="py-3 px-3 text-center">Manage Members & Purge</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", isLight ? "divide-black/10" : "divide-white/10")}>
                      {/* Host */}
                      <tr className={isLight ? "hover:bg-black/[0.02]" : "hover:bg-white/[0.03]"}>
                        <td className={cn("py-3 px-4 font-bold", isLight ? "text-zinc-950" : "text-white")}>
                          Host
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                      </tr>

                      {/* Editor A */}
                      <tr className={isLight ? "hover:bg-black/[0.02]" : "hover:bg-white/[0.03]"}>
                        <td className={cn("py-3 px-4 font-semibold", isLight ? "text-zinc-800" : "text-zinc-200")}>
                          Editor A
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                      </tr>

                      {/* Editor B */}
                      <tr className={isLight ? "hover:bg-black/[0.02]" : "hover:bg-white/[0.03]"}>
                        <td className={cn("py-3 px-4 font-semibold", isLight ? "text-zinc-800" : "text-zinc-200")}>
                          Editor B
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                      </tr>

                      {/* Editor C */}
                      <tr className={isLight ? "hover:bg-black/[0.02]" : "hover:bg-white/[0.03]"}>
                        <td className={cn("py-3 px-4 font-semibold", isLight ? "text-zinc-800" : "text-zinc-200")}>
                          Editor C
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold">
                          <span className="inline-flex items-center gap-1.5 justify-center">
                            <span className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center font-bold",
                              isLight
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                            )}>
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                            <span className={cn("text-[10px] font-mono", isLight ? "text-zinc-600" : "text-zinc-400")}>(e.g. ./src)</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                      </tr>

                      {/* Viewer */}
                      <tr className={isLight ? "hover:bg-black/[0.02]" : "hover:bg-white/[0.03]"}>
                        <td className={cn("py-3 px-4 font-semibold", isLight ? "text-zinc-800" : "text-zinc-200")}>
                          Viewer
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/80"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          )}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full font-bold",
                            isLight
                              ? "bg-rose-100 text-rose-700 border border-rose-300/80"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}>
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
