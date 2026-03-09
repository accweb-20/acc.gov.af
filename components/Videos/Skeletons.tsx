// components/Videos/Skeletons.tsx
import React from "react";

export function VideosHeaderSkeleton() {
  return (
    <header className="relative w-full" style={{ marginTop: 64 }}>
      <div className="overflow-hidden mx-auto w-[90%] md:w-[93%] lg:w-[70%] max-w-[1440px]">
        <div className="relative w-full h-[230px] md:h-[360px] lg:h-[320px] rounded-sm overflow-hidden bg-gray-200 animate-pulse" />
      </div>
      <div style={{ backgroundColor: "#02587B" }} className="w-full mx-auto text-center flex flex-col justify-end px-4 min-h-[280px] -mt-[120px] md:-mt-[240px]">
        <div className="my-6 mx-auto w-[90%] max-w-[1440px] py-7 md:py-8">
          <div className="text-[#F5F5F5]">
            <div className="h-12 w-3/4 mx-auto bg-white/20 rounded-sm animate-pulse" />
            <div className="mt-4 h-4 w-1/2 mx-auto bg-white/10 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function VideosIntroSkeleton() {
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

export function VideosGridSkeleton({ count = 9 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <section className="w-full mx-auto mt-6">
      <div className="mx-auto w-[90%] max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-gray-100 rounded animate-pulse" style={{ paddingTop: "56.25%" }} />
        ))}
      </div>
    </section>
  );
}

export function VideosBodySkeleton() {
  return (
    <section className="w-full mx-auto py-12">
      <div className="mx-auto w-[90%] max-w-[1140px]">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-6" />
      </div>
    </section>
  );
}