import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Always read published content from Sanity's edge cache (apicdn.sanity.io): it is closer and
  // faster than the main API, so slow connections (e.g. "Connect Timeout Error") happen far less.
  // CDN on the live site (fast, cached). On your own computer (npm run dev) the main API is used:
  // the same address the Studio uses, which is often more reliable on local networks.
  useCdn: process.env.NODE_ENV === "production",
  perspective: 'published',
  // Retry a failed request (network hiccup) a few times before giving up.
  maxRetries: 3,
  retryDelay: (attempt: number) => attempt * 500,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: Image) {
  return builder.image(source)
}
