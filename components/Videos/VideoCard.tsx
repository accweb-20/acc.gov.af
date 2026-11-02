// components/Videos/VideoCard.tsx
// One video tile: 16:9 cover (poster or first frame), play button, title below.
"use client";
import React from "react";
import { Play } from "lucide-react";

export type VideoItem = {
  _key?: string;
  title?: string | null;
  video?: string | null; // URL string
  poster?: string | null; // URL string
  order?: number | null;
  slug?: string | null;
};

export default function VideoCard({ item, onOpen }: { item: VideoItem; onOpen?: (i: VideoItem) => void }) {
  const vUrl = typeof item.video === "string" ? item.video : null;
  const poster = typeof item.poster === "string" ? item.poster : null;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      aria-label={`Play ${item.title ?? "video"}`}
      className="group flex h-full w-full flex-col border border-brand-line/10 bg-paper text-left shadow-[0_6px_18px_rgba(2,88,123,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(2,88,123,0.18)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4BA00]"
    >
      <span className="relative block aspect-video w-full overflow-hidden bg-[#0B1F29]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster.includes("cdn.sanity.io") ? `${poster}?w=640&auto=format` : poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : vUrl ? (
          <video src={`${vUrl}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm text-white/50">No video</span>
        )}
        {/* soft shade + play button */}
        <span className="absolute inset-0 bg-gradient-to-t from-[#013F59]/40 to-transparent transition group-hover:from-[#013F59]/25" />
        <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center bg-[#F4BA00] text-[#1A1A1A] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition duration-300 group-hover:scale-110">
          <Play size={22} fill="currentColor" className="ml-0.5" />
        </span>
      </span>
      <span className="flex flex-1 items-start gap-3 p-4 md:p-5">
        <span className="mt-1.5 h-[3px] w-6 shrink-0 bg-[#F4BA00] transition-all duration-300 group-hover:w-10" />
        <span className="line-clamp-2 text-[16px] font-bold leading-snug text-ink transition group-hover:text-brand-fg md:text-[17px]">{item.title ?? ""}</span>
      </span>
    </button>
  );
}
