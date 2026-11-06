export type CollaboratorRole =
  | "host"
  | "editor_full"
  | "editor_code"
  | "editor_scoped"
  | "viewer"
  // Legacy aliases for backward compatibility
  | "copilot"
  | "reviewer"
  | "auditor"
  | "spectator"
  | "qa"
  | "presenter"
  | "ai";

export type CollaboratorStatus = "ready" | "pending" | "admitted" | "declined";

export interface RoleCapability {
  canEditCode: boolean;
  canExecuteTerminal: boolean;
  canManageFiles: boolean;
  canKillProcesses: boolean;
  canManageRoles: boolean;
  canBroadcastAudio?: boolean;
}

export interface RoleMetadata {
  id: CollaboratorRole;
  label: string;
  badgeLabel: string;
  accessLevel: string;
  capabilities: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  caps: RoleCapability;
}

export const ROLE_DEFINITIONS: Record<CollaboratorRole, RoleMetadata> = {
  host: {
    id: "host",
    label: "Host",
    badgeLabel: "Host",
    accessLevel: "Authority: Full Root Administration",
    capabilities:
      "Created the room; controls lifecycle, boots the session from the lobby, and can close/kill it. Assigns or changes roles (Host, Editor, Viewer) and admits/kicks participants. Has unrestricted read, write, and execute permissions across Monaco Editor and the POSIX terminal. Can purge the sandbox from Laptop 2's physical disk or trigger .zip exports.",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/30",
    dotColor: "bg-amber-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: true,
      canManageFiles: true,
      canKillProcesses: true,
      canManageRoles: true,
      canBroadcastAudio: true,
    },
  },
  editor_full: {
    id: "editor_full",
    label: "Editor A",
    badgeLabel: "Editor A",
    accessLevel: "Tier A — Full Stack Editor (Code + Shell Execution)",
    capabilities:
      "Can edit, create, and delete all project files in Monaco Editor. Has interactive terminal access (stdin) to run bash commands, install packages (npm, pip), and execute scripts on Laptop 2.",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-500/30",
    dotColor: "bg-cyan-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: true,
      canManageFiles: true,
      canKillProcesses: true,
      canManageRoles: false,
      canBroadcastAudio: true,
    },
  },
  editor_code: {
    id: "editor_code",
    label: "Editor B",
    badgeLabel: "Editor B",
    accessLevel: "Tier B — Source Code Only (No Terminal Access)",
    capabilities:
      "Can edit, create, and save code files in Monaco Editor. The cloud terminal is completely locked or read-only (keystrokes to the shell are discarded at the server socket to prevent command execution).",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-500/30",
    dotColor: "bg-emerald-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: false,
      canManageFiles: true,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: true,
    },
  },
  editor_scoped: {
    id: "editor_scoped",
    label: "Editor C",
    badgeLabel: "Editor C",
    accessLevel: "Tier C — Scoped File Editor (Directory / File-Restricted)",
    capabilities:
      "Write access is restricted to a specific subfolder (e.g., only ./src/ or ./frontend/, while config files like package.json, .env, or backend scripts remain read-only). No terminal execution privileges.",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-500/30",
    dotColor: "bg-purple-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: false,
      canManageFiles: false,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: false,
    },
  },
  viewer: {
    id: "viewer",
    label: "Viewer",
    badgeLabel: "Viewer",
    accessLevel: "Authority: Read-Only Stream",
    capabilities:
      "Can observe files being edited in real-time in Monaco Editor. Can watch terminal output and build logs live via the ANSI stream. Strict Boundary: All write events (saving files, modifying code) and all terminal keystrokes are blocked before reaching Laptop 2. Cannot download .zip archives or alter room state.",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
    badgeBorder: "border-blue-500/30",
    dotColor: "bg-blue-400",
    caps: {
      canEditCode: false,
      canExecuteTerminal: false,
      canManageFiles: false,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: false,
    },
  },

  // Backward-compatible aliases
  copilot: {
    id: "copilot",
    label: "Editor A",
    badgeLabel: "Editor A",
    accessLevel: "Tier A — Full Stack Editor (Code + Shell Execution)",
    capabilities:
      "Can edit, create, and delete all project files in Monaco Editor. Has interactive terminal access (stdin) to run bash commands, install packages (npm, pip), and execute scripts on Laptop 2.",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-500/30",
    dotColor: "bg-cyan-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: true,
      canManageFiles: true,
      canKillProcesses: true,
      canManageRoles: false,
      canBroadcastAudio: true,
    },
  },
  reviewer: {
    id: "reviewer",
    label: "Editor B",
    badgeLabel: "Editor B",
    accessLevel: "Tier B — Source Code Only (No Terminal Access)",
    capabilities:
      "Can edit, create, and save code files in Monaco Editor. The cloud terminal is completely locked or read-only (keystrokes to the shell are discarded at the server socket to prevent command execution).",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-500/30",
    dotColor: "bg-emerald-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: false,
      canManageFiles: true,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: true,
    },
  },
  auditor: {
    id: "auditor",
    label: "Editor B",
    badgeLabel: "Editor B",
    accessLevel: "Tier B — Source Code Only (No Terminal Access)",
    capabilities:
      "Can edit, create, and save code files in Monaco Editor. The cloud terminal is completely locked or read-only.",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-500/30",
    dotColor: "bg-emerald-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: false,
      canManageFiles: true,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: true,
    },
  },
  spectator: {
    id: "spectator",
    label: "Viewer",
    badgeLabel: "Viewer",
    accessLevel: "Authority: Read-Only Stream",
    capabilities:
      "Can observe files being edited in real-time in Monaco Editor. Can watch terminal output and build logs live via the ANSI stream. Strict Boundary: All write events and all terminal keystrokes are blocked before reaching Laptop 2.",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
    badgeBorder: "border-blue-500/30",
    dotColor: "bg-blue-400",
    caps: {
      canEditCode: false,
      canExecuteTerminal: false,
      canManageFiles: false,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: false,
    },
  },
  qa: {
    id: "qa",
    label: "Editor C",
    badgeLabel: "Editor C",
    accessLevel: "Tier C — Scoped File Editor (Directory / File-Restricted)",
    capabilities:
      "Write access is restricted to a specific subfolder (e.g., only ./src/ or ./frontend/).",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-500/30",
    dotColor: "bg-purple-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: false,
      canManageFiles: false,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: false,
    },
  },
  presenter: {
    id: "presenter",
    label: "Viewer",
    badgeLabel: "Viewer",
    accessLevel: "Authority: Read-Only Stream",
    capabilities: "Can observe files and terminal logs live.",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
    badgeBorder: "border-blue-500/30",
    dotColor: "bg-blue-400",
    caps: {
      canEditCode: false,
      canExecuteTerminal: false,
      canManageFiles: false,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: false,
    },
  },
  ai: {
    id: "ai",
    label: "Editor A",
    badgeLabel: "Editor A",
    accessLevel: "Tier A — Full Stack Editor (Code + Shell Execution)",
    capabilities: "Autonomous editor agent with code and terminal privileges.",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-500/30",
    dotColor: "bg-cyan-400",
    caps: {
      canEditCode: true,
      canExecuteTerminal: true,
      canManageFiles: true,
      canKillProcesses: false,
      canManageRoles: false,
      canBroadcastAudio: false,
    },
  },
};

export const ASSIGNABLE_ROLES: RoleMetadata[] = [
  ROLE_DEFINITIONS.editor_full,
  ROLE_DEFINITIONS.editor_code,
  ROLE_DEFINITIONS.editor_scoped,
  ROLE_DEFINITIONS.viewer,
];

export interface Collaborator {
  id: string;
  name: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  isHost?: boolean;
  avatarColor: string;
  ping: number;
  joinedAt: string;
  runnerClient?: string;
}

export interface RoomPolicies {
  allowPty: boolean;
  autoAdmit: boolean;
  maskSecrets: boolean;
  ansiCompression: boolean;
}

export interface RoomState {
  roomCode: string;
  workspaceName: string;
  runner: string;
  targetPath: string;
  status: "lobby" | "active" | "discarded";
  hostName: string;
  policies: RoomPolicies;
  collaborators: Collaborator[];
  launchedAt?: number;
}
