// components/Photos/PhotoModal.tsx
// Full screen viewer: big photo, title, counter, previous / next and a strip of thumbnails.
"use client";
import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { sized, type PhotoItem } from "./PhotoCard";

export default function PhotoModal({
  items,
  index,
  onClose,
  onGo,
}: {
  items: PhotoItem[];
  index: number;
  onClose: () => void;
  onGo: (i: number) => void;
}) {
  const item = items[index];
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);
  const isFirst = index === 0;
  const isLast = index === items.length - 1;
  const prev = () => !isFirst && onGo(index - 1);
  const next = () => !isLast && onGo(index + 1);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onGo(index - 1);
      if (e.key === "ArrowRight" && index < items.length - 1) onGo(index + 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onGo]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // keep the active thumbnail visible
  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  if (!item) return null;
  const imgUrl = typeof item.image === "string" ? item.image : null;
  const arrow = "absolute top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center bg-white/10 text-white transition hover:bg-[#F4BA00] hover:text-[#1A1A1A] disabled:pointer-events-none disabled:opacity-25";

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title ?? "Photo"} className="fixed inset-0 z-[1000] flex flex-col bg-[#0B1F29]/95 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="min-w-0">
          <span className="text-[13px] font-bold tracking-[0.14em] text-[#F4BA00]">
            {String(index + 1).padStart(2, "0")} <span className="text-white/45">/ {String(items.length).padStart(2, "0")}</span>
          </span>
          <h3 className="truncate text-[17px] font-semibold md:text-[20px]">{item.title ?? ""}</h3>
        </div>
        <button ref={closeBtnRef} onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center bg-white/10 transition hover:bg-[#F4BA00] hover:text-[#1A1A1A]">
          <X size={22} />
        </button>
      </div>

      {/* Photo */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const d = e.changedTouches[0].clientX - touchX.current;
          if (d > 50) prev();
          if (d < -50) next();
          touchX.current = null;
        }}
      >
        <button onClick={prev} disabled={isFirst} aria-label="Previous photo" className={`${arrow} left-2 md:left-6`}>
          <ChevronLeft size={26} />
        </button>
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item._key} src={sized(imgUrl, 1600)} alt={item.title ?? "photo"} className="max-h-full max-w-full bg-paper object-contain p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-4" />
        ) : (
          <div className="text-white/60">No image</div>
        )}
        <button onClick={next} disabled={isLast} aria-label="Next photo" className={`${arrow} right-2 md:right-6`}>
          <ChevronRight size={26} />
        </button>
      </div>

      {/* Thumbnails */}
      <div ref={stripRef} className="flex gap-2 overflow-x-auto px-4 py-3 md:px-8">
        {items.map((p, i) => (
          <button
            key={p._key ?? i}
            data-i={i}
            onClick={() => onGo(i)}
            aria-label={`Show ${p.title ?? "photo"}`}
            className={`relative h-14 w-[74px] shrink-0 overflow-hidden bg-paper transition md:h-16 md:w-[86px] ${
              i === index ? "ring-[3px] ring-[#F4BA00]" : "opacity-50 hover:opacity-100"
            }`}
          >
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(p.image, 160)} alt="" loading="lazy" className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
