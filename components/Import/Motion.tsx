// components/Import/Motion.tsx
// Small client helpers used by the Imports pages and the home page.
//   <Reveal>      fades and slides content in when it scrolls into view.
//                 Content that is already on screen when the page loads is shown
//                 immediately (no waiting for JavaScript → fast first paint).
//   <CountUp>     counts a number up from 0 once, when it becomes visible
//   <ViewScope>   remembers the List / Gallery choice and exposes it as data-view
//   <ViewToggle>  the two small icon buttons that switch List / Gallery
"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { LayoutGrid, LayoutList } from "lucide-react";

// Time of the last browser Back / Forward. Pages reached that way are shown
// straight away, without the reveal animation (the visitor has already seen them).
let lastHistoryNav = 0;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastHistoryNav = Date.now();
  });
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * "ssr"   → rendered visible (server HTML / first paint)
 * "wait"  → below the fold: hidden until it scrolls into view
 * "shown" → animated in
 */
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [phase, setPhase] = useState<"ssr" | "wait" | "shown">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    // Came back with the browser Back / Forward button → no animation
    if (Date.now() - lastHistoryNav < 3000) return;
    // Already visible on load → leave it alone
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setPhase("wait");
    let timer = 0;
    const show = () => {
      setPhase("shown");
      stop();
    };
    // Also check the position directly, in case the observer misses a scroll jump.
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight + 80) show();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) show();
      },
      // Start a little before the element reaches the screen, so it is already in place when seen
      { threshold: 0, rootMargin: "0px 0px 80px 0px" }
    );
    const events = ["scroll", "resize", "popstate", "pageshow"] as const;
    function stop() {
      io.disconnect();
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, check));
    }
    io.observe(el);
    events.forEach((e) => window.addEventListener(e, check, { passive: true }));
    requestAnimationFrame(check);
    timer = window.setTimeout(check, 400);
    return stop;
  }, []);

  return { ref, phase };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  from = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "up" | "left" | "right" | "zoom";
}) {
  const { ref, phase } = useRevealOnScroll<HTMLDivElement>();
  const hidden = {
    up: "translate-y-4",
    left: "-translate-x-4",
    right: "translate-x-4",
    zoom: "scale-[0.98]",
  }[from];

  // No transform class at all unless animating: a transform on a parent would trap
  // position:fixed children (like the full-screen image viewer).
  const motion =
    phase === "wait"
      ? `opacity-0 ${hidden} transition-all duration-300 ease-out`
      : phase === "shown"
        ? "opacity-100 transition-all duration-300 ease-out"
        : "";

  return (
    <div
      ref={ref}
      // short stagger only (max 0.12s) so rows appear together
      style={phase === "shown" && delay ? { transitionDelay: `${Math.min(delay, 360) / 3}ms` } : undefined}
      className={`${motion} ${className}`}
    >
      {children}
    </div>
  );
}

export function CountUp({ value, duration = 1000 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(value); // the real number is in the HTML (SEO, no-JS)

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || value <= 0 || typeof IntersectionObserver === "undefined") return;
    if (Date.now() - lastHistoryNav < 3000) return; // Back / Forward → show the number at once
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * value)); // ease-out
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* List / Gallery view                                                 */
/* ------------------------------------------------------------------ */

/**
 * "auto" (until the visitor chooses): gallery on phones, list on larger screens.
 * Cards read the value through Tailwind `group-data-[view=…]/view:` classes,
 * so the server HTML stays the same and nothing re-renders on the server.
 */
export type ViewMode = "auto" | "list" | "grid";

const ViewContext = createContext<{ view: ViewMode; setView: (v: ViewMode) => void; autoAs: "responsive" | "grid" } | null>(null);

export function ViewScope({
  children,
  storageKey = "acc-imports-view",
  autoAs = "responsive",
  className = "",
}: {
  children: ReactNode;
  storageKey?: string;
  /** what "auto" looks like: responsive (gallery on phones, list on larger screens) or always gallery */
  autoAs?: "responsive" | "grid";
  className?: string;
}) {
  const [view, setViewState] = useState<ViewMode>("auto");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "list" || saved === "grid") setViewState(saved);
    } catch {
      /* private mode – keep default */
    }
  }, [storageKey]);

  const setView = (v: ViewMode) => {
    setViewState(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {
      /* ignore */
    }
  };

  return (
    <ViewContext.Provider value={{ view, setView, autoAs }}>
      <div data-view={view} className={`group/view ${className}`}>
        {children}
      </div>
    </ViewContext.Provider>
  );
}

export function ViewToggle({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  const ctx = useContext(ViewContext);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 575px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!ctx) return null;
  const effective = ctx.view !== "auto" ? ctx.view : ctx.autoAs === "grid" || !wide ? "grid" : "list";

  const btn = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center border transition duration-200 ${
      active
        ? "border-brand-line bg-brand text-white"
        : onDark
          ? "border-white/30 bg-transparent text-white hover:border-white"
          : "border-brand-line/20 bg-paper text-brand-fg hover:border-brand-line"
    }`;

  return (
    <div role="group" aria-label="Change layout" className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => ctx.setView("list")}
        aria-pressed={effective === "list"}
        aria-label="List view"
        title="List view"
        className={btn(effective === "list")}
      >
        <LayoutList size={17} />
      </button>
      <button
        type="button"
        onClick={() => ctx.setView("grid")}
        aria-pressed={effective === "grid"}
        aria-label="Gallery view"
        title="Gallery view"
        className={btn(effective === "grid")}
      >
        <LayoutGrid size={17} />
      </button>
    </div>
  );
}
