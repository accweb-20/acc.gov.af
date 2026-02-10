// components/ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";

type ProductCardProps = {
  id: string;
  name?: string | null;
  price?: string | number | null;
  imageUrl?: string | null | undefined;
  propertiesText?: string | null;
};

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  propertiesText,
}: ProductCardProps) {
  return (
    <article
      className="group relative bg-white rounded-none"
      style={{
        boxShadow: "0 6px 16px rgba(7,15,25,0.06)",
      }}
    >
      {/* image wrapper */}
      <div className="overflow-hidden rounded-none">
        <div className="relative w-full aspect-[4/3]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name ?? "Product image"}
              fill
              // Use object-cover to fill the card (cropping possible) — since we request large images this shouldn't blur.
              // If you instead want no cropping, change to "object-contain".
              className="object-cover object-center rounded-none transform transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              // quality prop is optional when URL already includes quality; leaving it helps next/image's internal behavior
              quality={80}
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
              No image
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {name && (
          <p className="text-[#02587b] font-bold mb-2 text-[24px]">{name}</p>
        )}

        {propertiesText && (
          <p className="text-[#02587b] font-bold text-sm leading-relaxed">
            {propertiesText} <br />
            Price: <span className="text-[#1A1A1A] text-[26px]">{price}</span>
          </p>
        )}
      </div>
    </article>
  );
}
