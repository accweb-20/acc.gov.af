// Component/Slider.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

/**
 * Type definitions (converted to TS types so React/TS infers correctly)
 */
type Slide = {
  id: string | number;
  desktop_image_url: string;
  mobile_image_url: string;
  link_url?: string | null;
  title?: string | null;
};

type SlideInput = Partial<Slide> & { id?: string | number };

/**
 * Utility type guards
 */
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export default function Slider({ apiPath = "/api/slider" }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState<number>(0);

  // animation state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animFrom, setAnimFrom] = useState<number | null>(null);
  const [animTo, setAnimTo] = useState<number | null>(null);
  const [animDir, setAnimDir] = useState<"next" | "prev">("next");

  // separate center refs per breakpoint to avoid ref collisions
  const centerRefDesktop = useRef<HTMLDivElement | null>(null);
  const centerRefTablet = useRef<HTMLDivElement | null>(null);
  const centerRefMobile = useRef<HTMLDivElement | null>(null);

  const leftPeekRef = useRef<HTMLDivElement | null>(null);
  const rightPeekRef = useRef<HTMLDivElement | null>(null);
  const [peekHeight, setPeekHeight] = useState<number | null>(null);

  const trackRefDesktop = useRef<HTMLDivElement | null>(null);
  const trackRefTablet = useRef<HTMLDivElement | null>(null);
  const trackRefMobile = useRef<HTMLDivElement | null>(null);

  const hoverRef = useRef(false);
  const autoRef = useRef<number | null>(null);
  const SESSION_KEY = "slider:slides";

  // session persistence
  const persistSlides = (arr: Slide[]) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn("sessionStorage persist failed", e);
    }
  };

  // fetch helper
  const fetchSlides = async (): Promise<Slide[]> => {
    try {
      const resp = await fetch(apiPath, { cache: "no-store" });
      if (!resp.ok) {
        console.error("Slide fetch failed", resp.status);
        return [];
      }
      const json: unknown = await resp.json();

      // json may be { slides: [...] } or array directly — handle both safely
      let s: Slide[] = [];

      if (isObject(json)) {
        const maybeSlides = (json as Record<string, unknown>)["slides"];
        if (Array.isArray(maybeSlides)) {
          s = maybeSlides.filter((i) => i != null).map((i) => i as Slide);
        }
      }

      if (Array.isArray(json)) {
        s = (json as unknown[]).filter((i) => i != null).map((i) => i as Slide);
      }

      return s;
    } catch (e) {
      console.error("Failed to fetch slides", e);
      return [];
    }
  };

  // load slides from sessionStorage or API
  useEffect(() => {
    let mounted = true;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setSlides(parsed as Slide[]);
          setIndex(0);
          return () => {
            mounted = false;
          };
        }
      }
    } catch (e) {
      /* fall through to fetch */
    }

    (async () => {
      const s = await fetchSlides();
      if (!mounted) return;
      setSlides(s);
      persistSlides(s);
      if (s.length) setIndex(0);
    })();

    return () => {
      mounted = false;
    };
  }, [apiPath]);

  // admin helpers (unchanged)
  useEffect(() => {
    // attach simple admin hooks for debugging / headless updates
    // @ts-ignore
    window.__sliderCreate = async function (slide: SlideInput) {
      try {
        const res = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slide),
        });
        const payload: unknown = await res.json();
        // payload may contain inserted array or single object with id
        setSlides((prev) => {
          let inserted: Slide[] = [];
          if (isObject(payload) && Array.isArray((payload as Record<string, unknown>)["inserted"])) {
            inserted = ((payload as Record<string, unknown>)["inserted"] as unknown[]).map((p) => p as Slide);
          } else if (isObject(payload) && "id" in (payload as Record<string, unknown>)) {
            inserted = [payload as Slide];
          }
          const updated = [...prev, ...inserted];
          persistSlides(updated);
          return updated;
        });
        return payload;
      } catch (e) {
        console.error("create failed", e);
        throw e;
      }
    };

    // @ts-ignore
    window.__sliderUpdate = async function (slide: SlideInput) {
      if (!slide || !("id" in slide)) {
        console.warn("slide.id required for update");
        return null;
      }
      try {
        const res = await fetch(`${apiPath}/${encodeURIComponent(String(slide.id))}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slide),
        });
        const payload: unknown = await res.json();
        setSlides((prev) => {
          const updated = prev.map((s) => (String(s.id) === String(slide.id) ? { ...s, ...(slide as Partial<Slide>) } : s));
          persistSlides(updated);
          return updated;
        });
        return payload;
      } catch (e) {
        console.error("update failed", e);
        throw e;
      }
    };

    // @ts-ignore
    window.__sliderDelete = async function (id: string | number) {
      if (!id) {
        console.warn("id required for delete");
        return null;
      }
      try {
        const res = await fetch(`${apiPath}/${encodeURIComponent(String(id))}`, { method: "DELETE" });
        const payload: unknown = await res.json();
        setSlides((prev) => {
          const updated = prev.filter((s) => String(s.id) !== String(id));
          persistSlides(updated);
          const safeIdx = Math.max(0, Math.min(index, Math.max(0, updated.length - 1)));
          setIndex(safeIdx);
          return updated;
        });
        return payload;
      } catch (e) {
        console.error("delete failed", e);
        throw e;
      }
    };

    return () => {
      try {
        // @ts-ignore
        delete window.__sliderCreate;
        // @ts-ignore
        delete window.__sliderUpdate;
        // @ts-ignore
        delete window.__sliderDelete;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, index]);

  // -----------------------
  // NEW: measure all center refs and pick the visible one
  // -----------------------
  useEffect(() => {
    // refs to check
    const centerEls = [centerRefDesktop.current, centerRefTablet.current, centerRefMobile.current].filter(Boolean);

    if (!centerEls.length) return;

    let roInstances: ResizeObserver[] = [];
    let listeners: Array<{ img: HTMLImageElement; fn: () => void }> = [];

    const isVisible = (el: HTMLElement) => {
      try {
        const style = window.getComputedStyle(el);
        // visible if not display:none and has non-zero height and is in document
        return style && style.display !== "none" && el.offsetHeight > 0 && document.body.contains(el);
      } catch {
        return false;
      }
    };

    const updatePeekFromVisible = () => {
      // find the first visible center element (there should be only one visible due to breakpoints)
      for (const el of [centerRefDesktop.current, centerRefTablet.current, centerRefMobile.current]) {
        if (!el) continue;
        if (isVisible(el)) {
          const h = Math.round(el.getBoundingClientRect().height);
          if (h && h !== peekHeight) setPeekHeight(h);
          return;
        }
      }
      // fallback: if none visible, leave peekHeight unchanged
    };

    // Create observers for each center element present
    [centerRefDesktop.current, centerRefTablet.current, centerRefMobile.current].forEach((el) => {
      if (!el) return;
      try {
        const ro = new ResizeObserver(() => {
          updatePeekFromVisible();
        });
        ro.observe(el);
        roInstances.push(ro);

        // attach image load listeners inside this center element
        const imgs = Array.from(el.querySelectorAll("img"));
        imgs.forEach((img) => {
          const fn = () => updatePeekFromVisible();
          img.addEventListener("load", fn, { passive: true });
          listeners.push({ img, fn });
        });
      } catch {
        // ignore
      }
    });

    // Listen for window resize and orientationchange as well
    const winHandler = () => updatePeekFromVisible();
    window.addEventListener("resize", winHandler);
    window.addEventListener("orientationchange", winHandler);

    // initial update
    updatePeekFromVisible();

    return () => {
      try {
        roInstances.forEach((r) => r.disconnect());
      } catch {}
      listeners.forEach(({ img, fn }) => {
        try {
          img.removeEventListener("load", fn);
        } catch {}
      });
      window.removeEventListener("resize", winHandler);
      window.removeEventListener("orientationchange", winHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, index, slides.length]);

  // helpers: get active track ref based on current viewport width
  const getActiveTrackRef = () => {
    if (typeof window === "undefined") return trackRefDesktop;
    // mobile: <= 767
    if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) return trackRefMobile;
    // tablet: 768 .. 1023
    if (window.matchMedia && window.matchMedia("(max-width: 1023px)").matches) return trackRefTablet;
    // desktop: 1024+
    return trackRefDesktop;
  };

  // start an animation by setting state (React will render the two-panel track)
  const animateTo = (newIndex: number, dir: "next" | "prev" = "next") => {
    if (isAnimating) return;
    if (!slides.length) return;
    if (newIndex === index) return;

    setAnimFrom(index);
    setAnimTo(newIndex);
    setAnimDir(dir);
    setIsAnimating(true);
  };

  // effect that runs after React renders the track; does the DOM transition smoothly
  useEffect(() => {
    if (!isAnimating || animFrom === null || animTo === null) return;

    const activeTrackRef = getActiveTrackRef();
    const trackEl = activeTrackRef.current;
    if (!trackEl) {
      // fallback: commit immediately
      setIndex(animTo);
      setIsAnimating(false);
      setAnimFrom(null);
      setAnimTo(null);
      setAnimDir("next");
      return;
    }

    // Ensure no previous transition
    trackEl.style.transition = "none";

    // Set initial transform depending on direction.
    if (animDir === "next") {
      trackEl.style.transform = "translateX(0%)";
    } else {
      trackEl.style.transform = "translateX(-100%)";
    }

    // Force reflow so browser registers initial transform
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    trackEl.offsetHeight;

    // Now set the transition and final transform. Use consistent timing + easing.
    const duration = 650; // ms
    const easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
    trackEl.style.transition = `transform ${duration}ms ${easing}`;

    const finalTransform = animDir === "next" ? "translateX(-100%)" : "translateX(0%)";

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName && e.propertyName !== "transform") return;

      trackEl.removeEventListener("transitionend", onEnd as any);
      trackEl.style.transition = "none";
      trackEl.style.transform = finalTransform;

      requestAnimationFrame(() => {
        setIndex(animTo);
        setIsAnimating(false);
        setAnimFrom(null);
        setAnimTo(null);
        setAnimDir("next");

        requestAnimationFrame(() => {
          [trackRefDesktop.current, trackRefTablet.current, trackRefMobile.current].forEach((el) => {
            if (el) {
              (el as HTMLElement).style.transition = "";
              (el as HTMLElement).style.transform = "";
            }
          });
        });
      });
    };
    trackEl.addEventListener("transitionend", onEnd as unknown as EventListener);

    requestAnimationFrame(() => {
      trackEl.style.transform = finalTransform;
    });

    const fallbackTimer = window.setTimeout(() => {
      if (isAnimating) {
        try {
          trackEl.removeEventListener("transitionend", onEnd as any);
        } catch {}
        [trackRefDesktop.current, trackRefTablet.current, trackRefMobile.current].forEach((el) => {
          if (el) {
            (el as HTMLElement).style.transition = "none";
            (el as HTMLElement).style.transform = "none";
          }
        });
        setIndex(animTo);
        setIsAnimating(false);
        setAnimFrom(null);
        setAnimTo(null);
        setAnimDir("next");
      }
    }, duration + 1200);

    return () => clearTimeout(fallbackTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, animFrom, animTo, animDir]);

  // wrappers
  const prev = () => {
    if (isAnimating) return;
    const newIndex = (index - 1 + slides.length) % slides.length;
    animateTo(newIndex, "prev");
  };
  const next = () => {
    if (isAnimating) return;
    const newIndex = (index + 1) % slides.length;
    animateTo(newIndex, "next");
  };

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, index, isAnimating]);

  // auto slide every 5s; pause when hovered
  useEffect(() => {
    const startAuto = () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
      autoRef.current = window.setInterval(() => {
        if (!hoverRef.current && !isAnimating) {
          const newIndex = (index + 1) % slides.length;
          animateTo(newIndex, "next");
        }
      }, 5000);
    };
    startAuto();
    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
    };
  }, [slides.length, index, isAnimating]);

  // hover handlers
  const onMouseEnter = () => {
    hoverRef.current = true;
  };
  const onMouseLeave = () => {
    hoverRef.current = false;
  };

  // small circle peek button style (desktop default)
  const circleBtn: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    zIndex: 30,
  };

  if (!slides.length) {
    // placeholder when no slides — skeleton with circular peeks inside
    return (
      <section
        className="slider-root w-full flex justify-center items-center mt-18 relative font-rubik"
        aria-roledescription="carousel"
        style={{ paddingTop: 0 }}
      >
        <style>{`
          /* Simple skeleton shimmer */
          .skeleton {
            background: linear-gradient(90deg, #e6e6e6 0%, #f2f2f2 50%, #e6e6e6 100%);
            background-size: 200% 100%;
            animation: shimmer 1.6s linear infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .skeleton-circle {
            background: #d0d0d0;
            border-radius: 9999px;
            opacity: 0.95;
          }
        `}</style>

        {/* Desktop skeleton */}
        <div className="hidden lg:flex items-center justify-center w-full mx-auto px-0 relative" style={{ overflow: "visible" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "calc(100vw)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              height: peekHeight ?? 480,
              overflow: "hidden",
            }}
            className="skeleton"
          >
            {/* skeleton image area */}
            <div style={{ width: "100%", height: "100%" }} aria-hidden />

            {/* left peek circle */}
            <button
              aria-label="Previous slide"
              className="skeleton-circle"
              style={{ ...circleBtn, left: 12, width: 44, height: 44 }}
            >
              ‹
            </button>

            {/* right peek circle */}
            <button
              aria-label="Next slide"
              className="skeleton-circle"
              style={{ ...circleBtn, right: 12, width: 44, height: 44 }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Tablet skeleton */}
        <div className="hidden md:flex lg:hidden w-full justify-center">
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div
              style={{ width: "100%", height: peekHeight ?? 540, position: "relative", overflow: "hidden" }}
              className="skeleton"
              aria-hidden
            >
              <button
                aria-label="Previous slide"
                className="skeleton-circle"
                style={{ ...circleBtn, left: 8, width: 40, height: 40 }}
              >
                ‹
              </button>
              <button
                aria-label="Next slide"
                className="skeleton-circle"
                style={{ ...circleBtn, right: 8, width: 40, height: 40 }}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden w-full flex justify-center">
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div
              style={{ width: "100%", height: peekHeight ?? 620, position: "relative", overflow: "hidden" }}
              className="skeleton"
              aria-hidden
            >
              <button
                aria-label="Previous slide"
                className="skeleton-circle"
                style={{ ...circleBtn, left: 8, width: 36, height: 36 }}
              >
                ‹
              </button>
              <button
                aria-label="Next slide"
                className="skeleton-circle"
                style={{ ...circleBtn, right: 8, width: 36, height: 36 }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const curr = slides[index];
  const fromIdx = animFrom;
  const toIdx = animTo;

  return (
    <section
      className="slider-root w-full flex justify-center items-center mt-16 relative"
      aria-roledescription="carousel"
      style={{ paddingTop: 0 }} // no top padding
    >
      <style>{`
        /* scope ALL image rules to slider-root so header/logo images are NOT affected */
        .slider-root .slider-button { cursor: pointer; }
        .slider-root .peek-box { background: #505050; display:flex; align-items:center; justify-content:center; }
        .slider-root img { user-select:none; -webkit-user-drag: none; -webkit-user-select:none; width:100%; height:auto; display:block; }
      `}</style>

      {/* --------------------
          DESKTOP: lg and up
          -------------------- */}
      <div
        className="hidden lg:flex justify-center w-full items-center relative"
        style={{ overflow: "visible" }}
      >
        <div
          ref={centerRefDesktop}
          style={{
            width: "100%",
            /* fill remaining viewport width between peeks (we keep layout flexible) */
            maxWidth: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            height: "auto",
            overflow: "hidden",
            minHeight: peekHeight ?? 380,
          }}
        >
          {/* left circular peek (overlay inside center) */}
          <button
            aria-label="Previous slide"
            onClick={() => {
              if (!isAnimating) prev();
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={(e) => e.key === "Enter" && prev()}
            style={{ ...circleBtn, left: 12 }}
            className="slider-button"
          >
            ‹
          </button>

          {/* right circular peek (overlay inside center) */}
          <button
            aria-label="Next slide"
            onClick={() => {
              if (!isAnimating) next();
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={(e) => e.key === "Enter" && next()}
            style={{ ...circleBtn, right: 12 }}
            className="slider-button"
          >
            ›
          </button>

          {/* Single view when not animating */}
          {!isAnimating && curr && curr.desktop_image_url ? (
            <img
              key={`single-${index}`}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              src={curr.desktop_image_url}
              alt={curr.title || "slide"}
              style={{
                objectFit: "contain",
              }}
              draggable={false}
            />
          ) : null}

          {/* Animated two-panel track (desktop) */}
          {isAnimating && fromIdx !== null && toIdx !== null ? (
            <div
              ref={trackRefDesktop}
              style={{
                width: "200%",
                display: "flex",
                flexDirection: "row",
                transform: animDir === "next" ? "translateX(0%)" : "translateX(-100%)",
              }}
            >
              {animDir === "next" ? (
                <>
                  {/* from */}
                  <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {slides[fromIdx] && slides[fromIdx].desktop_image_url ? (
                      <img
                        src={slides[fromIdx].desktop_image_url}
                        alt={slides[fromIdx].title || "slide"}
                        style={{ objectFit: "contain" }}
                        draggable={false}
                      />
                    ) : (
                      <div style={{ width: "100%", height: 410, background: "#505050" }} />
                    )}
                  </div>

                  {/* to */}
                  <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {slides[toIdx] && slides[toIdx].desktop_image_url ? (
                      <img
                        src={slides[toIdx].desktop_image_url}
                        alt={slides[toIdx].title || "slide"}
                        style={{ objectFit: "contain" }}
                        draggable={false}
                      />
                    ) : (
                      <div style={{ width: "100%", height: 410, background: "#505050" }} />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* prev: render [to, from] */}
                  <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {slides[toIdx] && slides[toIdx].desktop_image_url ? (
                      <img
                        src={slides[toIdx].desktop_image_url}
                        alt={slides[toIdx].title || "slide"}
                        style={{ objectFit: "contain" }}
                        draggable={false}
                      />
                    ) : (
                      <div style={{ width: "100%", height: 410, background: "#505050" }} />
                    )}
                  </div>

                  <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {slides[fromIdx] && slides[fromIdx].desktop_image_url ? (
                      <img
                        src={slides[fromIdx].desktop_image_url}
                        alt={slides[fromIdx].title || "slide"}
                        style={{ objectFit: "contain" }}
                        draggable={false}
                      />
                    ) : (
                      <div style={{ width: "100%", height: 410, background: "#505050" }} />
                    )}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Purchase Now (left inside center) */}
          <div style={{ position: "absolute", left: 16, bottom: 16 }}>
            <button
              onClick={() => {
                if (window?.__openDonate) window.__openDonate();
              }}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              className="slider-button font-bold text-[#1A1A1A] hidden"
              style={{
                /* keep button visual size in px so it looks the same at normal zoom */
                backgroundColor: "#FFD21B",
                clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
                padding: "12px 20px",
              }}
            >
              Purchase Now
            </button>
          </div>

          {/* Learn More (right inside center) - desktop keeps border as before */}
          <div style={{ position: "absolute", right: 16, bottom: 16 }}>
            {curr.link_url ? (
              <Link
                href={curr.link_url}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="slider-button text-[#F5F5F5] underline"
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  fontWeight: 600,
                  textShadow: "0 2px 14px rgba(0,0,0,0.80)",
                }}
              >
                Learn More
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* --------------------
          TABLET: md .. lg-1 (100% width)
          -------------------- */}
      <div className="hidden md:flex lg:hidden w-full justify-center">
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div
            ref={centerRefTablet}
            style={{
              width: "100%",
              height: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* tablet left circle */}
            <button
              aria-label="Previous slide"
              onClick={() => {
                if (!isAnimating) prev();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && prev()}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{ ...circleBtn, left: 8, width: 40, height: 40 }}
              className="slider-button"
            >
              ‹
            </button>

            {/* tablet right circle */}
            <button
              aria-label="Next slide"
              onClick={() => {
                if (!isAnimating) next();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && next()}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{ ...circleBtn, right: 8, width: 40, height: 40 }}
              className="slider-button"
            >
              ›
            </button>

            {/* Show single when not animating (tablet uses desktop image at full width) */}
            {!isAnimating && curr && curr.desktop_image_url ? (
              <img
                key={`tablet-single-${index}`}
                src={curr.desktop_image_url}
                alt={curr.title || "slide"}
                style={{
                  maxWidth: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
                draggable={false}
              />
            ) : null}

            {/* animated track for tablet */}
            {isAnimating && fromIdx !== null && toIdx !== null ? (
              <div
                ref={trackRefTablet}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "row",
                  transform: animDir === "next" ? "translateX(0%)" : "translateX(-100%)",
                }}
              >
                {animDir === "next" ? (
                  <>
                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[fromIdx] && slides[fromIdx].desktop_image_url ? (
                        <img src={slides[fromIdx].desktop_image_url} alt={slides[fromIdx].title || "slide"} style={{ objectFit: "contain" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>

                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[toIdx] && slides[toIdx].desktop_image_url ? (
                        <img src={slides[toIdx].desktop_image_url} alt={slides[toIdx].title || "slide"} style={{ objectFit: "contain" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[toIdx] && slides[toIdx].desktop_image_url ? (
                        <img src={slides[toIdx].desktop_image_url} alt={slides[toIdx].title || "slide"} style={{ objectFit: "contain" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>

                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[fromIdx] && slides[fromIdx].desktop_image_url ? (
                        <img src={slides[fromIdx].desktop_image_url} alt={slides[fromIdx].title || "slide"} style={{ objectFit: "contain" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Purchase (tablet) */}
            <div style={{ position: "absolute", left: 12, bottom: 14 }}>
              <button
                onClick={() => {
                  if (window?.__openDonate) window.__openDonate();
                }}
                className="slider-button font-bold text-[#1A1A1A] hidden"
                style={{
                  backgroundColor: "#FFD21B",
                  clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
                  padding: "12px 20px",
                }}
              >
                Purchase Now
              </button>
            </div>

            {/* Learn More (tablet): remove border, only underline */}
            <div style={{ position: "absolute", right: 12, bottom: 14 }}>
              {curr.link_url ? (
                <Link
                  href={curr.link_url}
                  className="slider-button text-[#F5F5F5] underline"
                  style={{
                    display: "inline-block",
                    padding: "10px 16px",
                    fontWeight: 600,
                    textShadow: "0 2px 14px rgba(0,0,0,0.80)",
                  }}
                >
                  Learn More
                </Link>
              ) : null}
            </div>
          </div>

          {/* right peek (kept for visual parity but made ABSOLUTE so it doesn't take layout space) */}
          <div
            onClick={() => {
              if (!isAnimating) next();
            }}
            role="button"
            aria-label="Next slide"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && next()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 30,
              height: peekHeight ?? 540,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              visibility: "hidden", // remains visually hidden but won't affect layout
            }}
            className="slider-button"
          >
            <div className="peek-box" style={{ width: "100%", height: "100%", borderRadius: 0 }} aria-hidden>
              <span style={{ fontSize: 20, color: "#fff" }}>›</span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------
          MOBILE: < md (100% width)
          -------------------- */}
      <div className="md:hidden w-full flex justify-center">
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div
            ref={centerRefMobile}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* mobile left circle */}
            <button
              aria-label="Previous slide"
              onClick={() => {
                if (!isAnimating) prev();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && prev()}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{
                ...circleBtn,
                left: 8,
                width: 36,
                height: 36,
              }}
              className="slider-button"
            >
              ‹
            </button>

            {/* mobile right circle */}
            <button
              aria-label="Next slide"
              onClick={() => {
                if (!isAnimating) next();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && next()}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{
                ...circleBtn,
                right: 8,
                width: 36,
                height: 36,
              }}
              className="slider-button"
            >
              ›
            </button>

            {/* Single view when not animating */}
            {!isAnimating && curr && curr.mobile_image_url ? (
              <img
                src={curr.mobile_image_url}
                alt={curr.title || "slide"}
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            ) : !isAnimating && curr && curr.desktop_image_url ? (
              <img
                src={curr.desktop_image_url}
                alt={curr.title || "slide"}
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            ) : null}

            {/* Animated track for mobile when animating */}
            {isAnimating && animFrom !== null && animTo !== null && (
              <div
                ref={trackRefMobile}
                style={{
                  width: "200%",
                  display: "flex",
                  flexDirection: "row",
                  transform: animDir === "next" ? "translateX(0%)" : "translateX(-100%)",
                }}
              >
                {animDir === "next" ? (
                  <>
                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[animFrom] && slides[animFrom].mobile_image_url ? (
                        <img src={slides[animFrom].mobile_image_url} alt={slides[animFrom].title || "slide"} style={{ objectFit: "cover" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>

                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[animTo] && slides[animTo].mobile_image_url ? (
                        <img src={slides[animTo].mobile_image_url} alt={slides[animTo].title || "slide"} style={{ objectFit: "cover" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[animTo] && slides[animTo].mobile_image_url ? (
                        <img src={slides[animTo].mobile_image_url} alt={slides[animTo].title || "slide"} style={{ objectFit: "cover" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>

                    <div style={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {slides[animFrom] && slides[animFrom].mobile_image_url ? (
                        <img src={slides[animFrom].mobile_image_url} alt={slides[animFrom].title || "slide"} style={{ objectFit: "cover" }} draggable={false} />
                      ) : (
                        <div style={{ width: "100%", height: 540, background: "#505050" }} />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Purchase mobile */}
            <div style={{ position: "absolute", left: 8, bottom: 8 }}>
              <button
                onClick={() => {
                  if (window?.__openDonate) window.__openDonate();
                }}
                className="slider-button font-bold text-[#1A1A1A] hidden"
                style={{
                  backgroundColor: "#FFD21B",
                  clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
                  padding: "10px 14px",
                  fontWeight: 700,
                }}
              >
                Purchase Now
              </button>
            </div>

            {/* Learn More mobile: remove border, only underline */}
            <div style={{ position: "absolute", right: 8, bottom: 8 }}>
              {curr.link_url ? (
                <Link
                  href={curr.link_url}
                  className="slider-button text-[#F5F5F5] underline"
                  style={{
                    display: "inline-block",
                    padding: "8px 10px",
                    fontWeight: 600,
                    textShadow: "0 2px 14px rgba(0,0,0,0.80)",
                  }}
                >
                  Learn More
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
