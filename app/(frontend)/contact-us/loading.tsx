// Shown instantly while the page loads (CSS only, no data).
import { TextPageSkeleton } from "@/components/Import/Skeletons";

export default function Loading() {
  return <TextPageSkeleton sections={1} form />;
}
