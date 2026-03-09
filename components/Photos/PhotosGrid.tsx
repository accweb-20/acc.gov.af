// components/Photos/PhotosGrid.tsx
"use client";
import React, { useMemo, useState } from "react";
import PhotoCard, { PhotoItem } from "./PhotoCard";
import PhotoModal from "./PhotoModal";
import { PhotosGridSkeleton } from "./Skeletons";

type Raw = Record<string, unknown> | PhotoItem;

export default function PhotosGrid({
  photosArr,
  loading = false,
  skeletonCount = 9,
  initialPageSize = 10,
}: {
  photosArr: Raw[];
  loading?: boolean;
  skeletonCount?: number;
  initialPageSize?: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(1);

  if (loading) return <PhotosGridSkeleton count={skeletonCount} />;

  // normalize + sort full list once
  const fullSorted = useMemo(() => {
    const arr = Array.isArray(photosArr) ? [...photosArr] : [];
    const mapped: PhotoItem[] = arr.map((rec: Raw, idx) => {
      const r = rec as Record<string, unknown>;
      return {
        _key: typeof r._key === "string" ? (r._key as string) : `i-${idx}`,
        title: typeof r.title === "string" ? (r.title as string) : undefined,
        image: typeof r.image === "string" ? (r.image as string) : undefined,
        order: typeof r.order === "number" ? (r.order as number) : undefined,
        slug: typeof r.slug === "string" ? (r.slug as string) : undefined,
      };
    });
    mapped.sort((a, b) => {
      const aa = typeof a.order === "number" ? a.order! : 9999;
      const bb = typeof b.order === "number" ? b.order! : 9999;
      return aa - bb;
    });
    return mapped;
  }, [photosArr]);

  const total = fullSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // clamp page
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return fullSorted.slice(start, start + pageSize);
  }, [fullSorted, page, pageSize]);

  function openAtGlobalIndex(globalIndex: number) {
    setSelectedIndex(globalIndex);
  }

  function onCardOpen(item: PhotoItem) {
    // find global index
    const idx = fullSorted.findIndex((p) => p._key === item._key || p.slug === item.slug);
    if (idx >= 0) openAtGlobalIndex(idx);
  }

  function goPrev() {
    if (selectedIndex === null) return;
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  }
  function goNext() {
    if (selectedIndex === null) return;
    if (selectedIndex < fullSorted.length - 1) setSelectedIndex(selectedIndex + 1);
  }

  // pagination controls helper: show neighbors with ellipsis
  function getPageRange(current: number, last: number, delta = 2) {
    const range: (number | "..." )[] = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(last, current + delta);

    if (left > 1) {
      range.push(1);
      if (left > 2) range.push("...");
    }

    for (let i = left; i <= right; i++) range.push(i);

    if (right < last) {
      if (right < last - 1) range.push("...");
      range.push(last);
    }
    return range;
  }

  return (
    <section className="w-full mx-auto mt-10 text-[#1A1A1A] bg-white">
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide">PHOTOS</h2>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {total === 0 ? (
          <div className="py-8 text-center text-sm text-gray-600">No photos found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pagedItems.map((item) => {
                const globalIdx = fullSorted.findIndex((p) => p._key === item._key || p.slug === item.slug);
                return (
                  <div key={item._key ?? item.slug ?? String(globalIdx)}>
                    <PhotoCard item={item} onOpen={() => openAtGlobalIndex(globalIdx)} />
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`px-3 py-2 rounded border ${page <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
                >
                  Prev
                </button>

                <nav aria-label="Pages" className="flex items-center gap-1">
                  {getPageRange(page, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} className="px-2">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(Number(p))}
                        aria-current={p === page ? "page" : undefined}
                        className={`px-3 py-2 rounded border ${p === page ? "bg-[#02587B] text-white" : "hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </nav>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={`px-3 py-2 rounded border ${page >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
                >
                  Next
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Showing <strong>{(page - 1) * pageSize + 1}</strong>–<strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal (slider) */}
      {selectedIndex !== null && selectedIndex >= 0 && selectedIndex < fullSorted.length && (
        <PhotoModal
          item={fullSorted[selectedIndex]}
          onClose={() => setSelectedIndex(null)}
          onPrev={goPrev}
          onNext={goNext}
          isFirst={selectedIndex === 0}
          isLast={selectedIndex === fullSorted.length - 1}
          titleCentered
        />
      )}
    </section>
  );
}