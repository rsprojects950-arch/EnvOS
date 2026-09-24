"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadialGlowButton } from "@/components/ui/radial-glow-button";
import { useScrollThreshold } from "@/hooks/use-scroll-threshold";

const springConfig = {
  type: "spring" as const,
  stiffness: 220,
  damping: 26,
  mass: 0.8,
};

export function HeroCta() {
  const scrolledPast = useScrollThreshold(340);

  return (
    <div className="mt-8 sm:mt-10 flex items-center justify-center min-h-[57px] sm:min-h-[65px]">
      {!scrolledPast ? (
        <motion.div
          layoutId="hero-cta-button"
          transition={springConfig}
          className="relative inline-block"
        >
          <RadialGlowButton size="default">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key="get-started"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="inline-block"
              >
                Get Started
              </motion.span>
            </AnimatePresence>
          </RadialGlowButton>
        </motion.div>
      ) : (
        /* Invisible placeholder keeping the hero section height stable */
        <div className="w-[170px] h-[57px] sm:h-[65px] pointer-events-none" aria-hidden />
      )}
    </div>
  );
}

export default HeroCta;
