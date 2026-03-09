// app/publication/photos/loading.tsx
import React from "react";
import { PhotosHeaderSkeleton, PhotosIntroSkeleton, PhotosGridSkeleton, PhotosBodySkeleton } from "@/components/Photos/Skeletons";

export default function Loading() {
  return (
    <main>
      <PhotosHeaderSkeleton />
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1440px]">
        <PhotosIntroSkeleton />
        <PhotosGridSkeleton count={9} />
        <PhotosBodySkeleton />
      </div>
    </main>
  );
}