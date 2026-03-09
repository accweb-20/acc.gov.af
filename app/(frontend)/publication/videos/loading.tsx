// app/publication/videos/loading.tsx
import React from "react";
import { VideosHeaderSkeleton, VideosIntroSkeleton, VideosGridSkeleton, VideosBodySkeleton } from "@/components/Videos/Skeletons";

export default function Loading() {
  return (
    <main>
      <VideosHeaderSkeleton />
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
        <VideosIntroSkeleton />
        <VideosGridSkeleton count={9} />
        <VideosBodySkeleton />
      </div>
    </main>
  );
}