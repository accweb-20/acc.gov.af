// components/Videos/Skeletons.tsx
// Loading placeholders for the Videos page (same layout as the real page).
import { ImportHeaderSkeleton } from "@/components/Import/Skeletons";

export function VideosHeaderSkeleton() {
  return <ImportHeaderSkeleton extra="none" />;
}

export function VideosGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="w-full bg-mist py-12 md:py-16">
      <div className="mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="h-3 w-20 animate-pulse bg-tint-strong" />
            <div className="mt-3 h-10 w-44 animate-pulse bg-tint-strong" />
          </div>
          <div className="h-11 w-full animate-pulse bg-paper sm:w-72" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="border border-brand-line/10 bg-paper">
              <div className="aspect-video animate-pulse bg-tint" />
              <div className="m-5 h-5 w-2/3 animate-pulse bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
