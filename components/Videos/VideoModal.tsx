// components/Videos/VideoModal.tsx
"use client";
import React, { useEffect, useRef } from "react";

export default function VideoModal({
  item,
  onClose,
  onPrev,
  onNext,
  isFirst,
  isLast,
  titleCentered = false,
}: {
  item: { title?: string | null; video?: string | null; poster?: string | null };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  titleCentered?: boolean;
}) {
  if (!item) return null;
  const vUrl = typeof item.video === "string" ? item.video : null;
  const poster = typeof item.poster === "string" ? item.poster : undefined;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeBtnRef.current?.focus(), 50);

    // try autoplay muted
    try {
      videoRef.current?.play().catch(() => {});
    } catch {}

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      try { videoRef.current?.pause(); } catch {}
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={() => { try { videoRef.current?.pause(); } catch {} onClose(); }} aria-hidden />

      <div className="relative z-[1001] max-w-[96vw] max-h-[96vh] w-full">
        <div className="bg-black rounded shadow-2xl overflow-hidden relative">
          {/* Close */}
          <button
            ref={closeBtnRef}
            onClick={() => { try { videoRef.current?.pause(); } catch {} onClose(); }}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 bg-white/10 hover:bg-white/20 p-2 rounded focus:outline-none"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev / Next */}
          <button
            onClick={() => { try { videoRef.current?.pause(); } catch {} onPrev(); }}
            disabled={isFirst}
            aria-label="Previous"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded bg-white/10 hover:bg-white/20 focus:outline-none ${isFirst ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <button
            onClick={() => { try { videoRef.current?.pause(); } catch {} onNext(); }}
            disabled={isLast}
            aria-label="Next"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded bg-white/10 hover:bg-white/20 focus:outline-none ${isLast ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <div className="w-full h-[70vh] sm:h-[78vh] lg:h-[84vh] flex items-center justify-center relative">
            {vUrl ? (
              <video ref={videoRef} src={vUrl} controls poster={poster ?? undefined} className="max-w-full max-h-full" />
            ) : (
              <div className="text-white">No video</div>
            )}

            
          </div>

          {!titleCentered && (
            <div className="p-4 bg-neutral-900/60 text-white">
              <h3 className="text-lg font-semibold text-center">{item.title ?? "\u00A0"}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}