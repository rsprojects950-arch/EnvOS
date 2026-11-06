"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const CRITICAL_IMAGES = [
  "/envos-clean.png",
  "/envos-wordmark.png",
];

export function SitePreloader({ onLoaded }: { onLoaded?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Check if already loaded in this session to make re-visits instant
    if (typeof window !== "undefined" && sessionStorage.getItem("envos_preloaded")) {
      setLoading(false);
      onLoaded?.();
      return;
    }

    let isMounted = true;

    async function preloadAssets() {
      try {
        // 1. Preload fonts
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
          if (isMounted) setProgress(50);
        }

        // 2. Pre-decode critical images
        const imagePromises = CRITICAL_IMAGES.map((src) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image();
            img.src = src;
            if (img.decode) {
              img.decode().then(() => resolve()).catch(() => resolve());
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          });
        });

        await Promise.race([
          Promise.all(imagePromises),
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]);

        if (isMounted) setProgress(85);

        // 3. Allow browser one frame to layout and compile styles
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      } catch (e) {
        console.warn("Preloader non-critical asset error:", e);
      } finally {
        if (isMounted) {
          setProgress(100);
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
              sessionStorage.setItem("envos_preloaded", "1");
              onLoaded?.();
            }
          }, 150);
        }
      }
    }

    // Safety fallback: never block user for more than 750ms
    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
        sessionStorage.setItem("envos_preloaded", "1");
        onLoaded?.();
      }
    }, 750);

    preloadAssets();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [loading, onLoaded]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="site-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black select-none pointer-events-auto"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.12),transparent_65%)] pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <Image
              src="/envos-clean.png"
              alt="EnvOS"
              width={140}
              height={32}
              className="h-8 w-auto object-contain brightness-110 drop-shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
              priority
            />

            {/* Glowing progress line */}
            <div className="w-36 h-[2px] rounded-full bg-white/10 overflow-hidden relative mt-1">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-white rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SitePreloader;
