// app/publication/photos/page.tsx
import React from "react";
import { client } from "@/sanity/lib/client";
import PageHeader from "@/components/PageHeader";
import PhotosGrid from "@/components/Photos/PhotosGrid";
import PhotosIntro from "@/components/Photos/PhotosIntro";
import { Metadata } from "next";

export const revalidate = 60;

type BreadcrumbLink = { _key?: string; label?: string; href?: string };
type PhotoDoc = {
  title?: string;
  subtitle?: string;
  breadcrumbLinks?: BreadcrumbLink[];
  breadcrumbLabel?: string;
  headerMessage?: string;
  introTitle?: string;
  introMessage?: unknown[];
  introBackground?: { enabled?: boolean };
  photos?: Array<Record<string, unknown>> | null;
  bodyTitle?: string;
  bodyMessage?: unknown[];
  bodyBackground?: { enabled?: boolean };
  seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const q = `*[_type == "photosPage"][0]{title, seo}`;
    const doc = (await client.fetch(q)) as PhotoDoc | null;
    if (!doc) return { title: "Photos" };
    const seoTitle = doc.seo?.seoTitle ?? doc.title ?? "Photos";
    const description = doc.seo?.metaDescription ?? undefined;
    return {
      title: seoTitle,
      description,
      openGraph: { title: seoTitle, description },
      keywords: Array.isArray(doc.seo?.keywords) ? doc.seo.keywords : undefined,
    };
  } catch {
    return { title: "Photos" };
  }
}

export default async function Page() {
  const q = `*[_type == "photosPage"][0]{
    title, subtitle, breadcrumbLinks[]{_key, label, href}, breadcrumbLabel, headerMessage,
    introTitle, introMessage, introBackground, bodyTitle, bodyMessage, bodyBackground,
    photos[]{ _key, title, "image": image.asset->url, order, "slug": slug.current }
  }`;
  const data = (await client.fetch(q)) as PhotoDoc | null;
  if (!data) return <div className="p-8">Photos page not found.</div>;
  const photosRaw: Record<string, unknown>[] = Array.isArray(data.photos) ? data.photos : [];

  return (
    <main>
      <PageHeader
        title={data.title}
        subtitle={data.subtitle}
        breadcrumbLinks={data.breadcrumbLinks}
        breadcrumbLabel={data.breadcrumbLabel}
        headerMessage={data.headerMessage}
      />
      <PhotosIntro
        introTitle={data.introTitle}
        introMessage={(data.introMessage as unknown[]) ?? []}
        introBackgroundEnabled={!!data.introBackground?.enabled}
      />
      <PhotosGrid photosArr={photosRaw} />
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
