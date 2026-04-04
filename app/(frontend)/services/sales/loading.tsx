// app/sales/loading.tsx
import React from "react";
import {
  SalesHeaderSkeleton,
  SalesIntroSkeleton,
  SalesGridSkeleton,
  SalesBodySkeleton,
} from "@/components/Sales/Skeletons";

export default function Loading() {
  return (
    <main>
      <SalesHeaderSkeleton />

      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
        <SalesIntroSkeleton />

        <SalesGridSkeleton count={6} />

        <SalesBodySkeleton />
      </div>
    </main>
  );
}