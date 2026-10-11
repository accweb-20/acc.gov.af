// components/Photos/Skeletons.tsx
import React from "react";

export function PhotosHeaderSkeleton() {
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

export function PhotosIntroSkeleton() {
  return (
    <section className="w-full mx-auto mt-8">
      <div className="mx-auto w-[90%] max-w-[924px]">
        <div className="mb-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export function PhotosGridSkeleton({ count = 9 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <section className="w-full mx-auto mt-6">
      <div className="mx-auto w-[90%] max-w-[1440px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-gray-100 rounded animate-pulse" style={{ paddingTop: "75%" }} />
        ))}
      </div>
    </section>
  );
}

export function PhotosBodySkeleton() {
  return (
    <section className="w-full mx-auto py-12">
      <div className="mx-auto w-[90%] max-w-[1140px]">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-6" />
      </div>
    </section>
  );
}