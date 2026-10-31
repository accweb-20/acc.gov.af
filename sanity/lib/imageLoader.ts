// sanity/lib/imageLoader.ts
// next/image loader: Sanity's image CDN resizes every picture to exactly the width
// the browser needs (srcset) and serves WebP/AVIF. Nothing is processed on our server.

export default function sanityImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("https://cdn.sanity.io/")) {
    // Local files (e.g. /images/logo.svg): served as they are
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }
  const url = new URL(src);
  const w = Number(url.searchParams.get("w"));
  const h = Number(url.searchParams.get("h"));
  // Keep the aspect ratio of a cropped image (e.g. 1200×900 → 640×480)
  if (w && h) url.searchParams.set("h", String(Math.round((width * h) / w)));
  url.searchParams.set("w", String(width));
  // Compressed: quality 65 looks the same in WebP/AVIF but files are about 30% smaller
  url.searchParams.set("q", String(Math.min(quality ?? 65, 65)));
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
  return url.toString();
}
