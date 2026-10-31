// app/about-us/page.tsx
// About Us main page (Who We Are). Mission, Vision, What We Do and Values have their own pages.

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { sanityClient } from "@/sanity/lib/client";
import PageHeader from "@/components/PageHeader";
import RichText from "@/components/Import/RichText";
import { hasRich, imgUrl, type SanityImg } from "@/lib/imports";
import { ABOUT_NAV_QUERY, AboutCta, AboutExplore, AboutIcon, AboutTabs, CONTAINER, Files, SectionTitle, SUB_ICONS, type AboutNav, type FileDoc } from "@/components/About";

export const revalidate = 60;

type Doc = {
  title?: string;
  subtitle?: string;
  breadcrumbLinks?: { _key?: string; label?: string; href?: string }[];
  breadcrumbLabel?: string;
  headerMessage?: unknown;
  introTitle?: string;
  introBody?: unknown[];
  image?: SanityImg;
  contentTitle?: string;
  contentBody?: unknown[];
  topics?: { _key: string; topicTitle?: string; topicBody?: unknown[] }[];
  endTitle?: string;
  endBody?: unknown[];
};

const QUERY = `{
  "doc": *[_type == "aboutUs"][0]{
    title, subtitle, breadcrumbLinks[]{_key, label, href}, breadcrumbLabel, "headerMessage": coalesce(headerDescription, headerMessage),
    introTitle, introBody, image, contentTitle, contentBody, topics[]{_key, topicTitle, topicBody}, endTitle, endBody
  },
  "annuals": *[_type == "annualReport"] | order(_createdAt desc){_id, title, "pdfUrl": pdf.asset->url},
  "policies": *[_type == "policy"] | order(_createdAt desc){_id, title, "pdfUrl": pdf.asset->url},
  "nav": ${ABOUT_NAV_QUERY}
}`;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await sanityClient.fetch(`*[_type == "aboutUs"][0]{ "title": coalesce(seo.seoTitle, title), "description": seo.metaDescription, "keywords": seo.keywords }`);
    return { title: seo?.title ?? "About Us", description: seo?.description ?? undefined, keywords: Array.isArray(seo?.keywords) ? seo.keywords : undefined };
  } catch {
    return { title: "About Us" };
  }
}

const label = (t?: string) => (t ?? "").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export default async function AboutUsPage() {
  let data: { doc: Doc | null; annuals: FileDoc[]; policies: FileDoc[]; nav: AboutNav } = { doc: null, annuals: [], policies: [], nav: null };
  try {
    data = await sanityClient.fetch(QUERY);
  } catch (err) {
    console.error("Failed to fetch About Us page:", err);
  }
  const { doc, nav } = data;
  const annuals = data.annuals ?? [];
  const policies = data.policies ?? [];
  const topics = (doc?.topics ?? []).filter((t) => t.topicTitle || hasRich(t.topicBody));
  const photo = imgUrl(doc?.image, 900, 700);
  const subPages = nav?.pages ?? [];

  return (
    <main className="bg-paper text-ink">
      <PageHeader
        title={doc?.title ?? "About Us"}
        subtitle={doc?.subtitle}
        breadcrumbLinks={doc?.breadcrumbLinks ?? []}
        breadcrumbLabel={doc?.breadcrumbLabel}
        headerMessage={doc?.headerMessage}
      />
      <AboutTabs nav={nav} active="" />

      {/* Who we are + quick links to the other About pages */}
      <section className="py-14 md:py-20">
        <div className={`${CONTAINER} grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16`}>
          <div>
            <SectionTitle eyebrow="About Afghan Cart" title={doc?.introTitle} />
            {hasRich(doc?.introBody) && (
              <div className="mt-6 text-[17px] leading-relaxed text-ink/80">
                <RichText value={doc?.introBody} />
              </div>
            )}
          </div>

          {photo ? (
            <div className="relative">
              <span className="absolute -bottom-4 -left-4 h-full w-full border-[3px] border-[#F4BA00]" />
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={photo} alt={doc?.introTitle ?? "Afghan Cart"} fill sizes="(max-width: 1023px) 90vw, 460px" className="object-cover" />
              </div>
            </div>
          ) : (
            subPages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {subPages.map((p, i) => {
                  const dark = i % 4 === 0 || i % 4 === 3;
                  const wide = i === subPages.length - 1 && subPages.length % 2 === 1; // last one fills the row
                  return (
                  <Link
                    key={p.slug}
                    href={`/about-us/${p.slug}`}
                    className={`group flex flex-col justify-between gap-6 p-5 transition hover:-translate-y-1 ${wide ? "col-span-2" : "aspect-square"} ${
                      dark ? "bg-brand text-white" : "border border-brand-line/15 bg-mist text-ink"
                    }`}
                  >
                    <span className={`grid h-11 w-11 place-items-center ${dark ? "bg-[#F4BA00] text-[#1A1A1A]" : "bg-brand text-white"}`}>
                      <AboutIcon name={SUB_ICONS[p.slug]} />
                    </span>
                    <span className="flex items-end justify-between gap-2">
                      <b className="text-[17px] leading-tight md:text-[19px]">{label(p.title)}</b>
                      <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                  );
                })}
              </div>
            )
          )}
        </div>
      </section>

      {/* The corporation (blue band) */}
      {(doc?.contentTitle || hasRich(doc?.contentBody)) && (
        <section className="relative overflow-hidden bg-brand py-14 text-white md:py-20">
          <span className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 -rotate-12 border-[3px] border-[#F4BA00]/20" />
          <div className={`${CONTAINER} relative grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16`}>
            <SectionTitle eyebrow="Our corporation" title={doc?.contentTitle} light />
            {hasRich(doc?.contentBody) && (
              <div className="text-[17px] leading-relaxed text-white/90">
                <RichText value={doc?.contentBody} onDark />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Topics: one row each */}
      {topics.length > 0 && (
        <section className="py-14 md:py-20">
          <div className={CONTAINER}>
            {topics.map((t, i) => (
              <div key={t._key} className="grid gap-4 border-t border-brand-line/12 py-10 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-16">
                <div className="flex items-start gap-4">
                  <span className="text-[38px] font-extrabold leading-none text-[#F4BA00]">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="pt-1 text-[24px] font-extrabold leading-tight md:text-[28px]">{t.topicTitle}</h2>
                </div>
                <div className="text-[17px] leading-relaxed text-ink/80">
                  <RichText value={t.topicBody} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {(doc?.endTitle || hasRich(doc?.endBody)) && (
        <section className="bg-mist py-14 md:py-20">
          <div className={CONTAINER}>
            <SectionTitle eyebrow="Since 1357 (1978)" title={doc?.endTitle} />
            {hasRich(doc?.endBody) && (
              <div className="mt-8 border-l-4 border-[#F4BA00] bg-paper p-6 text-[17px] leading-relaxed text-ink/80 shadow-[0_10px_30px_rgba(2,88,123,0.06)] md:p-10">
                <RichText value={doc?.endBody} />
              </div>
            )}
          </div>
        </section>
      )}

      {photo && <AboutExplore nav={nav} active="" />}

      {/* Downloads */}
      {(annuals.length > 0 || policies.length > 0) && (
        <section className="bg-brand py-14 md:py-20">
          <div className={CONTAINER}>
            <SectionTitle eyebrow="Documents" title="Downloadables" light />
            <div className="mt-10">
              <Files title="Annual Reports" files={annuals} />
              <Files title="Policies" files={policies} />
            </div>
          </div>
        </section>
      )}

      <AboutCta />
    </main>
  );
}
