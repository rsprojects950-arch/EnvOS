"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { RadialGlowButton } from "@/components/ui/radial-glow-button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

const springConfig = {
  type: "spring" as const,
  stiffness: 220,
  damping: 26,
  mass: 0.8,
};

export function Navbar({ className = "" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Fades in slowly with the scroll at the point where Hero CTA fades out (180px to 320px)
  const navCtaOpacity = useTransform(scrollY, [180, 320], [0, 1]);
  const navCtaY = useTransform(scrollY, [180, 320], [8, 0]);
  const navCtaScale = useTransform(scrollY, [180, 320], [0.95, 1]);
  const navCtaPointerEvents = useTransform(scrollY, (v) => (v > 200 ? "auto" : "none"));

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Architecture", href: "#architecture" },
    { name: "Features", href: "#features" },
  ];

  return (
    <header
      className="fixed top-7 sm:top-8 inset-x-0 z-50 flex items-center justify-center pointer-events-none px-6 sm:px-10 transform-gpu"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Corner Logo (visible when scrolled) */}
      <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 pointer-events-auto">
        {scrolled && (
          <motion.a
            layoutId="envos-nav-logo"
            href="#"
            className="flex items-center hover:opacity-80 transition-opacity"
            transition={springConfig}
          >
            <Image
              src="/envos-clean.png"
              alt="EnvOS Logo"
              width={120}
              height={26}
              className="h-6 sm:h-7 w-auto object-contain brightness-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              priority
            />
          </motion.a>
        )}
      </div>

      {/* Center Nav Pill */}
      <motion.nav
        layout
        transition={springConfig}
        className={cn(
          "pointer-events-auto relative rounded-full p-[2.5px] h-[57px] sm:h-[65px] flex items-center transform-gpu",
          className
        )}
        style={{ transform: "translateZ(0)" }}
      >
        {/* Liquid Glass Pill Background Layer (z-0) */}
        <motion.div
          animate={{
            opacity: scrolled ? 1 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 rounded-full pointer-events-none glass-liquid-bar shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
        />

        {/* Liquid Metal Border Layer (z-10, sits right on top of the rim) */}
        <motion.div
          animate={{
            opacity: scrolled ? 1 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-10 rounded-full overflow-hidden pointer-events-none liquid-metal-border-mask"
        >
          <LiquidMetal
            colorBack="#888888"
            colorTint="#ffffff"
            speed={0.4}
            repetition={4}
            distortion={0.15}
            scale={1}
            className="absolute inset-0 z-0 rounded-full"
          />
        </motion.div>

        {/* Inner Nav Content (z-20) */}
        <motion.div
          layout
          transition={springConfig}
          className={cn(
            "relative z-20 rounded-full flex items-center font-manrope",
            scrolled
              ? "gap-10 sm:gap-12 px-9 py-3.5 sm:px-11 sm:py-4"
              : "gap-16 sm:gap-24 md:gap-28 px-6 py-3.5 sm:px-8 sm:py-4"
          )}
        >
          {/* Logo at left of About (visible before scroll with equal spacing) */}
          {!scrolled && (
            <motion.a
              layoutId="envos-nav-logo"
              href="#"
              className="flex items-center hover:opacity-80 transition-opacity"
              transition={springConfig}
            >
              <Image
                src="/envos-clean.png"
                alt="EnvOS Logo"
                width={120}
                height={26}
                className="h-6 sm:h-7 w-auto object-contain brightness-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                priority
              />
            </motion.a>
          )}

          {navLinks.map((link) => (
            <motion.a
              layout
              transition={springConfig}
              key={link.name}
              href={link.href}
              className={cn(
                "font-manrope text-base sm:text-lg font-medium tracking-tight transition-colors duration-200",
                scrolled
                  ? "text-zinc-200 hover:text-white"
                  : "text-zinc-100 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              )}
            >
              {link.name}
            </motion.a>
          ))}
        </motion.div>
      </motion.nav>

      {/* Right Corner Button (fades in slowly with scroll at hero transition) */}
      <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 flex items-center">
        <motion.div
          style={{
            opacity: navCtaOpacity,
            y: navCtaY,
            scale: navCtaScale,
            pointerEvents: navCtaPointerEvents,
          }}
          className="flex items-center"
        >
          <Link href="/login" className="inline-block pointer-events-auto">
            <RadialGlowButton size="compact">
              <span className="inline-block">Login/Sign Up</span>
            </RadialGlowButton>
          </Link>
        </motion.div>
      </div>
    </header>
  );
}

export default Navbar;
