// components/Import/ImportsGrid.tsx
"use client";

import React from "react";
import ImportCard, { ImportItem } from "./ImportCard";

export default function ImportsGrid({ importsArr }: { importsArr: Array<Record<string, unknown> | ImportItem> }) {
  const sorted = Array.isArray(importsArr)
    ? [...importsArr].sort((a, b) => {
        const aa = typeof (a as ImportItem).order === "number" ? (a as ImportItem).order! : 9999;
        const bb = typeof (b as ImportItem).order === "number" ? (b as ImportItem).order! : 9999;
        return aa - bb;
      })
    : [];

  function normalize(raw: Record<string, unknown> | ImportItem): ImportItem {
    const rec = raw as Record<string, unknown>;
    const imageVal = rec.image as string | Record<string, unknown> | undefined;
    const orderVal =
      typeof rec.order === "number" ? (rec.order as number) : typeof rec.order === "string" && !Number.isNaN(Number(rec.order)) ? Number(rec.order) : undefined;

    const normalized: ImportItem = {
      _key: typeof rec._key === "string" ? rec._key : undefined,
      title: typeof rec.title === "string" ? rec.title : undefined,
      description: Array.isArray(rec.description) ? (rec.description as unknown as any[]) : undefined,
      image: typeof imageVal === "string" || typeof imageVal === "object" ? imageVal : undefined,
      order: typeof orderVal === "number" ? orderVal : undefined,
      slug: typeof rec.slug === "string" ? rec.slug : undefined,
    };
    return normalized;
  }

  return (
    <section id="imports" className="w-full mx-auto mt-10 text-[#1A1A1A] bg-white">
      <div className="flex justify-center">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1440px]">
          <h2 className="text-[30px] md:text-[48px] leading-none font-extrabold tracking-wide text-[#1A1A1A] mb-6">
            IMPORT ITEMS
          </h2>

          {sorted.length === 0 ? (
            <div>No import items found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 md:gap-x-6 lg:gap-x-8">
              {sorted.map((it, idx) => {
                const normalized = normalize(it);
                const rawKey = (it as Record<string, unknown>)["_key"];
                const keyStr = typeof rawKey === "string" && rawKey.length > 0 ? rawKey : String(idx);
                return (
                  <div key={keyStr} className="">
                    <ImportCard item={normalized} />
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