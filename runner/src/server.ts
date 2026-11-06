import http from "node:http";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { URL } from "node:url";
import { FsManager } from "./fs-manager.js";
import { PtyManager } from "./pty-manager.js";
import { sampleTelemetry, RunnerTelemetry } from "./telemetry.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/stream" });

// Shared instances
const fsManager = new FsManager();
const ptyManager = new PtyManager();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "50mb" }));

// ----------------------------------------------------
// HTTP Endpoints
// ----------------------------------------------------

/**
 * Health check & instant ping
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    node: "laptop-2",
    platform: process.platform,
    arch: process.arch,
    uptime: Math.floor(process.uptime()),
    timestamp: Date.now(),
  });
});

/**
 * Comprehensive real-time hardware telemetry
 */
app.get("/api/telemetry", async (_req: Request, res: Response) => {
  try {
    const stats: RunnerTelemetry = await sampleTelemetry(
      fsManager.getBaseDir(),
      ptyManager.getActiveSessionsCount()
    );
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to collect telemetry", details: err?.message });
  }
});

/**
 * Initialize / prepare workspace directory on physical disk
 */
app.post("/api/workspaces/init", async (req: Request, res: Response) => {
  try {
    const { roomCode, initialFiles } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: "roomCode is required" });
    }

    const wsDir = await fsManager.initWorkspace(roomCode, initialFiles);
    res.json({
      success: true,
      roomCode: roomCode.toUpperCase(),
      directory: wsDir,
      node: "laptop-2",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to init workspace", details: err?.message });
  }
});

/**
 * Get all files for a workspace
 */
app.get("/api/workspaces/:roomCode/files", async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const files = await fsManager.listFiles(roomCode);
    res.json({ roomCode: roomCode.toUpperCase(), files });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read workspace files", details: err?.message });
  }
});

/**
 * Batch write or single write files to workspace
 */
app.post("/api/workspaces/:roomCode/files", async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const { files, path: filePath, content } = req.body;

    if (files && typeof files === "object") {
      for (const [p, c] of Object.entries(files)) {
        await fsManager.writeFile(roomCode, p, String(c));
      }
      return res.json({ success: true, count: Object.keys(files).length });
    }

    if (filePath && content !== undefined) {
      await fsManager.writeFile(roomCode, filePath, String(content));
      return res.json({ success: true, path: filePath });
    }

    return res.status(400).json({ error: "Must provide 'files' object or 'path' and 'content'" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to write files", details: err?.message });
  }
});

/**
 * Delete a file in the workspace
 */
app.delete("/api/workspaces/:roomCode/files", async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const filePath = (req.query.path as string) || req.body?.path;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const deleted = await fsManager.deleteFile(roomCode, filePath);
    res.json({ success: deleted, path: filePath });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete file", details: err?.message });
  }
});

/**
 * Purge entire workspace directory from Laptop 2's disk
 */
app.post("/api/workspaces/:roomCode/purge", async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    ptyManager.terminateSession(roomCode);
    const purged = await fsManager.purgeWorkspace(roomCode);
    res.json({ success: purged, roomCode: roomCode.toUpperCase(), node: "laptop-2" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to purge workspace", details: err?.message });
  }
});

// ----------------------------------------------------
// WebSocket Server (Duplex Shell & Collaboration Stream)
// ----------------------------------------------------

interface ClientContext {
  ws: WebSocket;
  roomCode: string;
  clientId: string;
  isAlive: boolean;
}

const connectedClients = new Set<ClientContext>();

wss.on("connection", async (ws: WebSocket, req) => {
  const parsedUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const roomCode = (parsedUrl.searchParams.get("room") || "DEV-01").toUpperCase();
  const clientId = parsedUrl.searchParams.get("client") || `client-${Date.now()}`;

  const clientCtx: ClientContext = {
    ws,
    roomCode,
    clientId,
    isAlive: true,
  };
  connectedClients.add(clientCtx);

  console.log(`[WebSocket] Client connected: ${clientId} to room ${roomCode}`);

  try {
    // 1. Ensure physical workspace folder is ready
    const wsDir = await fsManager.initWorkspace(roomCode);

    // 2. Attach or create PTY terminal session
    await ptyManager.getOrCreateSession(roomCode, wsDir);

    // 3. Subscribe to PTY terminal stdout
    const unsubscribePty = ptyManager.subscribe(roomCode, (ansiData) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stdout", data: ansiData }));
      }
    });

    // 4. Start file watcher for real-time file updates
    fsManager.watchWorkspace(roomCode, async (event, relPath) => {
      if (ws.readyState === WebSocket.OPEN) {
        let content: string | undefined = undefined;
        if (event !== "unlink") {
          try {
            content = await fsManager.readFile(roomCode, relPath);
          } catch {
            // skip
          }
        }
        ws.send(
          JSON.stringify({
            type: "fs:change",
            event,
            path: relPath,
            content,
          })
        );
      }
    });

    // 5. Send welcome packet
    ws.send(
      JSON.stringify({
        type: "welcome",
        node: "laptop-2",
        roomCode,
        platform: process.platform,
        timestamp: Date.now(),
      })
    );

    // Handle incoming client messages
    ws.on("message", async (rawMessage) => {
      try {
        const msg = JSON.parse(rawMessage.toString());

        if (msg.type === "stdin" && typeof msg.data === "string") {
          // Terminal keystrokes
          ptyManager.writeInput(roomCode, msg.data);
        } else if (msg.type === "resize") {
          ptyManager.resize(roomCode, msg.cols || 100, msg.rows || 30);
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", clientTimestamp: msg.timestamp, serverTimestamp: Date.now() }));
        } else if (msg.type === "fs:write" && msg.path && msg.content !== undefined) {
          await fsManager.writeFile(roomCode, msg.path, msg.content);
          // Broadcast to other peers in room
          for (const peer of connectedClients) {
            if (peer.roomCode === roomCode && peer.ws !== ws && peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(
                JSON.stringify({
                  type: "fs:change",
                  event: "change",
                  path: msg.path,
                  content: msg.content,
                  sourceClient: clientId,
                })
              );
            }
          }
        } else if (msg.type === "fs:delete" && msg.path) {
          await fsManager.deleteFile(roomCode, msg.path);
          for (const peer of connectedClients) {
            if (peer.roomCode === roomCode && peer.ws !== ws && peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(
                JSON.stringify({
                  type: "fs:change",
                  event: "unlink",
                  path: msg.path,
                  sourceClient: clientId,
                })
              );
            }
          }
        }
      } catch (e) {
        console.warn("[WebSocket] Error processing message:", e);
      }
    });

    ws.on("close", () => {
      connectedClients.delete(clientCtx);
      unsubscribePty();
      console.log(`[WebSocket] Client disconnected: ${clientId} from room ${roomCode}`);
    });

    ws.on("error", (err) => {
      console.error(`[WebSocket] Error for client ${clientId}:`, err);
    });
  } catch (err) {
    console.error("[WebSocket] Session setup error:", err);
    ws.close();
  }
});

// Periodic Telemetry Broadcast (every 2 seconds to all connected clients)
setInterval(async () => {
  if (connectedClients.size === 0) return;

  try {
    const telemetry = await sampleTelemetry(
      fsManager.getBaseDir(),
      ptyManager.getActiveSessionsCount()
    );

    const payload = JSON.stringify({ type: "telemetry", data: telemetry });

    for (const client of connectedClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  } catch {
    // ignore
  }
}, 2000);

// Heartbeat ping/pong for WebSocket liveness
setInterval(() => {
  for (const client of connectedClients) {
    if (!client.isAlive) {
      client.ws.terminate();
      connectedClients.delete(client);
    } else {
      client.isAlive = false;
      client.ws.ping();
    }
  }
}, 30000);

server.listen(PORT, HOST, () => {
  console.log("==================================================================");
  console.log(`🚀 EnvOS Dedicated Compute & Storage Runner Node (Laptop 2)`);
  console.log(`📡 Listening on: http://${HOST}:${PORT}`);
  console.log(`⚡ WebSocket Stream: ws://${HOST}:${PORT}/stream`);
  console.log(`📂 Physical Workspaces: ${fsManager.getBaseDir()}`);
  console.log("==================================================================");
});

