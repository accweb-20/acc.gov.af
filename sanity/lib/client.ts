// sanity/lib/client.ts
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "9je2ylkk";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

if (!projectId) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Sanity CDN URLs may fail.");
}

/**
 * Primary Sanity client (unique name to avoid collisions).
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

/**
 * Compatibility alias: keep `client` export for other files that still import it.
 * This avoids build errors while you migrate imports to `sanityClient`.
 */
export const client = sanityClient;

const builder = imageUrlBuilder(sanityClient);

/**
 * getSanityImageUrl
 * Safe helper that returns a full image URL (string) or null.
 * Accepts:
 *  - a string (full URL or assetRef like "image-...-png")
 *  - a Sanity image object like { asset: { _ref: 'image-...' } } or { asset: { _id: '...' } }
 *
 * Returns `string | null`.
 */
export function getSanityImageUrl(
  source?: string | { asset?: { _ref?: string; _id?: string } } | null,
  opts?: { width?: number; height?: number }
): string | null {
  if (!source) return null;

  if (typeof source === "string") {
    if (source.startsWith("http://") || source.startsWith("https://")) return source;
    try {
      return builder.image({ asset: { _ref: source } }).width(opts?.width ?? 100).height(opts?.height ?? 100).url();
    } catch {
      return null;
    }
  }

  const assetRef = (source as any)?.asset?._ref ?? (source as any)?.asset?._id ?? undefined;
  if (assetRef) {
    try {
      return builder.image({ asset: { _ref: assetRef } }).width(opts?.width ?? 100).height(opts?.height ?? 100).url();
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Compatibility alias: keep `getImageUrl` for older imports.
 * Recommended long-term: update imports to use getSanityImageUrl.
 */
export const getImageUrl = getSanityImageUrl;
