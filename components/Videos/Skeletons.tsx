import { ImportHeaderSkeleton } from "@/components/Import/Skeletons";

// components/Videos/Skeletons.tsx
import React from "react";

export function VideosHeaderSkeleton() {
  // Same header as the other pages (light breadcrumb bar + blue title area)
  return <ImportHeaderSkeleton extra="none" />;
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