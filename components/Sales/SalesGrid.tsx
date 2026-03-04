// components/Sales/SalesGrid.tsx
"use client";

import React from "react";
import SalesCard, { SalesItem } from "./SalesCard";
import { SalesGridSkeleton } from "./Skeletons";

type RawSale = Record<string, unknown> | SalesItem;

export default function SalesGrid({
  salesArr,
  loading = false,
  skeletonCount = 6,
}: {
  salesArr: Array<RawSale>;
  loading?: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return <SalesGridSkeleton count={skeletonCount} />;
  }

  const sorted = Array.isArray(salesArr)
    ? [...salesArr].sort((a, b) => {
        const aa = typeof (a as SalesItem).order === "number" ? (a as SalesItem).order! : 9999;
        const bb = typeof (b as SalesItem).order === "number" ? (b as SalesItem).order! : 9999;
        return aa - bb;
      })
    : [];

  function normalize(raw: RawSale): SalesItem {
    const rec = raw as Record<string, unknown>;
    const imageVal = rec.image as string | Record<string, unknown> | undefined;
    const orderVal =
      typeof rec.order === "number"
        ? (rec.order as number)
        : typeof rec.order === "string" && !Number.isNaN(Number(rec.order))
        ? Number(rec.order)
        : undefined;

    const normalized: SalesItem = {
      _key: typeof rec._key === "string" ? rec._key : undefined,
      title: typeof rec.title === "string" ? rec.title : undefined,
      description: Array.isArray(rec.description) ? (rec.description as unknown as any[]) : undefined,
      image: typeof imageVal === "string" || typeof imageVal === "object" ? imageVal : undefined,
      order: typeof orderVal === "number" ? orderVal : undefined,
      slug: typeof rec.slug === "string" ? rec.slug : undefined,
      category: rec.category ?? undefined,
    };
    return normalized;
  }

  return (
    <section id="sales" className="w-full mx-auto mt-10 text-[#1A1A1A] bg-white">
      <div className="flex justify-center">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1440px]">
          <h2 className="text-[45px] md:text-[60px] leading-none font-extrabold tracking-wide text-[#1A1A1A] mb-6">
            SALES ITEMS
          </h2>

          {sorted.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-600">No sales items found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 md:gap-x-6 lg:gap-x-8">
              {sorted.map((it, idx) => {
                const normalized = normalize(it);
                const rawKey = (it as Record<string, unknown>)["_key"];
                const keyStr =
                  typeof rawKey === "string" && rawKey.length > 0 ? rawKey : normalized.slug ?? String(idx);
                return (
                  <div key={keyStr} className="">
                    <SalesCard item={normalized} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}