// app/publication/photos/loading.tsx
import React from "react";
import { PhotosHeaderSkeleton, PhotosIntroSkeleton, PhotosGridSkeleton, PhotosBodySkeleton } from "@/components/Photos/Skeletons";

export default function Loading() {
  return (
    <main>
      <PhotosHeaderSkeleton />
      <PhotosIntroSkeleton />
      <PhotosGridSkeleton />
      <PhotosBodySkeleton />
    </main>
  );
}