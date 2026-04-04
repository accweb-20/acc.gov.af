// components/Videos/VideoCard.tsx
"use client";
import React from "react";

export type VideoItem = {
  _key?: string;
  title?: string | null;
  video?: string | null;  // URL string
  poster?: string | null; // URL string
  order?: number | null;
  slug?: string | null;
};

export default function VideoCard({
  item,
  onOpen,
}: {
  item: VideoItem;
  onOpen?: (i: VideoItem) => void;
}) {
  const vUrl = typeof item.video === "string" ? item.video : null;
  const poster = typeof item.poster === "string" ? item.poster : undefined;

  const titleStyle: React.CSSProperties = {
    minHeight: "2.6rem", // reserve 2 lines
    lineHeight: "1.25rem",
    display: "block",
    overflow: "hidden",
  };

  return (
    <article className="w-full">
      <div
        className="bg-white rounded-md overflow-hidden shadow-sm transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg"
        style={{ willChange: "transform" }}
      >
        <button
          onClick={() => onOpen?.(item)}
          className="block w-full text-left focus:outline-none cursor-pointer"
          aria-label={`Open ${item.title ?? "video"}`}
        >
          {/* Video width fits card, height auto */}
          <div className="w-full bg-black flex items-center justify-center">
            {vUrl ? (
              <video
                src={vUrl}
                poster={poster}
                className="w-full h-auto"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-gray-400 bg-gray-100">
                No video
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-[18px] font-semibold" style={titleStyle}>
              {item.title ?? "\u00A0"}
            </h3>
          </div>
        </button>
      </div>
    </article>
  );
}