// components/Photos/PhotoModal.tsx
"use client";
import React, { useEffect, useRef } from "react";

export default function PhotoModal({
  item,
  onClose,
  onPrev,
  onNext,
  isFirst,
  isLast,
  titleCentered = false,
}: {
  item: { title?: string | null; image?: string | null };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  titleCentered?: boolean;
}) {
  if (!item) return null;
  const imgUrl = typeof item.image === "string" ? item.image : null;
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
    // focus close button for accessibility
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />

      {/* content */}
      <div className="relative z-[1001] max-w-[96vw] max-h-[96vh] w-full">
        <div className="bg-black rounded shadow-2xl overflow-hidden relative">
          {/* Close icon top-right */}
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 bg-white/10 hover:bg-white/20 p-2 rounded focus:outline-none"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev / Next buttons */}
          <button
            onClick={onPrev}
            disabled={isFirst}
            aria-label="Previous"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded bg-white/10 hover:bg-white/20 focus:outline-none ${isFirst ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <button
            onClick={onNext}
            disabled={isLast}
            aria-label="Next"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded bg-white/10 hover:bg-white/20 focus:outline-none ${isLast ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* media container */}
          <div className="w-full h-[78vh] sm:h-[84vh] flex items-center justify-center relative">
            {imgUrl ? (
              <img src={imgUrl} alt={item.title ?? "photo"} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-white">No image</div>
            )}

           
          </div>

          {/* bottom area (also show title again for assistive) */}
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