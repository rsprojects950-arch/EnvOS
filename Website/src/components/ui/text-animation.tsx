"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface TextAnimationProps {
  children: React.ReactNode;
  delay?: number;
  divideBy?: "word" | "letter";
  className?: string;
}

export const TextAnimation = ({
  children,
  delay = 0,
  className,
}: TextAnimationProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "40px" }}
      transition={{ duration: 0.4, delay: delay * 0.4, ease: EASE }}
      className={cn("inline-block transform-gpu", className)}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.span>
  );
};

export default TextAnimation;
