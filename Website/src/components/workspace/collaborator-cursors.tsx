"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Collaborator } from "@/types/workspace";
import { broadcastRoomEvent, subscribeToRoomEvents } from "@/lib/room-sync";

interface CursorData {
  memberId: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  lastActive: number;
}

const COLOR_PALETTE = [
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#14B8A6", // Teal
  "#F43F5E", // Rose
];

function getColorForUser(name: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash + index) % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
}

interface CollaboratorCursorsProps {
  roomCode: string;
  currentMember: Collaborator;
  collaborators: Collaborator[];
}

export function CollaboratorCursors({
  roomCode,
  currentMember,
  collaborators,
}: CollaboratorCursorsProps) {
  const [remoteCursors, setRemoteCursors] = useState<Record<string, CursorData>>({});
  const lastBroadcastRef = useRef<number>(0);

  // Filter out current user with stable memoized identity
  const otherPeers = useMemo(() => {
    return collaborators.filter(
      (c) =>
        c.id !== currentMember.id &&
        c.name.toLowerCase() !== currentMember.name.toLowerCase()
    );
  }, [collaborators, currentMember.id, currentMember.name]);

  const otherPeersRef = useRef(otherPeers);
  useEffect(() => {
    otherPeersRef.current = otherPeers;
  }, [otherPeers]);

  // Initialize initial ambient positions for other peers only when a peer is missing
  useEffect(() => {
    setRemoteCursors((prev) => {
      let hasNew = false;
      const next = { ...prev };
      const defaultPositions = [
        { x: 28, y: 35 },
        { x: 68, y: 45 },
        { x: 42, y: 62 },
        { x: 75, y: 28 },
      ];

      otherPeers.forEach((peer, i) => {
        if (!next[peer.id]) {
          hasNew = true;
          const pos = defaultPositions[i % defaultPositions.length];
          next[peer.id] = {
            memberId: peer.id,
            name: peer.name,
            x: pos.x,
            y: pos.y,
            color: getColorForUser(peer.name, i),
            lastActive: Date.now(),
          };
        }
      });
      return hasNew ? next : prev;
    });
  }, [otherPeers]);

  // Subscribe to real-time cursor events from other tabs/clients
  useEffect(() => {
    const unsubscribe = subscribeToRoomEvents(roomCode, (event) => {
      if (event.type === "CURSOR_MOVE") {
        if (event.payload.memberId !== currentMember.id) {
          setRemoteCursors((prev) => ({
            ...prev,
            [event.payload.memberId]: {
              memberId: event.payload.memberId,
              name: event.payload.name,
              x: event.payload.x,
              y: event.payload.y,
              color: event.payload.color,
              lastActive: Date.now(),
            },
          }));
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, currentMember.id]);

  // Natural ambient cursor drift for remote collaborators when not controlled by active input
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const peers = otherPeersRef.current;
      if (!peers.length) return;

      setRemoteCursors((prev) => {
        let changed = false;
        const next = { ...prev };

        peers.forEach((peer, idx) => {
          const cursor = next[peer.id];
          // If no update in 2.5s, create gentle organic wandering motion
          if (cursor && now - cursor.lastActive > 2500) {
            const time = now / 2400 + idx * 2.1;
            const basePos = [
              { cx: 30, cy: 38 },
              { cx: 65, cy: 42 },
              { cx: 45, cy: 60 },
              { cx: 72, cy: 26 },
            ][idx % 4];

            const dx = Math.sin(time * 0.9 + idx) * 8 + Math.cos(time * 1.7) * 4;
            const dy = Math.cos(time * 0.8 + idx) * 6 + Math.sin(time * 1.4) * 3;

            next[peer.id] = {
              ...cursor,
              x: Math.max(10, Math.min(90, basePos.cx + dx)),
              y: Math.max(12, Math.min(84, basePos.cy + dy)),
            };
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Broadcast local user's mouse position to peers (throttled to 40ms / 25fps)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastBroadcastRef.current < 40) return;
      lastBroadcastRef.current = now;

      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      broadcastRoomEvent(roomCode, {
        type: "CURSOR_MOVE",
        payload: {
          memberId: currentMember.id,
          name: currentMember.name,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          color: getColorForUser(currentMember.name, 0),
        },
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [roomCode, currentMember.id, currentMember.name]);

  const activeCursors = useMemo(() => {
    return otherPeers
      .map((peer) => remoteCursors[peer.id])
      .filter(Boolean) as CursorData[];
  }, [otherPeers, remoteCursors]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      <AnimatePresence>
        {activeCursors.map((cursor) => (
          <motion.div
            key={cursor.memberId}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 280,
              mass: 0.4,
            }}
            className="absolute -translate-x-1 -translate-y-1 flex flex-col items-start"
            style={{
              willChange: "transform, left, top",
            }}
          >
            {/* macOS Style Multiplayer Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            >
              <path
                d="M3 2L18.5 13.5L10.5 14L8.5 21L3 2Z"
                fill={cursor.color}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Collaborator Name Tag Badge */}
            <div
              className="mt-0.5 ml-3 px-2.5 py-0.5 rounded-full text-[11px] font-manrope font-medium text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md"
              style={{
                backgroundColor: cursor.color,
                boxShadow: `0 4px 14px ${cursor.color}40`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
              <span className="font-semibold tracking-wide drop-shadow-sm">
                {cursor.name}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
