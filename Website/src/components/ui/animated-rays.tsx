"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedRaysProps {
  /** Additional CSS classes */
  className?: string;
  /** Optional children to render over the background */
  children?: React.ReactNode;
}

export function AnimatedRays({
  className = "",
  children,
}: AnimatedRaysProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stripes = `repeating-linear-gradient(
        100deg,
        var(--stripe-color, #ffffff) 0%,
        var(--stripe-color, #ffffff) 7%,
        transparent 10%,
        transparent 12%,
        var(--stripe-color, #ffffff) 16%
    )`;

  // Inverted color map for `mix-blend-mode: difference` against white stripes:
  // #9f5a05 (inverted from #60a5fa Blue) -> renders as #60a5fa Blue
  // #178606 (inverted from #e879f9 Pink) -> renders as #e879f9 Pink
  // #a1152b (inverted from #5eead4 Teal) -> renders as #5eead4 Teal
  const rainbow = `repeating-linear-gradient(
        100deg,
        #9f5a05 10%,
        #178606 15%,
        #9f5a05 20%,
        #a1152b 25%,
        #9f5a05 30%
    )`;

  return (
    <section className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Aurora Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `${stripes}, ${rainbow}`,
          backgroundSize: "300%, 200%",
          backgroundPosition: "50% 50%, 50% 50%",
          filter: "blur(10px) opacity(70%) saturate(220%)",
          maskImage:
            "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
        }}
      >
        {/* Animated overlay with difference blending for sharp Moiré ray beams */}
        <div
          className="absolute inset-0 animate-aurora-bg"
          style={{
            backgroundImage: `${stripes}, ${rainbow}`,
            backgroundSize: "200%, 100%",
            backgroundAttachment: "fixed",
            mixBlendMode: "difference",
          }}
        />
      </div>

      {children && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </section>
  );
}

export default AnimatedRays;
