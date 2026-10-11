
// components/Import/Skeletons.tsx

import React from "react";

/**
 * Page header skeleton
 * Matches the updated PageHeader:
 * - No hero image
 * - No website navigation or logo
 * - Breadcrumb / pagination trail
 * - Large page title
 * - Short supporting message
 */
export function ImportHeaderSkeleton() {
  return (
    <header className="w-full">
      <section className="flex min-h-[320px] w-full items-center justify-center bg-[#02587B] text-center md:min-h-[388px]">
        <div className="mx-auto flex w-full max-w-[1252px] flex-col items-center  mt-14 md:mt-20 px-5 py-14 sm:px-8 md:py-16">
          {/* Breadcrumb / pagination skeleton */}

          <div
            className="flex items-center justify-center gap-2"
            aria-hidden="true"
          >
            <div className="h-3 w-12 rounded-sm bg-white/30 animate-pulse sm:w-14" />

            <div className="h-3 w-2 rounded-sm bg-white/20 animate-pulse" />

            <div className="h-3 w-24 rounded-sm bg-white/30 animate-pulse sm:w-28" />
          </div>

          {/* Main page title skeleton */}

          <div
            className="mt-8 h-[46px] w-[75%] max-w-[500px] rounded-sm bg-white/20 animate-pulse sm:h-[52px] md:mt-7 md:h-[52px]"
            aria-hidden="true"
          />

          {/* Short supporting message skeleton */}

          <div
            className="mt-8 flex w-full max-w-5xl flex-col items-center gap-3 md:mt-10"
            aria-hidden="true"
          >
            <div className="h-4 w-[92%] rounded-sm bg-white/15 animate-pulse sm:h-5 sm:w-[78%]" />

            <div className="h-4 w-[65%] rounded-sm bg-white/15 animate-pulse sm:h-5 sm:w-[48%]" />
          </div>
        </div>
      </section>
    </header>
  );
}

export function ImportIntroSkeleton() {
  return (
    <section className="mx-auto mt-8 w-full">
      <div className="mx-auto w-[90%] max-w-[924px] md:w-[93%] lg:w-[90%]">
        <div className="mb-6">
          <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </section>
  );
}

export function ImportCardSkeleton() {
  return (
    <article className="flex w-full justify-center text-[#1A1A1A]">
      <div
        className="group relative flex w-full max-w-[360px] flex-col items-start"
        style={{ maxWidth: 360 }}
      >
        <div
          className="relative z-20 mx-auto overflow-hidden"
          style={{
            width: "88%",
            height: 220,
            transform: "translateY(26px)",
            background: "#f5f5f5",
            borderRadius: 0,
          }}
        >
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        </div>

        <div
          className="relative z-10 w-full pt-6"
          style={{
            marginTop: -26,
            padding: "60px 18px 14px 18px",
            background: "#02587B",
          }}
        >
          <div className="mb-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-3 w-5/6 animate-pulse rounded bg-white/10" />
          </div>

          <div
            className="flex w-full items-center justify-between"
            style={{ gap: 12 }}
          >
            <div className="h-8 w-36 animate-pulse rounded bg-yellow-400" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Grid of import card skeletons.
 */
export function ImportsGridSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  const items = Array.from({ length: count });

  return (
    <section
      id="imports"
      className="mx-auto mt-6 w-full bg-white text-[#1A1A1A]"
    >
      <div className="flex justify-center">
        <div className="mx-auto w-[90%] max-w-[1440px] md:w-[93%] lg:w-[90%]">
          <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            {items.map((_, index) => (
              <div key={index}>
                <ImportCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ImportBodySkeleton() {
  return (
    <section className="mx-auto w-full py-12">
      <div className="mx-auto w-[90%] max-w-[1140px] md:w-[93%] lg:w-[90%]">
        <div className="max-w-[920px]">
          <div className="mb-6 h-8 w-1/3 animate-pulse rounded bg-gray-200" />

          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
