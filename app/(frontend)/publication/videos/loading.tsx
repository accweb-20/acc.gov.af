// app/publication/videos/loading.tsx
import { VideosHeaderSkeleton, VideosGridSkeleton } from "@/components/Videos/Skeletons";

export default function Loading() {
  return (
    <main>
      <VideosHeaderSkeleton />
      <VideosGridSkeleton />
    </main>
  );
}
