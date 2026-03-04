// app/import/loading.tsx
import React from "react";
import {
  ImportHeaderSkeleton,
  ImportIntroSkeleton,
  ImportsGridSkeleton,
  ImportBodySkeleton,
} from "@/components/Import/Skeletons";

export default function Loading() {
  return (
    <main>
      <ImportHeaderSkeleton />

      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
        <ImportIntroSkeleton />

        {/* grid skeleton (6 placeholders by default) */}
        <ImportsGridSkeleton count={6} />

        <ImportBodySkeleton />
      </div>
    </main>
  );
}