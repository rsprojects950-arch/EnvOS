"use client";

import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Hash,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  HardDrive,
  Cloud,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceFiles } from "./workspace-ide";

interface FileExplorerProps {
  roomCode: string;
  files: WorkspaceFiles;
  onOpenFileInIde: (fileName: string) => void;
  onDeleteFile?: (fileName: string) => void;
  onCreateFile?: (fileName: string) => void;
}

export function FileExplorer({
  roomCode,
  files,
  onOpenFileInIde,
  onDeleteFile,
  onCreateFile,
}: FileExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "src" | "public" | "config">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const fileEntries = Object.entries(files);

  const filteredFiles = fileEntries.filter(([fileName]) => {
    if (searchQuery.trim()) {
      if (!fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }
    if (activeFilter === "src") return fileName.endsWith(".js") || fileName.endsWith(".ts");
    if (activeFilter === "public") return fileName.endsWith(".html") || fileName.endsWith(".css");
    if (activeFilter === "config") return fileName.endsWith(".json") || fileName.startsWith(".");
    return true;
  });

  const getFileIcon = (name: string, size = "w-7 h-7") => {
    if (name.endsWith(".html")) return <span className="text-orange-400 font-bold text-sm">HTML</span>;
    if (name.endsWith(".css")) return <Hash className={cn(size, "text-cyan-400")} />;
    if (name.endsWith(".js")) return <span className="text-yellow-400 font-bold text-sm">JS</span>;
    if (name.endsWith(".ts")) return <span className="text-sky-400 font-bold text-sm">TS</span>;
    if (name.endsWith(".json")) return <span className="text-amber-400 font-bold text-sm">{`{}`}</span>;
    if (name.endsWith(".md")) return <FileText className={cn(size, "text-purple-400")} />;
    return <FileCode className={cn(size, "text-zinc-400")} />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile?.(newFileName.trim());
    setNewFileName("");
    setIsAddingFile(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden font-manrope bg-[#0b0e17] text-zinc-200 select-none">
      {/* 1. FINDER SIDEBAR (Favorites & Storage) */}
      <div className="w-52 bg-[#060810] border-r border-white/10 p-3 flex flex-col justify-between text-xs shrink-0 select-none">
        <div className="space-y-4">
          {/* Favorites */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block mb-1">
              Favorites
            </span>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer text-left",
                  activeFilter === "all"
                    ? "bg-cyan-500/20 text-cyan-200 font-semibold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>All Workspace Files</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("src")}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer text-left",
                  activeFilter === "src"
                    ? "bg-cyan-500/20 text-cyan-200 font-semibold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Source (src)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("public")}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer text-left",
                  activeFilter === "public"
                    ? "bg-cyan-500/20 text-cyan-200 font-semibold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Folder className="w-3.5 h-3.5 text-blue-400" />
                <span>Public Assets</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("config")}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer text-left",
                  activeFilter === "config"
                    ? "bg-cyan-500/20 text-cyan-200 font-semibold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Folder className="w-3.5 h-3.5 text-emerald-400" />
                <span>Configurations</span>
              </button>
            </div>
          </div>

          {/* Locations */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block mb-1">
              Locations
            </span>
            <div className="space-y-1">
              <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px] text-zinc-300">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Laptop 2 SSD</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px] text-zinc-300">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Supabase Backup</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Storage stats */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 font-mono">
          <div>Folder: ws_{roomCode.toLowerCase()}</div>
          <div className="text-zinc-500 mt-0.5">{fileEntries.length} items total</div>
        </div>
      </div>

      {/* 2. FINDER MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d17]">
        {/* Finder Toolbar */}
        <div className="h-10 px-4 bg-[#080b13] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <span className="text-white font-semibold">workspaces</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-cyan-400">ws_{roomCode.toLowerCase()}</span>
            {activeFilter !== "all" && (
              <>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span className="text-white font-semibold">{activeFilter}</span>
              </>
            )}
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-36 sm:w-44 pl-8 pr-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-manrope focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1 rounded cursor-pointer transition-colors",
                  viewMode === "grid" ? "bg-white/20 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1 rounded cursor-pointer transition-colors",
                  viewMode === "list" ? "bg-white/20 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* New File Button */}
            <button
              type="button"
              onClick={() => setIsAddingFile(!isAddingFile)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New File</span>
            </button>
          </div>
        </div>

        {/* Inline New File Form */}
        {isAddingFile && (
          <form onSubmit={handleCreateSubmit} className="p-3 bg-white/[0.02] border-b border-white/10 flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. utils.js, styles.css..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/50 text-white text-xs font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 cursor-pointer"
            >
              Add File
            </button>
          </form>
        )}

        {/* Files Display (Grid View or List View) */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredFiles.map(([fileName, content]) => {
                const isSelected = selectedFile === fileName;
                const sizeKb = (content.length / 1024).toFixed(1);

                return (
                  <div
                    key={`finder-file-${fileName}`}
                    onClick={() => setSelectedFile(fileName)}
                    onDoubleClick={() => onOpenFileInIde(fileName)}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all duration-150 group relative",
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
                      {getFileIcon(fileName, "w-6 h-6")}
                    </div>
                    <span className="font-semibold text-xs text-white truncate w-full tracking-tight mb-1">
                      {fileName}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{sizeKb} KB</span>

                    {/* Hover Quick Open Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFileInIde(fileName);
                      }}
                      className="mt-2 w-full py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-medium text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open in IDE</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-1">
              {filteredFiles.map(([fileName, content]) => {
                const isSelected = selectedFile === fileName;
                const sizeKb = (content.length / 1024).toFixed(1);

                return (
                  <div
                    key={`finder-list-${fileName}`}
                    onClick={() => setSelectedFile(fileName)}
                    onDoubleClick={() => onOpenFileInIde(fileName)}
                    className={cn(
                      "px-3 py-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all",
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/40 text-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {getFileIcon(fileName, "w-4 h-4")}
                      <span className="font-medium text-white truncate">{fileName}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 shrink-0">
                      <span>{sizeKb} KB</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFileInIde(fileName);
                        }}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-cyan-300 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Finder Status Footer */}
        <div className="h-7 px-4 bg-[#070912] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500 select-none shrink-0">
          <span>{filteredFiles.length} items</span>
          <span>Double-click any file to launch in EnvOS IDE</span>
        </div>
      </div>
    </div>
  );
}

