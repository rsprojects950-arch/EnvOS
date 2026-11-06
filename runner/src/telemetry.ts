import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import si from "systeminformation";

export interface RunnerTelemetry {
  status: "online";
  node: string;
  hostname: string;
  platform: string;
  uptimeSeconds: number;
  cpuLoadPercent: number;
  cpuCores: number;
  cpuModel: string;
  ramUsedGb: number;
  ramTotalGb: number;
  ramPercent: number;
  storageUsedMb: number;
  activeWorkspacesCount: number;
  activePtySessionsCount: number;
  timestamp: number;
}

let cachedCpuLoad = 0;
let lastCpuCheck = 0;

async function getDirectorySizeInMb(dirPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let totalBytes = 0;

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        totalBytes += (await getDirectorySizeInMb(fullPath)) * 1024 * 1024;
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(fullPath);
          totalBytes += stats.size;
        } catch {
          // ignore stat errors on locked files
        }
      }
    }

    return Number((totalBytes / (1024 * 1024)).toFixed(2));
  } catch {
    return 0;
  }
}

export async function sampleTelemetry(
  workspacesDir: string,
  activePtySessionsCount = 0
): Promise<RunnerTelemetry> {
  const now = Date.now();

  // Rate-limit expensive CPU sampling to once per 1.5 seconds
  if (now - lastCpuCheck > 1500) {
    try {
      const cpu = await si.currentLoad();
      cachedCpuLoad = Number(cpu.currentLoad.toFixed(1));
    } catch {
      // Fallback to os load
      const cpus = os.cpus();
      cachedCpuLoad = Math.min(100, Math.round((os.loadavg()[0] || 0.1) * 10));
    }
    lastCpuCheck = now;
  }

  // Memory calculation
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const ramUsedGb = Number((usedMem / (1024 * 1024 * 1024)).toFixed(2));
  const ramTotalGb = Number((totalMem / (1024 * 1024 * 1024)).toFixed(2));
  const ramPercent = Math.round((usedMem / totalMem) * 100);

  // Storage calculation in workspaces dir
  const storageUsedMb = await getDirectorySizeInMb(workspacesDir);

  // Count active workspace directories
  let activeWorkspacesCount = 0;
  try {
    const items = await fs.readdir(workspacesDir, { withFileTypes: true });
    activeWorkspacesCount = items.filter((i) => i.isDirectory() && i.name.startsWith("ws_")).length;
  } catch {
    activeWorkspacesCount = 0;
  }

  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : "Standard Processor";

  return {
    status: "online",
    node: "laptop-2",
    hostname: os.hostname(),
    platform: process.platform,
    uptimeSeconds: Math.floor(os.uptime()),
    cpuLoadPercent: cachedCpuLoad,
    cpuCores: cpus.length,
    cpuModel,
    ramUsedGb,
    ramTotalGb,
    ramPercent,
    storageUsedMb,
    activeWorkspacesCount,
    activePtySessionsCount,
    timestamp: now,
  };
}

