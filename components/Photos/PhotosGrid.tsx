// components/Photos/PhotosGrid.tsx
// Photo gallery: search, equal tiles, pages and a full screen viewer.
"use client";
import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PhotoCard, { PhotoItem } from "./PhotoCard";
import PhotoModal from "./PhotoModal";

type Raw = Record<string, unknown> | PhotoItem;
const PAGE_SIZE = 24;

function pageRange(current: number, last: number) {
  const range: (number | "...")[] = [];
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || Math.abs(i - current) <= 1) range.push(i);
    else if (range[range.length - 1] !== "...") range.push("...");
  }
  return range;
}

export default function PhotosGrid({ photosArr }: { photosArr: Raw[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // normalize + sort once
  const all = useMemo(() => {
    const mapped: PhotoItem[] = (Array.isArray(photosArr) ? photosArr : []).map((rec, idx) => {
      const r = rec as Record<string, unknown>;
      return {
        _key: typeof r._key === "string" ? r._key : `i-${idx}`,
        title: typeof r.title === "string" ? r.title : undefined,
        image: typeof r.image === "string" ? r.image : undefined,
        order: typeof r.order === "number" ? r.order : undefined,
        slug: typeof r.slug === "string" ? r.slug : undefined,
      };
    });
    return mapped.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }, [photosArr]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? all.filter((p) => (p.title ?? "").toLowerCase().includes(q)) : all;
  }, [all, search]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const paged = list.slice(start, start + PAGE_SIZE);

  function goPage(p: number) {
    setPage(p);
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const btn = "grid h-10 min-w-10 place-items-center border px-3 text-[15px] font-semibold transition";

  return (
    <section id="gallery" className="w-full scroll-mt-24 bg-mist py-12 text-ink md:py-16">
      <div className="mx-auto w-[90%] max-w-[1140px] md:w-[93%] lg:w-[90%]">
        {/* Heading + search */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-brand-fg">Gallery</span>
            <h2 className="mt-1 text-[34px] font-extrabold leading-none md:text-[48px]">Photos</h2>
            <span className="mt-3 block h-1 w-16 bg-[#F4BA00]" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-[14px] text-ink/60">
              {list.length} {list.length === 1 ? "photo" : "photos"}
            </span>
            <label className="flex h-11 w-full items-center gap-2 border border-brand-line/20 bg-paper px-3 focus-within:border-brand-line sm:w-72">
              <Search size={17} className="text-brand-fg" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search photos"
                aria-label="Search photos"
                className="h-full w-full bg-transparent text-[15px] outline-none"
              />
            </label>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="border border-dashed border-brand-line/25 bg-paper py-16 text-center text-[15px] text-ink/60">No photos found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {paged.map((item, i) => (
                <PhotoCard key={item._key} item={item} onOpen={() => setSelectedIndex(start + i)} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button onClick={() => goPage(current - 1)} disabled={current <= 1} className={`${btn} border-brand-line/20 bg-paper hover:border-brand-line disabled:opacity-40`}>
                  Prev
                </button>
                {pageRange(current, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="px-1 text-ink/50">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      aria-current={p === current ? "page" : undefined}
                      className={`${btn} ${p === current ? "border-brand-line bg-brand text-white" : "border-brand-line/20 bg-paper hover:border-brand-line"}`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button onClick={() => goPage(current + 1)} disabled={current >= totalPages} className={`${btn} border-brand-line/20 bg-paper hover:border-brand-line disabled:opacity-40`}>
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {selectedIndex !== null && list[selectedIndex] && (
        <PhotoModal items={list} index={selectedIndex} onClose={() => setSelectedIndex(null)} onGo={setSelectedIndex} />
      )}
    </section>
  );
}
