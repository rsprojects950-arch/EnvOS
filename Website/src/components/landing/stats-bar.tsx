"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "0 MB", label: "Client Disk Footprint", sub: "Runs in any browser tab" },
  { value: "< 5 ms", label: "Keystroke Latency", sub: "Direct WebSocket ANSI stream" },
  { value: "$0.00", label: "Cloud Hosting Bills", sub: "Runs on your own hardware" },
  { value: "100%", label: "Native Linux Shell", sub: "node-pty + /dev/pts execution" },
];

export function StatsBar() {
  return (
    <div className="py-12 border-y border-white/[0.08] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-zinc-100 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-semibold text-zinc-300 font-sans">
                {stat.label}
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
