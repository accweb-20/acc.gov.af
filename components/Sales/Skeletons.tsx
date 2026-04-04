// components/Sales/Skeletons.tsx
import React from "react";

export function SalesHeaderSkeleton() {
  return (
    <header className="relative w-full" style={{ marginTop: 64 }}>
      <div className="overflow-hidden mx-auto w-[90%] md:w-[93%] lg:w-[70%] max-w-[1440px]">
        <div className="relative w-full h-[230px] md:h-[360px] lg:h-[320px] rounded-sm overflow-hidden bg-gray-200 animate-pulse" />
      </div>

      <div
        style={{ backgroundColor: "#02587B" }}
        className="w-full mx-auto text-center flex flex-col justify-end px-4 min-h-[280px] md:min-h-[420px] lg:min-h-[420px] -mt-[120px] md:-mt-[240px] lg:-mt-[240px]"
      >
        <div className="my-6 mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px] py-7 md:py-8">
          <div className="text-[#F5F5F5]">
            <div className="h-[48px] md:h-[80px] lg:h-[56px] w-3/4 mx-auto bg-white/20 rounded-sm animate-pulse" />
            <div className="mt-4 h-4 w-1/2 mx-auto bg-white/10 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SalesIntroSkeleton() {
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

export function SalesCardSkeleton() {
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

export function SalesGridSkeleton({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <section id="sales" className="w-full mx-auto mt-6 text-[#1A1A1A] bg-white">
      <div className="flex justify-center">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 md:gap-x-6 lg:gap-x-8">
            {items.map((_, i) => (
              <div key={i}>
                <SalesCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SalesBodySkeleton() {
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