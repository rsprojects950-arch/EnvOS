"use client";

import { useState, useEffect } from "react";

export function useScrollThreshold(threshold = 340): boolean {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setReached(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return reached;
}
