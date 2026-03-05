// app/export/loading.tsx
import React from "react";
import {
  ExportHeaderSkeleton,
  ExportIntroSkeleton,
  ExportsGridSkeleton,
  ExportBodySkeleton,
} from "@/components/Export/Skeletons";

export default function Loading() {
  return (
    <main>
      <ExportHeaderSkeleton />

      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
        <ExportIntroSkeleton />

        <ExportsGridSkeleton count={6} />

        <ExportBodySkeleton />
      </div>
    </main>
  );
}