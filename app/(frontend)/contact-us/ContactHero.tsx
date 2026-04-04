"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

type PointerState = { x: string; y: string };

/**
 * ContactHero — pointer spotlight + visible background text & shapes.
 * Shapes now render on desktop/tablet/mobile with smaller sizes & shorter motion on smaller screens.
 *
 * Fixes hydration mismatch by:
 * - Not rendering motion shapes on the server / initial client render (mounted gating)
 * - Avoiding `window` reads during first render
 */

const ContactHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ px: number; py: number }>({ px: 50, py: 50 });
  const targetRef = useRef<{ tx: number; ty: number }>({ tx: 50, ty: 50 });
  const [pointer, setPointer] = useState<PointerState>({ x: "50%", y: "50%" });

  // --- mounted guard to avoid SSR/CSR markup mismatch ---
  const [mounted, setMounted] = useState(false);

  // --- breakpoint detection for responsive motion sizes/destinations ---
  function getBp(width: number) {
    if (width >= 1024) return "desktop";
    if (width >= 768) return "tablet";
    return "mobile";
  }
  // start conservative (do NOT read window at first render)
  const [breakpoint, setBreakpoint] = useState<string>("mobile");

  useEffect(() => {
    // mark mounted after hydration — shapes won't be rendered during SSR or first render
    setMounted(true);

    // now it's safe to read window
    if (typeof window === "undefined") return;

    const handleResize = () => setBreakpoint(getBp(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth the pointer updates with an rAF loop
  useEffect(() => {
    const tick = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const { tx, ty } = targetRef.current;
      lastPosRef.current.px += (tx - lastPosRef.current.px) * 0.18;
      lastPosRef.current.py += (ty - lastPosRef.current.py) * 0.18;

      setPointer({ x: `${lastPosRef.current.px}%`, y: `${lastPosRef.current.py}%` });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // pointer handler writes target coords only (fast)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    targetRef.current = { tx: Math.max(0, Math.min(100, x)), ty: Math.max(0, Math.min(100, y)) };
  };

  const handlePointerLeave = () => {
    targetRef.current = { tx: 50, ty: 50 };
  };

  // compute numeric parallax offsets (safer than CSS calc with percentages)
  const px = Math.max(0, Math.min(100, parseFloat(pointer.x)));
  const py = Math.max(0, Math.min(100, parseFloat(pointer.y)));
  const bgTranslateX = -(px / 8); // subtle opposite-direction parallax
  const bgTranslateY = -(py / 18);

  const bgTextTransform = {
    transform: `translate(${bgTranslateX}%, ${bgTranslateY}%)`,
  } as React.CSSProperties;

  // --- shapes configuration (responsive variants) ---
  const shapes = [
    {
      // big orange glow
      key: "orange",
      position: { left: "5%", top: "16%" },
      bg: "radial-gradient(circle at 30% 30%, rgb(245, 100, 3), rgba(245, 124, 3, 0.4) 60%, rgba(245, 124, 3,0.1) 72%)",
      variants: {
        desktop: {
          size: 260,
          animate: { x: [0, 1200, -90, 0], y: [0, -100, 360, 10], rotate: [0, 8, -6, 0] },
          transition: { duration: 80, ease: "easeInOut" },
          opacity: 1,
        },
        tablet: {
          size: 180,
          animate: { x: [0, 600, -45, 0], y: [0, -50, 180, 5], rotate: [0, 6, -4, 0] },
          transition: { duration: 52, ease: "easeInOut" },
          opacity: 0.95,
        },
        mobile: {
          size: 120,
          animate: { x: [0, 200, -30, 0], y: [0, -30, 90, 5], rotate: [0, 4, -3, 0] },
          transition: { duration: 30, ease: "easeInOut" },
          opacity: 0.9,
        },
      },
    },

    {
      // top-right pale glow
      key: "pale-top-right",
      position: { right: "10%", top: "10%" },
      bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.24), rgba(255,255,255,0.06) 60%, rgba(255,255,255,0) 72%)",
      variants: {
        desktop: {
          size: 130,
          animate: { x: [0, -230, -190, 0], y: [0, 10, -24, 0], rotate: [0, 8, -6, 0] },
          transition: { duration: 30, ease: "easeInOut" },
          opacity: 1,
        },
        tablet: {
          size: 90,
          animate: { x: [0, -120, -95, 0], y: [0, 6, -12, 0], rotate: [0, 6, -4, 0] },
          transition: { duration: 23, ease: "easeInOut" },
          opacity: 0.95,
        },
        mobile: {
          size: 64,
          animate: { x: [0, -60, -45, 0], y: [0, 4, -8, 0], rotate: [0, 4, -3, 0] },
          transition: { duration: 18, ease: "easeInOut" },
          opacity: 0.9,
        },
      },
    },

    {
      // left-lower pale
      key: "pale-left-bottom",
      position: { left: "10%", top: "70%" },
      bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.24), rgba(255,255,255,0.06) 60%, rgba(255,255,255,0) 72%)",
      variants: {
        desktop: {
          size: 100,
          animate: { x: [0, 410, -70, 0], y: [0, 130, -90, 0], rotate: [0, 8, -6, 0] },
          transition: { duration: 30, ease: "easeInOut" },
          opacity: 1,
        },
        tablet: {
          size: 72,
          animate: { x: [0, 200, -35, 0], y: [0, 60, -45, 0], rotate: [0, 6, -4, 0] },
          transition: { duration: 20, ease: "easeInOut" },
          opacity: 0.95,
        },
        mobile: {
          size: 56,
          animate: { x: [0, 90, -25, 0], y: [0, 30, -20, 0], rotate: [0, 4, -3, 0] },
          transition: { duration: 19, ease: "easeInOut" },
          opacity: 0.9,
        },
      },
    },

    {
      // right-lower highlight
      key: "right-highlight",
      position: { right: "20%", top: "45%" },
      bg: "radial-gradient(circle at 60% 60%, rgba(255,255,255,0.9), rgba(255,255,255,0.24) 40%, rgba(0,0,0,0.1) 70%)",
      variants: {
        desktop: {
          size: 80,
          animate: { x: [0, -800, 400, 0], y: [0, 540, -300, 0], rotate: [0, -10, 8, 0] },
          transition: { duration: 35, ease: "easeInOut" },
          opacity: 1,
        },
        tablet: {
          size: 60,
          animate: { x: [0, -800, 400, 0], y: [0, 540, -300, 0], rotate: [0, -8, 6, 0] },
          transition: { duration: 50, ease: "easeInOut" },
          opacity: 0.95,
        },
        mobile: {
          size: 44,
          animate: { x: [0, -800, 400, 0], y: [0, 540, -300, 0], rotate: [0, -6, 4, 0] },
          transition: { duration: 140, ease: "easeInOut" },
          opacity: 0.9,
        },
      },
    },
  ];

  function pickVariant(shape: any) {
    return shape.variants[breakpoint] || shape.variants.desktop;
  }

  return (
    <section className="w-full">
      <div className="mx-auto">
        <div
          ref={heroRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative overflow-hidden rounded-2xl"
          style={{ minHeight: 520, backgroundColor: "#02587B" }}
        >
          {/* decorative shapes (behind overlays & behind big text) */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{ zIndex: 8 }}
          >
            {/* don't render shapes during SSR / first render to avoid hydration mismatch */}
            {mounted &&
              shapes.map((s) => {
                const v = pickVariant(s);
                const size = v.size;
                const style: React.CSSProperties = {
                  width: size,
                  height: size,
                  ...s.position,
                  opacity: v.opacity,
                  background: s.bg,
                  willChange: "transform, opacity",
                  position: "absolute",
                  borderRadius: "9999px",
                };
                return (
                  <motion.div
                    key={s.key}
                    aria-hidden
                    style={style}
                    animate={v.animate}
                    transition={{ ...v.transition, repeat: Infinity, repeatType: "reverse" }}
                  />
                );
              })}
          </div>

          {/* subtle noise + vignette texture */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 12,
              background:
                "radial-gradient(1200px 600px at 50% 30%, rgba(255,255,255,0.02), rgba(0,0,0,0.03)), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))",
              mixBlendMode: "overlay",
              filter: "blur(3px)",
            }}
          />

          {/* Color spread overlay with spotlight mask (reduced strength so text is readable) */}
          <div
            className="absolute inset-0 pointer-events-none transition-[mask-image,-webkit-mask-image] duration-150"
            style={{
              zIndex: 14,
              backgroundImage:
                `radial-gradient(circle at 20% 50%, rgba(255,211,0,0.12) 0%, rgba(255,211,0,0.04) 18%, rgba(255,211,0,0) 40%), ` +
                `radial-gradient(circle at 80% 50%, rgba(255,211,0,0.10) 0%, rgba(255,211,0,0.03) 20%, rgba(255,211,0,0) 44%), ` +
                `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.015) 45%, rgba(0,0,0,0) 80%)`,
              backgroundBlendMode: "screen, screen, normal",
              WebkitMaskImage: `radial-gradient(circle 220px at ${pointer.x} ${pointer.y}, rgba(0,0,0,0), rgba(0,0,0,0.55) 54%, rgba(0,0,0,1) 100%)`,
              maskImage: `radial-gradient(circle 220px at ${pointer.x} ${pointer.y}, rgba(0,0,0,0), rgba(0,0,0,0.55) 54%, rgba(0,0,0,1) 100%)`,
              filter: "blur(8px)",
              opacity: 0.95,
            }}
          />

          {/* white translucent overlay that also gets masked so spotlight reveals brighter content */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 15,
              background: "rgba(255,255,255,0.045)",
              WebkitMaskImage: `radial-gradient(circle 200px at ${pointer.x} ${pointer.y}, rgba(0,0,0,0), rgba(0,0,0,0.75) 60%, rgba(0,0,0,1) 100%)`,
              maskImage: `radial-gradient(circle 200px at ${pointer.x} ${pointer.y}, rgba(0,0,0,0), rgba(0,0,0,0.75) 60%, rgba(0,0,0,1) 100%)`,
              transition: "mask-image 0.12s linear, -webkit-mask-image 0.12s linear",
            }}
          />

          {/* large background text (now above overlays for clarity) */}
          <h1
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-getronde text-[90px] md:text-[130px] lg:text-[210px] lg:pt-16 select-none whitespace-nowrap pointer-events-none"
            style={{
              color: "rgba(255,255,255,0.98)",
              fontSize: "clamp(, 12vw, 180px)",
              lineHeight: 1,
              opacity: 1,
              letterSpacing: "0.02em",
              zIndex: 22,
              WebkitTextStroke: "0.9px rgba(0,0,0,0.36)",
              textShadow: "0 10px 40px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)",
              mixBlendMode: "normal",
              ...bgTextTransform,
              transition: "transform 120ms linear",
              transformStyle: "preserve-3d",
            }}
          >
            CONTACT <br /> US
          </h1>

          {/* Reduced-motion helpers */}
          <style>{`
            @media (prefers-reduced-motion: reduce) {
              .motion-reduce, .motion-reduce * { animation: none !important; transition: none !important; }
            }

            @media (hover: none) and (pointer: coarse) {
              .absolute.inset-0.pointer-events-none[style] {
                -webkit-mask-image: radial-gradient(circle 120px at 20% 30%, rgba(0,0,0,0.0), rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                mask-image: radial-gradient(circle 120px at 20% 30%, rgba(0,0,0,0.0), rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%);
                animation: mobileSpot 9s ease-in-out infinite;
              }

              @keyframes mobileSpot {
                0% { -webkit-mask-position: 20% 30%; mask-position: 20% 30%; }
                33% { -webkit-mask-position: 80% 30%; mask-position: 80% 30%; }
                66% { -webkit-mask-position: 50% 70%; mask-position: 50% 70%; }
                100% { -webkit-mask-position: 20% 30%; mask-position: 20% 30%; }
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
