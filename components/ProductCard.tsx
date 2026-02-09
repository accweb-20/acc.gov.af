// components/ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";

type ProductCardProps = {
  id: string;
  name?: string | null;
  price?: string | number | null;
  imageUrl?: string | null;
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
        // little shadow to four sides (soft)
        boxShadow: "0 6px 16px rgba(7,15,25,0.06)",
      }}
    >

      {/* image */
      /* make image wrapper transform on group hover */ }
      <div
        className="overflow-hidden rounded-none"
        style={{ /* ensure no radius */ }}
      >
        <div className="relative w-full aspect-[4/3]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={ name ?? "Product image"}
              fill
              className="object-cover object-center rounded-none transform transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

        {/* name and properties in #02587b and bold */}
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
