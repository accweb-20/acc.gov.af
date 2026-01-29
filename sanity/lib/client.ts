// sanity/lib/client.ts
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

if (!projectId) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Sanity CDN URLs may fail.");
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

/**
 * getImageUrl
 * Safe helper that returns a full image URL (string) or null.
 *
 * Accepts:
 * - a string that can be a full URL or an assetRef ("image-...-png")
 * - a Sanity image object like { asset: { _ref: 'image-...' } } or { asset: { _id: '...' } }
 *
 * Returns `string | null`.
 */
export function getImageUrl(
  source?: string | { asset?: { _ref?: string; _id?: string } } | null,
  opts?: { width?: number; height?: number }
): string | null {
  if (!source) return null;

  // If it's already a full URL, return as is
  if (typeof source === "string") {
    if (source.startsWith("http://") || source.startsWith("https://")) {
      return source;
    }
    // assume it's an assetRef like "image-<id>-png"
    try {
      return builder.image({ asset: { _ref: source } }).width(opts?.width ?? 100).height(opts?.height ?? 100).url();
    } catch {
      return null;
    }
  }

  // If it's an object, attempt to read asset._ref or asset._id
  const assetRef = source.asset?._ref ?? source.asset?._id ?? undefined;
  if (assetRef) {
    try {
      return builder.image({ asset: { _ref: assetRef } }).width(opts?.width ?? 100).height(opts?.height ?? 100).url();
    } catch {
      return null;
    }
  }

  return null;
}
