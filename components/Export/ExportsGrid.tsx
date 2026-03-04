// components/Export/ExportsGrid.tsx
"use client";

import React from "react";
import ExportCard, { ExportItem } from "./ExportCard";
import { ExportsGridSkeleton } from "./Skeletons";

type RawExport = Record<string, unknown> | ExportItem;

export default function ExportsGrid({
  exportsArr,
  loading = false,
  skeletonCount = 6,
}: {
  exportsArr: Array<RawExport>;
  loading?: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return <ExportsGridSkeleton count={skeletonCount} />;
  }

  const sorted = Array.isArray(exportsArr)
    ? [...exportsArr].sort((a, b) => {
        const aa = typeof (a as ExportItem).order === "number" ? (a as ExportItem).order! : 9999;
        const bb = typeof (b as ExportItem).order === "number" ? (b as ExportItem).order! : 9999;
        return aa - bb;
      })
    : [];

  function normalize(raw: RawExport): ExportItem {
    const rec = raw as Record<string, unknown>;
    const imageVal = rec.image as string | Record<string, unknown> | undefined;
    const orderVal =
      typeof rec.order === "number"
        ? (rec.order as number)
        : typeof rec.order === "string" && !Number.isNaN(Number(rec.order))
        ? Number(rec.order)
        : undefined;

    const normalized: ExportItem = {
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
    <section id="exports" className="w-full mx-auto mt-10 text-[#1A1A1A] bg-white">
      <div className="flex justify-center">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1440px]">
          <h2 className="text-[45px] md:text-[60px] leading-none font-extrabold tracking-wide text-[#1A1A1A] mb-6">
            EXPORT ITEMS
          </h2>

          {sorted.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-600">No export items found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 md:gap-x-6 lg:gap-x-8">
              {sorted.map((it, idx) => {
                const normalized = normalize(it);
                const rawKey = (it as Record<string, unknown>)["_key"];
                const keyStr =
                  typeof rawKey === "string" && rawKey.length > 0 ? rawKey : normalized.slug ?? String(idx);
                return (
                  <div key={keyStr} className="">
                    <ExportCard item={normalized} />
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