// components/Photos/PhotoCard.tsx
"use client";
import React from "react";

export type PhotoItem = {
  _key?: string;
  title?: string | null;
  image?: string | null; // URL string
  order?: number | null;
  slug?: string | null;
};

export default function PhotoCard({ item, onOpen }: { item: PhotoItem; onOpen?: (i: PhotoItem) => void }) {
  const imgUrl = typeof item.image === "string" ? item.image : null;

  const titleStyle: React.CSSProperties = {
    minHeight: "2.6rem", // approximately two lines
    lineHeight: "1.25rem",
    display: "block",
    overflow: "hidden",
  };

  return (
    <article className="w-full">
      <div
        className="bg-white rounded-md overflow-hidden shadow-sm group transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg"
        style={{ willChange: "transform" }}
      >
        <button
          onClick={() => onOpen?.(item)}
          className="block w-full text-left focus:outline-none cursor-pointer"
          aria-label={`Open ${item.title ?? "photo"}`}
          style={{ display: "block" }}
        >
          {/* Image: width fits card, height auto */}
          <div className="w-full bg-gray-100 flex items-center justify-center">
            {imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgUrl}
                alt={item.title ?? "photo"}
                className="w-full h-auto object-contain"
                style={{ display: "block" }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-gray-400">No image</div>
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