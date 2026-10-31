// app/about-us/[slug]/page.tsx
// About Us sub pages: Our Mission, Our Vision, What We Do, Our Values (Sanity "aboutPage").

import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { sanityClient } from "@/sanity/lib/client";
import PageHeader from "@/components/PageHeader";
import RichText from "@/components/Import/RichText";
import { hasRich, imgUrl, type SanityImg } from "@/lib/imports";
import { ABOUT_NAV_QUERY, AboutCta, AboutExplore, AboutIcon, AboutTabs, CONTAINER, Files, SectionTitle, type AboutNav, type FileDoc } from "@/components/About";

export const revalidate = 60;

type Doc = {
  title?: string;
  subtitle?: string;
  breadcrumbLinks?: { _key?: string; label?: string; href?: string }[];
  breadcrumbLabel?: string;
  headerMessage?: unknown;
  eyebrow?: string;
  introTitle?: string;
  introBody?: unknown[];
  statement?: string;
  image?: SanityImg;
  facts?: { _key: string; value?: string; label?: string }[];
  itemsTitle?: string;
  itemsIntro?: string;
  items?: { _key: string; title?: string; text?: string; icon?: string }[];
  closingTitle?: string;
  closingBody?: unknown[];
  showPolicyFiles?: boolean;
  seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
};

const QUERY = `{
  "doc": *[_type == "aboutPage" && slug.current == $slug][0]{
    title, subtitle, breadcrumbLinks[]{_key, label, href}, breadcrumbLabel, "headerMessage": coalesce(headerDescription, headerMessage),
    eyebrow, introTitle, introBody, statement, image, facts[]{_key, value, label}, itemsTitle, itemsIntro, items[]{_key, title, text, icon},
    closingTitle, closingBody, showPolicyFiles, seo
  },
  "policies": *[_type == "policy"] | order(_createdAt desc){_id, title, "pdfUrl": pdf.asset->url},
  "nav": ${ABOUT_NAV_QUERY}
}`;

async function load(slug: string) {
  try {
    return (await sanityClient.fetch(QUERY, { slug })) as { doc: Doc | null; nav: AboutNav; policies?: FileDoc[] };
  } catch (err) {
    console.error("Failed to fetch about page:", err);
    return { doc: null, nav: null, policies: [] };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { doc } = await load((await params).slug);
  const title = doc?.seo?.seoTitle ?? doc?.title ?? "About Us";
  return { title, description: doc?.seo?.metaDescription, keywords: doc?.seo?.keywords };
}

export default async function AboutSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { doc, nav, policies } = await load(slug);
  if (!doc) notFound();

  const photo = imgUrl(doc.image, 900, 700);
  const items = doc.items ?? [];

  return (
    <main className="bg-paper text-ink">
      <PageHeader title={doc.title} subtitle={doc.subtitle} breadcrumbLinks={doc.breadcrumbLinks} breadcrumbLabel={doc.breadcrumbLabel} headerMessage={doc.headerMessage} />
      <AboutTabs nav={nav} active={slug} />

      {/* Intro + highlighted statement */}
      <section className="py-14 md:py-20">
        <div className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <SectionTitle eyebrow={doc.eyebrow} title={doc.introTitle} />
            {hasRich(doc.introBody) && (
              <div className="mt-6 text-[17px] leading-relaxed text-ink/80">
                <RichText value={doc.introBody} />
              </div>
            )}
          </div>

          {(doc.statement || photo) && (
            <div className="relative">
              {photo && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo} alt={doc.title ?? ""} fill sizes="(max-width: 1023px) 90vw, 560px" className="object-cover" />
                </div>
              )}
              {doc.statement && (
                <blockquote
                  className={`relative bg-brand p-8 text-white shadow-[0_30px_60px_rgba(2,88,123,0.25)] md:p-10 ${photo ? "-mt-16 ml-6 md:ml-12" : ""}`}
                >
                  <span className="absolute right-0 top-0 h-10 w-10 bg-[#F4BA00]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
                  <Quote size={34} className="text-[#F4BA00]" />
                  <p className="mt-4 text-[20px] font-semibold leading-snug md:text-[24px]">{doc.statement}</p>
                </blockquote>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Key facts */}
      {(doc.facts?.length ?? 0) > 0 && (
        <section className="pb-14 md:pb-20">
          <div className={`${CONTAINER} grid grid-cols-2 border-y border-brand-line/12 lg:grid-cols-4`}>
            {doc.facts!.map((f, i) => (
              <div key={f._key} className={`px-4 py-7 text-center ${i % 2 ? "border-l" : "lg:border-l"} border-brand-line/12 ${i === 0 ? "lg:border-l-0" : ""}`}>
                <b className="block text-[28px] font-extrabold leading-none text-brand-fg md:text-[34px]">{f.value}</b>
                <span className="mt-2 block text-[14px] text-ink/65">{f.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cards */}
      {items.length > 0 && (
        <section className="bg-mist py-14 md:py-20">
          <div className={CONTAINER}>
            <div className="max-w-2xl">
              <SectionTitle title={doc.itemsTitle} />
              {doc.itemsIntro && <p className="mt-5 text-[17px] text-ink/70">{doc.itemsIntro}</p>}
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <article key={it._key} className="group relative border border-brand-line/10 bg-paper p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(2,88,123,0.14)] md:p-7">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#F4BA00] transition group-hover:scale-x-100" />
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center bg-brand text-white">
                      <AboutIcon name={it.icon} />
                    </span>
                    <span className="text-[30px] font-extrabold text-brand-fg/10">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 text-[19px] font-bold">{it.title}</h3>
                  {it.text && <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{it.text}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing */}
      {(doc.closingTitle || hasRich(doc.closingBody)) && (
        <section className="py-14 md:py-20">
          <div className={`${CONTAINER} max-w-[860px] text-center`}>
            <SectionTitle title={doc.closingTitle} center />
            {hasRich(doc.closingBody) && (
              <div className="mt-6 text-[17px] leading-relaxed text-ink/80">
                <RichText value={doc.closingBody} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Policy documents */}
      {doc.showPolicyFiles && (policies?.length ?? 0) > 0 && (
        <section className="bg-brand py-14 md:py-20">
          <div className={CONTAINER}>
            <SectionTitle eyebrow="Documents" title="Policy documents" light />
            <div className="mt-10">
              <Files title="" files={policies ?? []} />
            </div>
          </div>
        </section>
      )}

      <AboutExplore nav={nav} active={slug} />
      <AboutCta />
    </main>
  );
}
