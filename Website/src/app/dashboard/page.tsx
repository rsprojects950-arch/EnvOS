import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Mission Control Hub — EnvOS",
  description:
    "Primary Dashboard and Mission Control Hub for EnvOS virtual operating system. Manage Laptop 2 runner telemetry, spawn isolated POSIX sandboxes, and orchestrate real-time collaborative rooms.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
