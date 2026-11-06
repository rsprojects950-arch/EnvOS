"use client";

import React, { useEffect, useRef } from "react";

interface RippleDotMatrixProps {
  isLight?: boolean;
  enableRipples?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  speed: number; // pixels per second
  maxRadius: number;
  intensity: number;
}

export function RippleDotMatrix({
  isLight = false,
  enableRipples = true,
}: RippleDotMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const SPACING = 24; // Distance between dots in px
    const ripples: Ripple[] = [];
    let lastAutoSpawn = 0;
    const AUTO_SPAWN_INTERVAL = 2200; // New ripple every 2.2 seconds

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Click on canvas to spawn interactive water ripple only if enabled
    const handleClick = (e: MouseEvent) => {
      if (!enableRipples) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxRadius = Math.hypot(
        Math.max(x, width - x),
        Math.max(y, height - y)
      );

      ripples.push({
        x,
        y,
        startTime: performance.now(),
        speed: 240,
        maxRadius,
        intensity: 1.2,
      });

      // Keep ripples array clean
      if (ripples.length > 8) ripples.shift();
    };

    if (enableRipples) {
      window.addEventListener("click", handleClick);
    }

    const render = (time: number) => {
      // Auto-spawn loading ripple from center only if enabled
      if (enableRipples && time - lastAutoSpawn > AUTO_SPAWN_INTERVAL) {
        lastAutoSpawn = time;
        const cx = width / 2;
        const cy = height * 0.42; // Center-biased towards the lobby cards
        const maxRadius = Math.hypot(width, height) * 0.85;

        ripples.push({
          x: cx,
          y: cy,
          startTime: time,
          speed: 210, // smooth water ripple propagation
          maxRadius,
          intensity: 1.0,
        });

        // Prune older ripples
        if (ripples.length > 8) ripples.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Remove completed ripples
      if (enableRipples) {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const elapsed = (time - ripples[i].startTime) / 1000;
          const currentRadius = elapsed * ripples[i].speed;
          if (currentRadius > ripples[i].maxRadius + 150) {
            ripples.splice(i, 1);
          }
        }
      }

      // Pre-compute active ripple values for the current frame
      const activeWavefronts = enableRipples
        ? ripples.map((r) => {
            const elapsed = (time - r.startTime) / 1000;
            const currentRadius = elapsed * r.speed;
            const fade = Math.max(0, 1 - currentRadius / r.maxRadius);
            return {
              x: r.x,
              y: r.y,
              radius: currentRadius,
              fade: Math.pow(fade, 1.2) * r.intensity,
              bandwidth: 140, // Width of the brightening wave crest
            };
          })
        : [];

      // 1. Draw subtle fluid water wave rings on the background
      for (const wave of activeWavefronts) {
        if (wave.radius > 5 && wave.fade > 0.02) {
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          const ringAlpha = (isLight ? 0.06 : 0.09) * wave.fade;
          ctx.strokeStyle = isLight
            ? `rgba(0, 0, 0, ${ringAlpha})`
            : `rgba(255, 255, 255, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Subtle secondary echo ring
          if (wave.radius > 30) {
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, Math.max(0, wave.radius - 22), 0, Math.PI * 2);
            ctx.strokeStyle = isLight
              ? `rgba(0, 0, 0, ${ringAlpha * 0.4})`
              : `rgba(255, 255, 255, ${ringAlpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 2. Draw the Dot Matrix with ripple-modulated brightness & size
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const offsetX = (width % SPACING) / 2;
      const offsetY = (height % SPACING) / 2;

      const baseOpacity = isLight ? 0.12 : 0.16;
      const peakBoost = isLight ? 0.55 : 0.82;
      const baseRadius = 1.0;
      const peakRadiusBoost = isLight ? 0.55 : 0.85;

      for (let r = 0; r < rows; r++) {
        const y = r * SPACING + offsetY;
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + offsetX;

          // Compute brightening factor from all active waves
          let totalWaveFactor = 0;

          if (enableRipples && activeWavefronts.length > 0) {
            for (let i = 0; i < activeWavefronts.length; i++) {
              const wave = activeWavefronts[i];
              const dist = Math.hypot(x - wave.x, y - wave.y);
              const distFromCrest = Math.abs(dist - wave.radius);

              if (distFromCrest < wave.bandwidth) {
                // Smooth cosine bell-curve for water ripple wave crest
                const bell = Math.cos((distFromCrest / wave.bandwidth) * (Math.PI / 2));
                totalWaveFactor += Math.pow(bell, 2) * wave.fade;
              }
            }
          }

          const boost = Math.min(1.0, totalWaveFactor);
          const opacity = baseOpacity + boost * peakBoost;
          const radius = baseRadius + boost * peakRadiusBoost;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = isLight
            ? `rgba(0, 0, 0, ${opacity})`
            : `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();

          // Subtle glow halo for heavily brightened dots
          if (boost > 0.5 && !isLight) {
            ctx.beginPath();
            ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(boost - 0.5) * 0.25})`;
            ctx.fill();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (enableRipples) {
        window.removeEventListener("click", handleClick);
      }
    };
  }, [isLight, enableRipples]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ transform: "translateZ(0)" }}
    />
  );
}

export default RippleDotMatrix;
