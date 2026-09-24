"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Terminal, Sparkles } from "lucide-react";

export function Navbar() {
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      alert(`Connecting to EnvOS room: ${roomCode.toUpperCase()}...`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050608]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md group-hover:scale-105 transition-transform">
            <span className="text-lg">🪐</span>
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-bold text-lg tracking-wider text-white">
              Env<span className="text-blue-400">OS</span>
            </span>
            <span className="text-[10px] font-mono -mt-1 text-zinc-500 tracking-tight">
              CLOUD OPERATING SYSTEM
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#bento" className="hover:text-white transition-colors">
            Decoupled Runner
          </a>
          <a
            href="http://localhost:3000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors text-blue-400"
          >
            <BookOpen className="w-4 h-4" />
            <span>Docs</span>
          </a>
        </nav>

        {/* Join Code Input & Action CTAs */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleJoin} className="hidden sm:flex items-center">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="6-Char Room Code"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-36 h-9 pl-3 pr-8 rounded-l-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 uppercase transition-all"
              />
              <button
                type="submit"
                disabled={!roomCode}
                className="h-9 px-3 rounded-r-lg bg-blue-600/80 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-600/80 text-white text-xs font-medium border border-l-0 border-blue-500/40 transition-all flex items-center gap-1"
              >
                Join
              </button>
            </div>
          </form>

          <a
            href="https://github.com/rsprojects950-arch/EnvOS"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          <a
            href="#hero"
            className="relative inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch OS</span>
          </a>
        </div>
      </div>
    </header>
  );
}
