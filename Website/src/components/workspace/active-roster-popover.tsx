"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Collaborator,
  CollaboratorRole,
  RoomState,
} from "@/types/workspace";
import { RoleBadge } from "./role-badge";
import { RoleDropdown } from "./role-dropdown";
import { Users, Shield, X, Radio, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveRosterPopoverProps {
  roomState: RoomState;
  isHost: boolean;
  currentUserRole: CollaboratorRole;
  onUpdateRole?: (memberId: string, newRole: CollaboratorRole) => void;
  onReturnToLobby?: () => void;
}

export function ActiveRosterPopover({
  roomState,
  isHost,
  currentUserRole,
  onUpdateRole,
  onReturnToLobby,
}: ActiveRosterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-manrope transition-all cursor-pointer",
          isOpen
            ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
            : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-zinc-300 hover:text-white"
        )}
      >
        <Users className="w-3.5 h-3.5 text-cyan-400" />
        <span>{roomState.collaborators.length} Peers</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#080a12]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-white font-manrope uppercase tracking-wider">
                Live Collaborator Roster
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto divide-y divide-white/5 pr-1">
            {roomState.collaborators.map((c, idx) => {
              const isOwner = c.isHost || c.role === "host";
              return (
                <div
                  key={c.id || `roster-collab-${idx}`}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full bg-gradient-to-tr flex items-center justify-center font-bold text-[11px] shrink-0",
                        c.avatarColor || "from-blue-500 to-indigo-600",
                        isOwner ? "text-black" : "text-white"
                      )}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-white">
                        <span>{c.name}</span>
                        {isOwner && (
                          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-manrope">
                        {c.ping}ms ping
                      </div>
                    </div>
                  </div>

                  <div>
                    {isHost && !isOwner && onUpdateRole ? (
                      <RoleDropdown
                        currentRole={c.role}
                        onChangeRole={(newRole) => onUpdateRole(c.id, newRole)}
                      />
                    ) : (
                      <RoleBadge role={c.role} size="sm" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isHost && onReturnToLobby && (
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onReturnToLobby();
                }}
                className="text-[11px] font-manrope text-cyan-300 hover:text-cyan-200 cursor-pointer"
              >
                ← Return to Lobby / Waiting Room
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
