"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  Lock,
  Search,
  X,
  ArrowRight,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Terminal as TerminalIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Globe,
  Code2,
  Share2,
  ArrowUpRight,
  Clock,
  Compass,
  FileText,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SafariBrowserProps {
  compiledHtml: string;
  roomCode: string;
  onOpenIde?: () => void;
}

interface ConsoleMessage {
  id: string;
  type: "log" | "error" | "warn" | "info";
  text: string;
  time: string;
}

interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  tag?: string;
  pageId?: number | string;
}

interface KnowledgeCardData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  facts: { label: string; value: string }[];
  sourceUrl?: string;
}

// Built-in Instant Answers Knowledge Base for immediate, zero-latency searching
const INSTANT_KNOWLEDGE: Record<string, KnowledgeCardData> = {
  react: {
    title: "React",
    subtitle: "JavaScript library for user interfaces",
    description:
      "React (also known as React.js or ReactJS) is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    facts: [
      { label: "Original author", value: "Jordan Walke" },
      { label: "Initial release", value: "May 29, 2013" },
      { label: "Platform", value: "Web, Mobile (React Native)" },
      { label: "License", value: "MIT License" },
    ],
    sourceUrl: "https://react.dev",
  },
  javascript: {
    title: "JavaScript (JS)",
    subtitle: "High-level, just-in-time compiled programming language",
    description:
      "JavaScript is a lightweight, interpreted, object-oriented language with first-class functions, and is best known as the scripting language for Web pages, browsers, and Node.js backend servers.",
    facts: [
      { label: "Designed by", value: "Brendan Eich (Netscape)" },
      { label: "First appeared", value: "December 4, 1995" },
      { label: "Paradigm", value: "Multi-paradigm: event-driven, functional, imperative" },
      { label: "Standards", value: "ECMA-262 (ECMAScript)" },
    ],
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  nextjs: {
    title: "Next.js",
    subtitle: "The React Framework for the Web",
    description:
      "Next.js is an open-source web development framework created by the company Vercel providing React-based web applications with server-side rendering, App Router, and static site generation.",
    facts: [
      { label: "Developer", value: "Vercel" },
      { label: "Initial release", value: "October 25, 2016" },
      { label: "Written in", value: "JavaScript, TypeScript, Rust" },
      { label: "License", value: "MIT License" },
    ],
    sourceUrl: "https://nextjs.org",
  },
  envos: {
    title: "EnvOS",
    subtitle: "Distributed Cloud Operating System",
    description:
      "EnvOS is a collaborative developer operating system designed for running low-latency cloud sandboxes, distributed PTY compute runners, and live synchronized IDE workspaces.",
    facts: [
      { label: "Architecture", value: "Decoupled Web IDE + Physical PTY Runner" },
      { label: "Protocol", value: "Duplex WebSocket (3.2ms latency)" },
      { label: "Version", value: "v2.4 Tahoe" },
      { label: "Security", value: "Isolated container sandbox" },
    ],
    sourceUrl: "https://envos.sh",
  },
  python: {
    title: "Python",
    subtitle: "High-level general-purpose programming language",
    description:
      "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation. Python is dynamically typed and garbage-collected.",
    facts: [
      { label: "Designed by", value: "Guido van Rossum" },
      { label: "First appeared", value: "February 20, 1991" },
      { label: "Paradigm", value: "Multi-paradigm: functional, imperative, OOP" },
      { label: "Typing discipline", value: "Duck, dynamic, strong" },
    ],
    sourceUrl: "https://www.python.org",
  },
  tailwind: {
    title: "Tailwind CSS",
    subtitle: "Utility-first CSS framework",
    description:
      "Tailwind CSS is an open-source CSS framework. The main feature of this library is that it does not provide a series of predefined classes for elements such as buttons or tables, but instead provides utility classes.",
    facts: [
      { label: "Original author", value: "Adam Wathan" },
      { label: "Initial release", value: "November 1, 2017" },
      { label: "Written in", value: "JavaScript, CSS, Rust" },
      { label: "License", value: "MIT License" },
    ],
    sourceUrl: "https://tailwindcss.com",
  },
  apple: {
    title: "Apple Inc.",
    subtitle: "American multinational technology company",
    description:
      "Apple Inc. is an American multinational corporation and technology company headquartered in Cupertino, California, in Silicon Valley. It designs, develops, and sells consumer electronics, computer software, and online services.",
    facts: [
      { label: "Founders", value: "Steve Jobs, Steve Wozniak, Ronald Wayne" },
      { label: "Founded", value: "April 1, 1976" },
      { label: "Headquarters", value: "Cupertino, California, U.S." },
      { label: "Products", value: "iPhone, Mac, iPad, AirPods, Apple Watch" },
    ],
    sourceUrl: "https://apple.com",
  },
};

export function SafariBrowser({
  compiledHtml,
  roomCode,
  onOpenIde,
}: SafariBrowserProps) {
  // Navigation State
  const localDefaultUrl = `http://localhost:3000`;
  const [currentUrl, setCurrentUrl] = useState<string>(localDefaultUrl);
  const [inputUrl, setInputUrl] = useState<string>(localDefaultUrl);
  const [history, setHistory] = useState<string[]>([localDefaultUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Browser View Modes: "local" (IDE code) | "search" (Search Engine) | "reader" (Article Reader) | "start" (Safari New Tab)
  const [viewMode, setViewMode] = useState<"local" | "search" | "reader" | "start">("local");
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showDevTools, setShowDevTools] = useState<boolean>(false);

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [knowledgeCard, setKnowledgeCard] = useState<KnowledgeCardData | null>(null);
  const [searchCategory, setSearchCategory] = useState<"all" | "news" | "docs" | "wiki">("all");
  const [mathAnswer, setMathAnswer] = useState<string | null>(null);

  // Reader Mode State
  const [readerArticle, setReaderArticle] = useState<{
    title: string;
    description: string;
    content: string;
    sourceUrl: string;
    imageUrl?: string;
  } | null>(null);

  // Autocomplete suggestions dropdown in address bar
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Console Messages for DevTools
  const [consoleLogs, setConsoleLogs] = useState<ConsoleMessage[]>([
    {
      id: "log-init-1",
      type: "info",
      text: `[Safari] Connected to ws_${roomCode.toLowerCase()} runner tunnel (http://localhost:3000)`,
      time: "Now",
    },
    {
      id: "log-init-2",
      type: "log",
      text: `[Express] HTTP 200 OK • Express web container listening on port 3000`,
      time: "Now",
    },
  ]);

  // Handle postMessage console logs from iframe
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "ENVOS_CONSOLE") {
        const time = new Date().toLocaleTimeString();
        const newMsg: ConsoleMessage = {
          id: `msg-${Date.now()}-${Math.random()}`,
          type: event.data.level || "log",
          text: event.data.messages?.join(" ") || "",
          time,
        };
        setConsoleLogs((prev) => [...prev.slice(-40), newMsg]);
      }
    };

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, []);

  // Determine view mode based on URL
  useEffect(() => {
    if (
      currentUrl === "http://localhost:3000" ||
      currentUrl === "localhost:3000" ||
      currentUrl.includes("localhost") ||
      currentUrl.includes("127.0.0.1")
    ) {
      setViewMode("local");
    } else if (currentUrl.startsWith("safari://search")) {
      setViewMode("search");
    } else if (currentUrl.startsWith("safari://reader") || currentUrl.startsWith("safari://article")) {
      setViewMode("reader");
    } else if (currentUrl === "safari://start" || currentUrl === "about:blank") {
      setViewMode("start");
    } else {
      // Any other query or external web destination
      setViewMode("search");
    }
  }, [currentUrl]);

  // Perform search query across live APIs and knowledge base
  const executeSearch = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setSearchQuery(trimmed);
    const searchUrl = `safari://search?q=${encodeURIComponent(trimmed)}`;
    setCurrentUrl(searchUrl);
    setInputUrl(trimmed);
    setShowSuggestions(false);

    // Update history
    const updatedHistory = [...history.slice(0, historyIndex + 1), searchUrl];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);

    // 1. Math calculation check (e.g. 15 * 4, 100 / 2 + 5)
    try {
      if (/^[\d\s+\-*/^().%]+$/.test(trimmed) && /[+\-*/]/.test(trimmed)) {
        // Safe math evaluation
        const sanitized = trimmed.replace(/\^/g, "**");
        // eslint-disable-next-line no-new-func
        const answer = Function(`'use strict'; return (${sanitized})`)();
        if (typeof answer === "number" && !isNaN(answer)) {
          setMathAnswer(`${trimmed} = ${answer}`);
        } else {
          setMathAnswer(null);
        }
      } else {
        setMathAnswer(null);
      }
    } catch {
      setMathAnswer(null);
    }

    // 2. Instant Knowledge Card check
    const normalizedKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
    let matchedCard: KnowledgeCardData | null = null;
    for (const [key, card] of Object.entries(INSTANT_KNOWLEDGE)) {
      if (normalizedKey.includes(key) || card.title.toLowerCase().includes(trimmed.toLowerCase())) {
        matchedCard = card;
        break;
      }
    }
    setKnowledgeCard(matchedCard);

    // 3. Generate instant offline / baseline search results
    const baseResults: SearchResultItem[] = [
      {
        id: "res-1",
        title: `${trimmed} — Overview, Documentation & Guide`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(trimmed.replace(/\s+/g, "_"))}`,
        snippet: `Comprehensive information, history, specifications, and reference guides regarding ${trimmed}. Verified by open web documentation.`,
        source: "Wikipedia",
        tag: "Reference",
      },
      {
        id: "res-2",
        title: `${trimmed} on GitHub — Repositories & Open Source Projects`,
        url: `https://github.com/search?q=${encodeURIComponent(trimmed)}`,
        snippet: `Explore thousands of open source packages, repositories, and developer tools built with or related to ${trimmed}.`,
        source: "GitHub",
        tag: "Code",
      },
      {
        id: "res-3",
        title: `How to use ${trimmed}: Tips, Examples & Best Practices`,
        url: `https://developer.mozilla.org/search?q=${encodeURIComponent(trimmed)}`,
        snippet: `In-depth tutorial and examples for ${trimmed}. Learn step-by-step implementations, common pitfalls, and API conventions.`,
        source: "MDN Web Docs",
        tag: "Tutorial",
      },
      {
        id: "res-4",
        title: `${trimmed} Discussions & Community Q&A`,
        url: `https://stackoverflow.com/search?q=${encodeURIComponent(trimmed)}`,
        snippet: `Top voted questions, debugging solutions, and developer insights for ${trimmed} with active community answers.`,
        source: "Stack Overflow",
        tag: "Community",
      },
      {
        id: "res-5",
        title: `Latest News and Updates on ${trimmed}`,
        url: `https://news.ycombinator.com/`,
        snippet: `Recent releases, breaking announcements, discussions, and industry impact regarding ${trimmed}.`,
        source: "Hacker News",
        tag: "News",
      },
    ];

    setSearchResults(baseResults);

    // 4. Client-side Live Fetch: Wikipedia Live Search API (supported in browser with CORS origin=*)
    try {
      const liveWikiApi = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        trimmed
      )}&format=json&origin=*`;

      const response = await fetch(liveWikiApi);
      if (response.ok) {
        const data = await response.json();
        const wikiItems = data?.query?.search;
        if (Array.isArray(wikiItems) && wikiItems.length > 0) {
          const liveWikiResults: SearchResultItem[] = wikiItems.slice(0, 7).map((item: any, idx: number) => {
            const cleanSnippet = (item.snippet || "")
              .replace(/<span class="searchmatch">/g, "")
              .replace(/<\/span>/g, "")
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, "&");

            return {
              id: `wiki-${item.pageid || idx}`,
              title: item.title,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, "_"))}`,
              snippet: cleanSnippet + "...",
              source: "Wikipedia Live",
              tag: idx === 0 ? "Top Result" : "Encyclopedia",
              pageId: item.pageid,
            };
          });

          // Merge live results with developer bookmarks
          setSearchResults([...liveWikiResults, ...baseResults.slice(1, 4)]);

          // Also attempt to fetch Wikipedia Summary for top result if no card was set
          if (!matchedCard && wikiItems[0]?.title) {
            try {
              const summaryRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                  wikiItems[0].title.replace(/\s+/g, "_")
                )}`
              );
              if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                if (summaryData.extract) {
                  setKnowledgeCard({
                    title: summaryData.title,
                    subtitle: summaryData.description || "Knowledge Article",
                    description: summaryData.extract,
                    imageUrl: summaryData.thumbnail?.source,
                    facts: [
                      { label: "Source", value: "Wikipedia Live Encyclopedia" },
                      { label: "Language", value: summaryData.lang?.toUpperCase() || "EN" },
                    ],
                    sourceUrl: summaryData.content_urls?.desktop?.page,
                  });
                }
              }
            } catch {
              // Ignore summary error
            }
          }
        }
      }
    } catch {
      // In case offline, baseResults remain visible
    } finally {
      setIsLoading(false);
    }
  };

  // Open an article in Reader Mode
  const openReaderArticle = async (result: SearchResultItem) => {
    setIsLoading(true);
    const readerUrl = `safari://reader?title=${encodeURIComponent(result.title)}`;
    setCurrentUrl(readerUrl);
    setInputUrl(result.url);

    // Update history
    const updatedHistory = [...history.slice(0, historyIndex + 1), readerUrl];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);

    // Set preliminary article
    setReaderArticle({
      title: result.title,
      description: result.snippet,
      content: `${result.snippet}\n\nLoading full article contents from ${result.source}...`,
      sourceUrl: result.url,
    });

    // Try fetching full article summary from Wikipedia API
    try {
      const summaryApi = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        result.title.replace(/\s+/g, "_")
      )}`;
      const res = await fetch(summaryApi);
      if (res.ok) {
        const data = await res.json();
        setReaderArticle({
          title: data.title || result.title,
          description: data.description || "Encyclopedia Entry",
          content:
            data.extract ||
            result.snippet +
              `\n\nThis article covers in-depth technical references and background regarding ${result.title}.`,
          sourceUrl: data.content_urls?.desktop?.page || result.url,
          imageUrl: data.thumbnail?.source,
        });
      }
    } catch {
      // Fallback stays in place
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleNavigate = (targetInput: string) => {
    const clean = targetInput.trim();
    if (!clean) return;

    if (
      clean === "localhost:3000" ||
      clean === "http://localhost:3000" ||
      clean === "127.0.0.1:3000" ||
      clean === "local" ||
      clean === "app"
    ) {
      setCurrentUrl(localDefaultUrl);
      setInputUrl(localDefaultUrl);
      const updatedHistory = [...history.slice(0, historyIndex + 1), localDefaultUrl];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setShowSuggestions(false);
      return;
    }

    if (clean === "safari://start" || clean === "home") {
      setCurrentUrl("safari://start");
      setInputUrl("");
      const updatedHistory = [...history.slice(0, historyIndex + 1), "safari://start"];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setShowSuggestions(false);
      return;
    }

    // Execute as search query
    executeSearch(clean);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      const url = history[prev];
      setCurrentUrl(url);
      setInputUrl(url.includes("safari://search?q=") ? decodeURIComponent(url.split("?q=")[1]) : url);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      const url = history[next];
      setCurrentUrl(url);
      setInputUrl(url.includes("safari://search?q=") ? decodeURIComponent(url.split("?q=")[1]) : url);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
    if (viewMode === "search" && searchQuery) {
      executeSearch(searchQuery);
    } else {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleHome = () => {
    handleNavigate(localDefaultUrl);
  };

  const handleOpenExternal = () => {
    if (viewMode === "local") {
      const blob = new Blob([compiledHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } else if (viewMode === "search" && searchQuery) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    } else if (viewMode === "reader" && readerArticle) {
      window.open(readerArticle.sourceUrl, "_blank");
    } else {
      window.open("https://www.google.com", "_blank");
    }
  };

  // Quick favorites list for Start Page
  const FAVORITE_SITES = [
    {
      name: "Local App",
      url: "http://localhost:3000",
      icon: "🪐",
      color: "from-cyan-500 to-blue-600",
      desc: "Live Port 3000",
      action: () => handleNavigate(localDefaultUrl),
    },
    {
      name: "Google Search",
      url: "google",
      icon: "G",
      color: "from-blue-500 to-red-500",
      desc: "Web Search",
      action: () => executeSearch("Google Search Engine"),
    },
    {
      name: "GitHub",
      url: "github",
      icon: "🐙",
      color: "from-zinc-700 to-zinc-950",
      desc: "Repositories & Code",
      action: () => executeSearch("GitHub repositories"),
    },
    {
      name: "Wikipedia",
      url: "wikipedia",
      icon: "W",
      color: "from-zinc-200 to-zinc-400 text-zinc-900",
      desc: "Free Encyclopedia",
      action: () => executeSearch("Wikipedia encyclopedia"),
    },
    {
      name: "React Docs",
      url: "react",
      icon: "⚛",
      color: "from-cyan-400 to-blue-500",
      desc: "Frontend UI Library",
      action: () => executeSearch("React"),
    },
    {
      name: "Next.js",
      url: "nextjs",
      icon: "▲",
      color: "from-zinc-800 to-black",
      desc: "React Web Framework",
      action: () => executeSearch("Next.js"),
    },
    {
      name: "Tailwind CSS",
      url: "tailwindcss",
      icon: "🌊",
      color: "from-sky-400 to-teal-500",
      desc: "Modern Styles",
      action: () => executeSearch("Tailwind CSS"),
    },
    {
      name: "Hacker News",
      url: "hackernews",
      icon: "Y",
      color: "from-orange-500 to-amber-600",
      desc: "Developer News",
      action: () => executeSearch("Hacker News trending"),
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e17] font-manrope text-zinc-100 overflow-hidden select-none">
      {/* 1. SAFARI TOP NAVIGATION TOOLBAR */}
      <div className="h-11 px-3 bg-[#070910] border-b border-white/10 flex items-center justify-between gap-3 text-xs select-none">
        {/* Navigation buttons: Back / Forward / Reload / Home */}
        <div className="flex items-center gap-1 text-zinc-400 shrink-0">
          <button
            type="button"
            disabled={historyIndex === 0}
            onClick={handleBack}
            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleForward}
            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Reload"
          >
            <RotateCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-cyan-400")} />
          </button>
          <button
            type="button"
            onClick={handleHome}
            className="p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Local App Home (Port 3000)"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Unified Smart Search / Address Bar with Autocomplete Dropdown */}
        <div className="flex-1 max-w-xl relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNavigate(inputUrl);
            }}
            className="relative flex items-center h-7 px-3 rounded-lg bg-black/60 border border-white/15 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-inner"
          >
            {viewMode === "local" ? (
              <Lock className="w-3 h-3 text-emerald-400 shrink-0 mr-2" />
            ) : viewMode === "reader" ? (
              <BookOpen className="w-3 h-3 text-purple-400 shrink-0 mr-2" />
            ) : (
              <Search className="w-3 h-3 text-cyan-400 shrink-0 mr-2" />
            )}
            <input
              ref={searchInputRef}
              type="text"
              value={inputUrl}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search Google, Wikipedia, or enter URL..."
              className="w-full bg-transparent text-white font-manrope text-xs placeholder:text-zinc-500 focus:outline-none"
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => {
                  setInputUrl("");
                  searchInputRef.current?.focus();
                }}
                className="p-0.5 text-zinc-500 hover:text-zinc-200 mr-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="submit"
              className="p-0.5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Search / Navigate"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          {/* Autocomplete / Instant Search Suggestions Dropdown */}
          {showSuggestions && inputUrl.trim().length > 0 && viewMode !== "local" && (
            <div
              className="absolute top-9 inset-x-0 rounded-xl bg-black/90 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-50 flex flex-col gap-1 text-xs font-manrope"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div
                onClick={() => handleNavigate(inputUrl)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2.5 cursor-pointer text-cyan-300"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Search web for <strong>&ldquo;{inputUrl}&rdquo;</strong>
                </span>
              </div>
              <div
                onClick={() => {
                  executeSearch(inputUrl);
                }}
                className="px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2.5 cursor-pointer text-zinc-300"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Wikipedia encyclopedia: {inputUrl}</span>
              </div>
              <div
                onClick={() => {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(inputUrl)}`, "_blank");
                  setShowSuggestions(false);
                }}
                className="px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between cursor-pointer text-zinc-400 hover:text-white"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Open on Google Search</span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </div>
            </div>
          )}
        </div>

        {/* Right Tools: Viewport Switcher / IDE shortcut / DevTools / Popout */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Responsive viewport switchers */}
          <div className="hidden sm:flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setViewportMode("desktop")}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer",
                viewportMode === "desktop" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Desktop View (100%)"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("tablet")}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer",
                viewportMode === "tablet" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("mobile")}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer",
                viewportMode === "mobile" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jump to IDE */}
          {onOpenIde && (
            <button
              type="button"
              onClick={onOpenIde}
              className="px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Open EnvOS IDE"
            >
              <Code2 className="w-3 h-3" />
              <span>IDE</span>
            </button>
          )}

          {/* DevTools Toggle */}
          <button
            type="button"
            onClick={() => setShowDevTools((prev) => !prev)}
            className={cn(
              "p-1.5 rounded-md border transition-colors flex items-center gap-1 text-[11px] cursor-pointer",
              showDevTools
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white"
            )}
            title="Toggle Web Inspector Console"
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            {consoleLogs.length > 0 && (
              <span className="text-[10px] font-mono px-1 rounded bg-cyan-400/20 text-cyan-300">
                {consoleLogs.length}
              </span>
            )}
          </button>

          {/* Popout in real external browser tab */}
          <button
            type="button"
            onClick={handleOpenExternal}
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Open in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. BOOKMARKS & SEARCH CATEGORY BAR */}
      <div className="h-7 px-3 bg-[#06080e] border-b border-white/5 flex items-center justify-between text-[11px]">
        {/* Bookmarks */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleNavigate(localDefaultUrl)}
            className={cn(
              "px-2 py-0.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 font-medium",
              viewMode === "local"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Local App (Port 3000)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("safari://start")}
            className={cn(
              "px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shrink-0",
              viewMode === "start"
                ? "bg-white/15 text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Compass className="w-3 h-3" />
            <span>Start Page</span>
          </button>

          <button
            type="button"
            onClick={() => executeSearch("React documentation")}
            className="px-2 py-0.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            React Docs
          </button>

          <button
            type="button"
            onClick={() => executeSearch("JavaScript array methods")}
            className="px-2 py-0.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            JS Guide
          </button>

          <button
            type="button"
            onClick={() => executeSearch("Tailwind CSS utility classes")}
            className="px-2 py-0.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            Tailwind
          </button>
        </div>

        {/* Direct Google External Search Pill */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank")}
            className="hidden md:flex items-center gap-1 text-[11px] text-zinc-400 hover:text-cyan-300 cursor-pointer"
          >
            <span>Search on Google</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3. MAIN BROWSER VIEWPORT */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#030509]">
        <div className="flex-1 flex items-center justify-center p-0 overflow-auto">
          <div
            className={cn(
              "h-full transition-all duration-300 flex flex-col bg-white overflow-hidden",
              viewportMode === "desktop" && "w-full",
              viewportMode === "tablet" && "w-[768px] max-w-full my-3 rounded-2xl shadow-2xl border border-white/20",
              viewportMode === "mobile" && "w-[375px] max-w-full my-4 rounded-3xl shadow-2xl border border-white/25"
            )}
          >
            {/* VIEW MODE 1: LOCAL APP PREVIEW (PORT 3000) */}
            {viewMode === "local" && (
              <iframe
                key={`safari-frame-${reloadKey}`}
                srcDoc={compiledHtml}
                title="EnvOS Local App Preview"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
                className="w-full h-full border-0 bg-white"
              />
            )}

            {/* VIEW MODE 2: SAFARI START PAGE */}
            {viewMode === "start" && (
              <div className="w-full h-full bg-[#0a0d14] text-zinc-100 overflow-y-auto p-6 flex flex-col items-center justify-center font-manrope">
                <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6">
                  {/* Safari Logo & Greeting */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-2xl flex items-center justify-center">
                      <Compass className="w-9 h-9 text-white animate-spin-slow" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Safari Search</h1>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Search the web, explore documentation, or preview your live workspace application on port 3000.
                    </p>
                  </div>

                  {/* Centered Big Search Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) executeSearch(searchQuery);
                    }}
                    className="w-full flex items-center h-12 px-4 rounded-2xl bg-white/[0.06] border border-white/15 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-2xl transition-all"
                  >
                    <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Google, Wikipedia, topics, or code..."
                      className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs transition-all cursor-pointer"
                    >
                      Search
                    </button>
                  </form>

                  {/* Favorites Grid */}
                  <div className="w-full pt-4">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-left mb-3">
                      Favorites
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {FAVORITE_SITES.map((site) => (
                        <div
                          key={site.name}
                          onClick={site.action}
                          className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer flex flex-col items-center gap-2"
                        >
                          <div
                            className={cn(
                              "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-105 transition-transform",
                              site.color
                            )}
                          >
                            {site.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {site.name}
                            </div>
                            <div className="text-[10px] text-zinc-500">{site.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: BUILT-IN SAFARI SEARCH ENGINE */}
            {viewMode === "search" && (
              <div className="w-full h-full bg-[#0a0d14] text-zinc-100 overflow-y-auto flex flex-col font-manrope">
                {/* Search Bar Header */}
                <div className="p-4 sm:px-8 border-b border-white/10 bg-[#07090f]/90 sticky top-0 z-20 backdrop-blur-xl">
                  <div className="max-w-3xl flex flex-col sm:flex-row items-center gap-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchQuery.trim()) executeSearch(searchQuery);
                      }}
                      className="flex-1 w-full flex items-center h-10 px-3 rounded-xl bg-white/[0.06] border border-white/15 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30"
                    >
                      <Search className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="text-xs text-cyan-400 font-semibold px-2 hover:underline cursor-pointer"
                      >
                        Search
                      </button>
                    </form>

                    {/* Quick Search Engine External Direct Tabs */}
                    <div className="flex items-center gap-1 text-[11px] shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank")
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Search in Google"
                      >
                        <span>Google</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`, "_blank")
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Search in DuckDuckGo"
                      >
                        <span>DuckDuckGo</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Results Content */}
                <div className="p-4 sm:p-8 max-w-3xl w-full mx-auto space-y-6">
                  {/* Calculation / Math Card */}
                  {mathAnswer && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
                          Calculation
                        </div>
                        <div className="text-2xl font-bold font-mono text-white">{mathAnswer}</div>
                      </div>
                      <div className="text-2xl">🧮</div>
                    </div>
                  )}

                  {/* Instant Knowledge Card */}
                  {knowledgeCard && (
                    <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white tracking-tight">{knowledgeCard.title}</h2>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-cyan-400 font-medium">{knowledgeCard.subtitle}</p>
                        </div>
                        {knowledgeCard.imageUrl && (
                          <img
                            src={knowledgeCard.imageUrl}
                            alt={knowledgeCard.title}
                            className="w-14 h-14 rounded-xl object-contain bg-white/5 p-1 border border-white/10 shrink-0"
                          />
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{knowledgeCard.description}</p>

                      {/* Facts Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        {knowledgeCard.facts.map((fact, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="text-zinc-500 font-semibold">{fact.label}: </span>
                            <span className="text-zinc-300">{fact.value}</span>
                          </div>
                        ))}
                      </div>

                      {knowledgeCard.sourceUrl && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => window.open(knowledgeCard.sourceUrl, "_blank")}
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <span>Learn more on official website</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results Count Header */}
                  <div className="text-xs text-zinc-500 flex items-center justify-between border-b border-white/5 pb-2">
                    <span>
                      Results for &ldquo;{searchQuery}&rdquo; {isLoading && "(Updating...)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigate(localDefaultUrl)}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      ← Back to Local App (Port 3000)
                    </button>
                  </div>

                  {/* Search Results List */}
                  <div className="space-y-5">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="group space-y-1.5 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                      >
                        {/* Source Tag & URL Breadcrumb */}
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 font-semibold">
                            {item.source}
                          </span>
                          <span className="truncate max-w-sm font-mono text-[10px] text-zinc-500">{item.url}</span>
                        </div>

                        {/* Title: Clickable to open in Safari Reader Mode */}
                        <h3
                          onClick={() => openReaderArticle(item)}
                          className="text-base font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{item.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>

                        {/* Snippet */}
                        <p className="text-xs text-zinc-300 leading-relaxed">{item.snippet}</p>

                        {/* Action Pills */}
                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => openReaderArticle(item)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read in Safari</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.open(item.url, "_blank")}
                            className="text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1"
                          >
                            <span>Open original</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Related Searches */}
                  <div className="pt-6 border-t border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      People Also Search For
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        `${searchQuery} tutorial`,
                        `${searchQuery} github examples`,
                        `${searchQuery} best practices`,
                        `what is ${searchQuery}`,
                        `${searchQuery} documentation`,
                      ].map((rel, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => executeSearch(rel)}
                          className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] text-xs text-zinc-300 hover:text-white border border-white/5 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3 text-cyan-400" />
                          <span>{rel}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 4: SAFARI READER MODE FOR ARTICLES */}
            {viewMode === "reader" && readerArticle && (
              <div className="w-full h-full bg-[#0d1117] text-zinc-100 overflow-y-auto p-6 sm:p-10 font-manrope">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Top Bar Navigation */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Search Results</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenExternal}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open on Wikipedia</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Article Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                        Safari Reader
                      </span>
                      <span className="text-zinc-500 text-xs">• Verified Open Web Content</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{readerArticle.title}</h1>
                    <p className="text-sm text-cyan-400 font-medium">{readerArticle.description}</p>
                  </div>

                  {/* Thumbnail if present */}
                  {readerArticle.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 max-h-64 flex items-center justify-center bg-black/40 p-4">
                      <img
                        src={readerArticle.imageUrl}
                        alt={readerArticle.title}
                        className="max-h-56 object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {/* Article Body */}
                  <div className="text-sm text-zinc-300 leading-relaxed space-y-4 pt-2 border-t border-white/5">
                    {readerArticle.content.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Footer options */}
                  <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleNavigate(localDefaultUrl)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-semibold transition-colors cursor-pointer"
                    >
                      Return to Local App (Port 3000)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("safari://start")}
                      className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Safari Start Page
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. SAFARI WEB INSPECTOR / DEVTOOLS DRAWER (Collapsible) */}
        {showDevTools && (
          <div className="h-44 bg-[#05070d] border-t border-white/10 flex flex-col text-xs font-mono">
            {/* DevTools Header */}
            <div className="h-7 px-3 bg-[#030509] border-b border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Safari Web Inspector</span>
                </span>
                <span>•</span>
                <span>Port 3000 (ws_{roomCode})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Clear Console
                </button>
                <button
                  type="button"
                  onClick={() => setShowDevTools(false)}
                  className="text-zinc-500 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Console Log Lines */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1 font-mono text-[11.5px] leading-relaxed">
              {consoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-2 border-b border-white/[0.03] pb-1",
                    log.type === "error" && "text-rose-400",
                    log.type === "warn" && "text-amber-300",
                    log.type === "info" && "text-cyan-300",
                    log.type === "log" && "text-zinc-300"
                  )}
                >
                  <span className="text-zinc-600 text-[10px] shrink-0 font-sans">{log.time}</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
