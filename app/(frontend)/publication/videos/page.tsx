// app/publication/videos/page.tsx
import React from "react";
import { client } from "@/sanity/lib/client";
import PageHeader from "@/components/PageHeader";
import VideosGrid from "@/components/Videos/VideosGrid";
import VideosIntro from "@/components/Videos/VideosIntro";
import { Metadata } from "next";

export const revalidate = 60;

type VideoDoc = {
  title?: string;
  subtitle?: string;
  desktopHero?: string | null;
  mobileHero?: string | null;
  introTitle?: string;
  introMessage?: unknown[];
  introBackground?: { enabled?: boolean };
  videos?: Array<Record<string, unknown>> | null;
  bodyTitle?: string;
  bodyMessage?: unknown[];
  bodyBackground?: { enabled?: boolean };
  seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const q = `*[_type == "videosPage"][0]{title, seo, "desktopHero": desktopHero.asset->url, "mobileHero": mobileHero.asset->url}`;
    const doc = (await client.fetch(q)) as VideoDoc | null;
    if (!doc) return { title: "Videos" };
    const seoTitle = doc.seo?.seoTitle ?? doc.title ?? "Videos";
    const description = doc.seo?.metaDescription ?? undefined;
    const images = [];
    if (doc.desktopHero) images.push({ url: doc.desktopHero });
    else if (doc.mobileHero) images.push({ url: doc.mobileHero });
    return {
      title: seoTitle,
      description,
      openGraph: { title: seoTitle, description, images: images.length ? images : undefined },
      keywords: Array.isArray(doc.seo?.keywords) ? doc.seo?.keywords : undefined,
    } as Metadata;
  } catch {
    return { title: "Videos" };
  }
}

export default async function Page() {
  const q = `*[_type == "videosPage"][0]{
    title, subtitle,
    "desktopHero": desktopHero.asset->url,
    "mobileHero": mobileHero.asset->url,
    introTitle, introMessage, introBackground, bodyTitle, bodyMessage, bodyBackground,
    videos[]{ _key, title, "video": video.asset->url, "poster": poster.asset->url, order, "slug": slug.current }
  }`;

  const data = (await client.fetch(q)) as VideoDoc | null;
  if (!data) return <div className="p-8">Videos page not found.</div>;
  const videosRaw: Record<string, unknown>[] = Array.isArray(data.videos) ? data.videos : [];

  return (
    <main>
      <PageHeader
        title={data.title}
        subtitle={data.subtitle}
        desktopHero={data.desktopHero}
        mobileHero={data.mobileHero}
      />

      <VideosIntro
        introTitle={data.introTitle}
        introMessage={(data.introMessage as unknown[]) ?? []}
        introBackgroundEnabled={!!data.introBackground?.enabled}
      />

      <VideosGrid videosArr={videosRaw} />

      <section
        className="w-full mx-auto"
        style={{ background: !!data.bodyBackground?.enabled ? "linear-gradient(180deg,#f5f0ff,#f1e8ff)" : "transparent" }}
      >
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1140px] py-12">
          <div className="max-w-[920px]">
            {data.bodyTitle && <h2 className="text-[45px] md:text-[60px] font-extrabold mb-6">{data.bodyTitle}</h2>}
            {data.bodyMessage && (
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[#1A1A1A]">
                {(data.bodyMessage as any) ?? null}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}