import { ImportHeaderSkeleton } from "@/components/Import/Skeletons";

// components/Photos/Skeletons.tsx
import React from "react";

export function PhotosHeaderSkeleton() {
  // Same header as the other pages (light breadcrumb bar + blue title area)
  return <ImportHeaderSkeleton extra="none" />;
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

export function PhotosGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="w-full bg-mist py-12 md:py-16">
      <div className="mx-auto w-[90%] max-w-[1140px] md:w-[93%] lg:w-[90%]">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="h-3 w-20 animate-pulse bg-tint-strong" />
            <div className="mt-3 h-10 w-44 animate-pulse bg-tint-strong" />
          </div>
          <div className="h-11 w-full animate-pulse bg-paper sm:w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse border border-brand-line/10 bg-paper" />
          ))}
        </div>
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