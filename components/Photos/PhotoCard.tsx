// components/Photos/PhotoCard.tsx
// One gallery tile: same size for every photo, title shown on hover (always on phones).
"use client";
import React from "react";
import { Expand } from "lucide-react";

export type PhotoItem = {
  _key?: string;
  title?: string | null;
  image?: string | null; // URL string
  order?: number | null;
  slug?: string | null;
};

/** Smaller Sanity image for tiles and thumbnails. */
export const sized = (url: string, w: number) => (url.includes("cdn.sanity.io") ? `${url}?w=${w}&fit=max&auto=format` : url);

export default function PhotoCard({ item, onOpen }: { item: PhotoItem; onOpen?: (i: PhotoItem) => void }) {
  const imgUrl = typeof item.image === "string" ? item.image : null;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      aria-label={`Open ${item.title ?? "photo"}`}
      className="group relative block aspect-square w-full overflow-hidden border border-brand-line/10 bg-paper text-left shadow-[0_6px_18px_rgba(2,88,123,0.06)] transition hover:shadow-[0_18px_40px_rgba(2,88,123,0.18)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4BA00]"
    >
      {imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sized(imgUrl, 600)}
          alt={item.title ?? "photo"}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-sm text-gray-400">No image</span>
      )}

      {/* Title bar */}
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-[#013F59]/90 via-[#013F59]/60 to-transparent px-3 pb-3 pt-10 text-white transition duration-300 md:translate-y-full md:group-hover:translate-y-0 md:group-focus-visible:translate-y-0">
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug md:text-[15px]">{item.title ?? ""}</span>
        <span className="grid h-8 w-8 shrink-0 place-items-center bg-[#F4BA00] text-[#1A1A1A]">
          <Expand size={15} />
        </span>
      </span>
    </button>
  );
}
