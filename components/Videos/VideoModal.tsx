// components/Videos/VideoModal.tsx
// Full screen player: title, counter, previous / next and the video (same look as the photo viewer).
"use client";
import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function VideoModal({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: { title?: string | null; video?: string | null; poster?: string | null };
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const vUrl = typeof item.video === "string" ? item.video : null;
  const arrow = "absolute top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center bg-white/10 text-white transition hover:bg-[#F4BA00] hover:text-[#1A1A1A] disabled:pointer-events-none disabled:opacity-25";

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title ?? "Video"} className="fixed inset-0 z-[1000] flex flex-col bg-[#0B1F29]/95 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="min-w-0">
          <span className="text-[13px] font-bold tracking-[0.14em] text-[#F4BA00]">
            {String(index + 1).padStart(2, "0")} <span className="text-white/45">/ {String(total).padStart(2, "0")}</span>
          </span>
          <h3 className="truncate text-[17px] font-semibold md:text-[20px]">{item.title ?? ""}</h3>
        </div>
        <button ref={closeBtnRef} onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center bg-white/10 transition hover:bg-[#F4BA00] hover:text-[#1A1A1A]">
          <X size={22} />
        </button>
      </div>

      {/* Video */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {total > 1 && (
          <button onClick={onPrev} disabled={isFirst} aria-label="Previous video" className={`${arrow} left-2 md:left-6`}>
            <ChevronLeft size={26} />
          </button>
        )}
        {vUrl ? (
          // key: restart the player when moving to another video
          <video key={vUrl} src={vUrl} poster={item.poster ?? undefined} controls autoPlay playsInline className="max-h-full max-w-full bg-black shadow-[0_30px_80px_rgba(0,0,0,0.5)]" />
        ) : (
          <div className="text-white/60">No video</div>
        )}
        {total > 1 && (
          <button onClick={onNext} disabled={isLast} aria-label="Next video" className={`${arrow} right-2 md:right-6`}>
            <ChevronRight size={26} />
          </button>
        )}
      </div>
    </div>
  );
}
