import {
  Collaborator,
  CollaboratorRole,
  RoomPolicies,
  RoomState,
} from "@/types/workspace";

const STORAGE_PREFIX = "envos_room_state_";

export type RoomSyncEvent =
  | { type: "STATE_UPDATE"; payload: RoomState }
  | { type: "WORKSPACE_START"; payload: { roomCode: string; launchedAt: number } }
  | { type: "WORKSPACE_DISCARD"; payload: { roomCode: string } }
  | { type: "MEMBER_JOIN"; payload: Collaborator }
  | { type: "PING"; payload: { memberId: string } }
  | { type: "CHAT_MESSAGE"; payload: any }
  | { type: "NOTES_UPDATE"; payload: { notes: string; sender?: string } }
  | {
      type: "CURSOR_MOVE";
      payload: {
        memberId: string;
        name: string;
        x: number; // percentage 0-100
        y: number; // percentage 0-100
        color: string;
      };
    };

export const DEFAULT_POLICIES: RoomPolicies = {
  allowPty: true,
  autoAdmit: false,
  maskSecrets: true,
  ansiCompression: true,
};

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: "user-host-krishna",
    name: "Krishna",
    role: "host",
    status: "ready",
    isHost: true,
    avatarColor: "from-amber-400 to-yellow-600",
    ping: 3.2,
    joinedAt: "Host",
    runnerClient: "Laptop 1 (Master)",
  },
  {
    id: "user-rahul-patel",
    name: "Rahul Patel",
    role: "editor_full",
    status: "admitted",
    avatarColor: "from-cyan-400 to-blue-600",
    ping: 4.8,
    joinedAt: "2m ago",
    runnerClient: "MacBook Pro M2",
  },
  {
    id: "user-sneha-roy",
    name: "Sneha Roy",
    role: "editor_code",
    status: "admitted",
    avatarColor: "from-emerald-400 to-teal-600",
    ping: 5.1,
    joinedAt: "1m ago",
    runnerClient: "Ubuntu 24.04 DevBox",
  },
  {
    id: "user-alex-vance",
    name: "Alex Vance",
    role: "viewer",
    status: "pending",
    avatarColor: "from-purple-400 to-indigo-600",
    ping: 8.4,
    joinedAt: "Just now",
    runnerClient: "Chromebook Pixel",
  },
];

export function getInitialRoomState(
  roomCode: string,
  workspaceName = "dev-runtime"
): RoomState {
  return {
    roomCode: roomCode.toUpperCase(),
    workspaceName,
    runner: "Laptop 2 Ready",
    targetPath: `./workspaces/ws_${roomCode.toUpperCase()}`,
    status: "lobby",
    hostName: "Krishna",
    policies: { ...DEFAULT_POLICIES },
    collaborators: [...INITIAL_COLLABORATORS],
  };
}

export function loadRoomState(roomCode: string): RoomState {
  if (typeof window === "undefined") {
    return getInitialRoomState(roomCode);
  }

  const key = `${STORAGE_PREFIX}${roomCode.toUpperCase()}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as RoomState;
    } catch {
      // Fallback
    }
  }

  const initialState = getInitialRoomState(roomCode);
  localStorage.setItem(key, JSON.stringify(initialState));
  return initialState;
}

export function persistRoomState(state: RoomState): void {
  if (typeof window === "undefined") return;

  const key = `${STORAGE_PREFIX}${state.roomCode.toUpperCase()}`;
  localStorage.setItem(key, JSON.stringify(state));

  // Broadcast to other tabs
  try {
    const channel = new BroadcastChannel(`envos_channel_${state.roomCode.toUpperCase()}`);
    channel.postMessage({ type: "STATE_UPDATE", payload: state });
    channel.close();
  } catch {
    // BroadcastChannel unsupported or restricted
  }
}

export function broadcastRoomEvent(roomCode: string, event: RoomSyncEvent): void {
  if (typeof window === "undefined") return;

  try {
    const channel = new BroadcastChannel(`envos_channel_${roomCode.toUpperCase()}`);
    channel.postMessage(event);
    channel.close();
  } catch {
    // broadcast failed
  }
}

export function subscribeToRoomEvents(
  roomCode: string,
  callback: (event: RoomSyncEvent) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const code = roomCode.toUpperCase();
  let channel: BroadcastChannel | null = null;

  try {
    channel = new BroadcastChannel(`envos_channel_${code}`);
    channel.onmessage = (ev) => {
      if (ev.data) {
        callback(ev.data as RoomSyncEvent);
      }
    };
  } catch {
    channel = null;
  }

  // Storage fallback for cross-tab notification
  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_PREFIX}${code}` && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback({ type: "STATE_UPDATE", payload: parsed });
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    if (channel) {
      channel.close();
    }
    window.removeEventListener("storage", handleStorage);
  };
}
