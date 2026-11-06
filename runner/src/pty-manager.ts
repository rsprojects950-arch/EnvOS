import os from "node:os";
import path from "node:path";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";

export interface PtySession {
  roomCode: string;
  shell: string;
  cwd: string;
  ptyInstance: any; // node-pty IPty or ChildProcess
  isNativePty: boolean;
  scrollbackBuffer: string[];
  maxScrollbackChars: number;
  subscribers: Set<(data: string) => void>;
  reaperTimer: NodeJS.Timeout | null;
  createdAt: number;
  lastActiveAt: number;
}

export class PtyManager {
  private sessions = new Map<string, PtySession>();
  private nodePtyModule: any = null;
  private ptyChecked = false;

  constructor() {
    this.initPtyModule();
  }

  private async initPtyModule() {
    if (this.ptyChecked) return;
    this.ptyChecked = true;
    try {
      // Dynamic import to handle optional node-pty dependency
      const imported = await import("node-pty");
      this.nodePtyModule = imported.default || imported;
      console.log("[PTY Manager] Native node-pty initialized successfully.");
    } catch {
      console.warn(
        "[PTY Manager] Native node-pty not available. Falling back to built-in child_process shell supervisor."
      );
      this.nodePtyModule = null;
    }
  }

  public getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  private resolveDefaultShell(): { shell: string; args: string[] } {
    const isWindows = process.platform === "win32";
    if (isWindows) {
      return {
        shell: process.env.COMSPEC || "powershell.exe",
        args: [],
      };
    }
    const isMac = process.platform === "darwin";
    if (isMac) {
      return {
        shell: process.env.SHELL || "/bin/zsh",
        args: ["-l"],
      };
    }
    return {
      shell: process.env.SHELL || "/bin/bash",
      args: ["-i"],
    };
  }

  public async getOrCreateSession(roomCode: string, cwd: string): Promise<PtySession> {
    await this.initPtyModule();

    const normalizedRoom = roomCode.toUpperCase();
    if (this.sessions.has(normalizedRoom)) {
      const existing = this.sessions.get(normalizedRoom)!;
      if (existing.reaperTimer) {
        clearTimeout(existing.reaperTimer);
        existing.reaperTimer = null;
        console.log(`[PTY Manager] Re-attached to room ${normalizedRoom}; 15-min grace reaper cancelled.`);
      }
      return existing;
    }

    const { shell, args } = this.resolveDefaultShell();
    const env: Record<string, string> = {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      ENVOS_RUNNER_NODE: "Laptop 2",
      ENVOS_ROOM_CODE: normalizedRoom,
    } as Record<string, string>;

    let ptyInstance: any = null;
    let isNative = false;

    if (this.nodePtyModule) {
      try {
        ptyInstance = this.nodePtyModule.spawn(shell, args, {
          name: "xterm-color",
          cols: 100,
          rows: 30,
          cwd,
          env,
        });
        isNative = true;
      } catch (err) {
        console.warn("[PTY Manager] Failed to spawn with node-pty, falling back to spawn:", err);
      }
    }

    if (!ptyInstance) {
      // ChildProcess fallback
      const child = spawn(shell, args, {
        cwd,
        env,
        shell: true,
      });
      ptyInstance = child;
      isNative = false;
    }

    const session: PtySession = {
      roomCode: normalizedRoom,
      shell,
      cwd,
      ptyInstance,
      isNativePty: isNative,
      scrollbackBuffer: [],
      maxScrollbackChars: 64 * 1024, // 64 KB rolling buffer
      subscribers: new Set(),
      reaperTimer: null,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    const handleOutput = (chunk: string | Buffer) => {
      const str = typeof chunk === "string" ? chunk : chunk.toString("utf-8");
      session.lastActiveAt = Date.now();

      // Buffer management
      session.scrollbackBuffer.push(str);
      let totalLen = session.scrollbackBuffer.reduce((acc, s) => acc + s.length, 0);
      while (totalLen > session.maxScrollbackChars && session.scrollbackBuffer.length > 1) {
        const removed = session.scrollbackBuffer.shift();
        totalLen -= removed ? removed.length : 0;
      }

      // Broadcast to all connected clients in this room
      for (const listener of session.subscribers) {
        try {
          listener(str);
        } catch {
          // ignore broken pipe
        }
      }
    };

    if (isNative) {
      ptyInstance.onData(handleOutput);
      ptyInstance.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
        handleOutput(`\r\n[Process terminated with exit code ${exitCode}]\r\n`);
        this.sessions.delete(normalizedRoom);
      });
    } else {
      const child = ptyInstance as ChildProcessWithoutNullStreams;
      child.stdout.on("data", handleOutput);
      child.stderr.on("data", handleOutput);
      child.on("close", (code) => {
        handleOutput(`\r\n[Process exited with code ${code}]\r\n`);
        this.sessions.delete(normalizedRoom);
      });
    }

    this.sessions.set(normalizedRoom, session);
    console.log(`[PTY Manager] Spawned terminal shell for room ${normalizedRoom} (Native: ${isNative}) at ${cwd}`);
    return session;
  }

  public subscribe(roomCode: string, listener: (data: string) => void): () => void {
    const session = this.sessions.get(roomCode.toUpperCase());
    if (!session) return () => {};

    session.subscribers.add(listener);

    // Replay rolling scrollback history immediately so client has context
    const fullHistory = session.scrollbackBuffer.join("");
    if (fullHistory.length > 0) {
      listener(fullHistory);
    }

    return () => {
      session.subscribers.delete(listener);

      // If zero clients connected, initiate 15-minute grace reaper
      if (session.subscribers.size === 0 && !session.reaperTimer) {
        console.log(`[PTY Manager] Zero clients connected to room ${roomCode}. Starting 15-min grace reaper...`);
        session.reaperTimer = setTimeout(() => {
          this.terminateSession(roomCode);
        }, 15 * 60 * 1000); // 15 minutes
      }
    };
  }

  public writeInput(roomCode: string, data: string): void {
    const session = this.sessions.get(roomCode.toUpperCase());
    if (!session) return;

    session.lastActiveAt = Date.now();

    if (session.isNativePty) {
      session.ptyInstance.write(data);
    } else {
      const child = session.ptyInstance as ChildProcessWithoutNullStreams;
      if (child.stdin && child.stdin.writable) {
        child.stdin.write(data);
      }
    }
  }

  public resize(roomCode: string, cols: number, rows: number): void {
    const session = this.sessions.get(roomCode.toUpperCase());
    if (!session || !session.isNativePty) return;

    try {
      session.ptyInstance.resize(Math.max(10, cols), Math.max(5, rows));
    } catch {
      // ignore resize error
    }
  }

  public terminateSession(roomCode: string): void {
    const normalizedRoom = roomCode.toUpperCase();
    const session = this.sessions.get(normalizedRoom);
    if (!session) return;

    if (session.reaperTimer) {
      clearTimeout(session.reaperTimer);
    }

    try {
      if (session.isNativePty) {
        session.ptyInstance.kill();
      } else {
        session.ptyInstance.kill("SIGTERM");
      }
    } catch {
      // ignore
    }

    this.sessions.delete(normalizedRoom);
    console.log(`[PTY Manager] Session ${normalizedRoom} terminated.`);
  }
}

