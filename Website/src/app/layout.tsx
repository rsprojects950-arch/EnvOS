import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EnvOS — Collaborative Cloud Operating System & Virtual Workspace",
  description:
    "The browser-native cloud operating system. Monaco Code Studio, real bash shells with zero cloud hosting bills, and seamless room-code collaboration.",
  keywords: [
    "Cloud OS",
    "Web Operating System",
    "Collaborative Coding",
    "Browser Terminal",
    "xterm.js",
    "node-pty",
    "Monaco Editor",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${orbitron.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#050608] text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
