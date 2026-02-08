// src/app/api/slider/route.ts
import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

export const runtime = "nodejs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? "2025-10-05";

if (!projectId || !dataset) {
  console.error("Missing Sanity env vars", { projectIdPresent: !!projectId, datasetPresent: !!dataset });
}

const client = createClient({
  projectId: projectId ?? "",
  dataset: dataset ?? "production",
  apiVersion,
  useCdn: true,
});

/**
 * GROQ requests multiple possible image fields so server-side normalization can pick the first available.
 * Adjust `_type == "slider"` if your document name is different.
 */
const groq = `*[_type == "slider" && defined(order)] | order(order asc){
  _id,
  title,
  "desktop_image_url_a": desktop_image.asset->url,
  "mobile_image_url_a": mobile_image.asset->url,
  "desktop_image_url_b": desktopImage.asset->url,
  "mobile_image_url_b": mobileImage.asset->url,
  "desktop_image_url_c": desktopImageRef.asset->url,
  "mobile_image_url_c": mobileImageRef.asset->url,
  link_url,
  order
}`;

type SanityRawItem = {
  _id?: string | null;
  title?: string | null;
  desktop_image_url_a?: string | null;
  mobile_image_url_a?: string | null;
  desktop_image_url_b?: string | null;
  mobile_image_url_b?: string | null;
  desktop_image_url_c?: string | null;
  mobile_image_url_c?: string | null;
  link_url?: string | null;
  order?: number | null;
};

type Slide = {
  id: string | null;
  title: string | null;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  link_url: string | null;
  order: number | null;
};

function pickFirst(...vals: Array<string | null | undefined>): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.length) return v;
  }
  return null;
}

export async function GET() {
  try {
    const data = await client.fetch<SanityRawItem[]>(groq);

    if (!Array.isArray(data)) {
      console.error("/api/slider: unexpected response (not an array)", { data });
      return NextResponse.json({ slides: [] });
    }

    const slides: Slide[] = data.map((s: SanityRawItem) => ({
      id: s._id ?? null,
      title: s.title ?? null,
      desktop_image_url: pickFirst(s.desktop_image_url_a, s.desktop_image_url_b, s.desktop_image_url_c),
      mobile_image_url: pickFirst(s.mobile_image_url_a, s.mobile_image_url_b, s.mobile_image_url_c),
      link_url: s.link_url ?? null,
      order: typeof s.order === "number" ? s.order : null,
    }));

    return NextResponse.json({ slides });
  } catch (err: unknown) {
    console.error("Error fetching slides from Sanity:", err);
    const details = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch slides", details }, { status: 500 });
  }
}
