"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { RadialGlowButton } from "@/components/ui/radial-glow-button";

export function HeroCta() {
  const { scrollY } = useScroll();

  // Smoothly fade off (vanish) as user scrolls down between 20px and 220px
  const opacity = useTransform(scrollY, [20, 220], [1, 0]);
  const y = useTransform(scrollY, [20, 220], [0, -10]);
  const scale = useTransform(scrollY, [20, 220], [1, 0.96]);
  const pointerEvents = useTransform(scrollY, (latest) => (latest > 200 ? "none" : "auto"));

  return (
    <div className="mt-8 sm:mt-10 flex items-center justify-center min-h-[57px] sm:min-h-[65px]">
      <motion.div
        style={{
          opacity,
          y,
          scale,
          pointerEvents,
          willChange: "opacity, transform",
        }}
        className="relative inline-block transform-gpu"
      >
        <Link href="/register" className="inline-block">
          <RadialGlowButton size="default">
            <span className="inline-block">Get Started</span>
          </RadialGlowButton>
        </Link>
      </motion.div>
    </div>
  );
}

export default HeroCta;
