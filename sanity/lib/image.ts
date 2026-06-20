// sanity/lib/image.ts
import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from "../env"; // adjust path if your env file is elsewhere

const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

/**
 * getImageUrl(source, opts)
 * - source: Sanity image object (pass the image value from your Sanity doc)
 * - opts.w: width in px to request (defaults to 1600)
 * - opts.q: quality 1-100 (defaults to 80)
 * - opts.fit: 'max' | 'crop' | 'fill' (defaults to 'max')
 *
 * Returns a fully-qualified URL string or null when source is falsy.
 */
export function getImageUrl(
  source: SanityImageSource | undefined | null,
  opts: { w?: number; q?: number; fit?: "max" | "crop" | "fill" } = {}
): string | null {
  if (!source) return null;

  const width = opts.w ?? 1600;
  const q = opts.q ?? 80;
  const fit = opts.fit ?? "max";

  let img = builder.image(source).auto("format").quality(q);

  // apply fit and width
  if (fit) img = img.fit(fit);
  if (width) img = img.width(width);

  return img.url();
}
