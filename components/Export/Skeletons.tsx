// components/Export/Skeletons.tsx
import React from "react";

export function ExportHeaderSkeleton() {
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

export function ExportIntroSkeleton() {
  return (
    <section className="w-full mx-auto mt-8">
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[924px]">
        <div className="mb-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-11/12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-10/12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export function ExportCardSkeleton() {
  return (
    <article className="flex justify-center w-full text-[#1A1A1A]">
      <div className="group w-full max-w-[360px] relative flex flex-col items-start" style={{ maxWidth: 360 }}>
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
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        </div>

        <div
          className="relative z-10 pt-6 w-full"
          style={{ marginTop: -26, padding: "60px 18px 14px 18px", background: "#02587B" }}
        >
          <div className="mb-4">
            <div className="h-8 w-3/4 bg-white/20 rounded animate-pulse" />
            <div className="mt-3 h-3 w-5/6 bg-white/10 rounded animate-pulse" />
          </div>

          <div className="w-full flex items-center justify-between" style={{ gap: 12 }}>
            <div className="h-8 w-36 bg-yellow-400 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ExportsGridSkeleton({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <section id="exports" className="w-full mx-auto mt-6 text-[#1A1A1A] bg-white">
      <div className="flex justify-center">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 md:gap-x-6 lg:gap-x-8">
            {items.map((_, i) => (
              <div key={i}>
                <ExportCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExportBodySkeleton() {
  return (
    <section className="w-full mx-auto py-12">
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1140px]">
        <div className="max-w-[920px]">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}