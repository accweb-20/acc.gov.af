// app/(frontend)/page.tsx
// Home page: hero (one of six designs, chosen in Sanity), CEO message, explore cards, imports / exports / sales, body,
// and a contact band – a short taste of the whole website.

import Image from "next/image";
import { Quote } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import HomeHero from "@/components/Home/Hero";
import { HERO_QUERY, type HeroData } from "@/components/Home/heroData";
import { HomeImports, type HomeImportsData } from "@/components/Import/ImportsGrid";
import RichText from "@/components/Import/RichText";
import { SERVICES, hasRich, homeImportsQuery, imgUrl, sectionHomeQuery, toPlain, type SanityImg } from "@/lib/imports";
import { sanityClient } from "@/sanity/lib/client";
import { HOME_EXTRA_QUERY, HomeContact, HomeExplore, type HomeExtra } from "@/components/Home/HomeSections";

// Cached and refreshed every minute (fast for visitors, still up to date)
export const revalidate = 60;

type HomeDoc = {
  title?: string;
  introTitle?: string;
  introMessage?: unknown[];
  introBackgroundEnabled?: boolean;
  ceoName?: string;
  ceoPosition?: string;
  ceoOrganization?: string;
  ceoPhoto?: SanityImg & { alt?: string };
  bodyTitle?: string;
  bodyMessage?: unknown[];
  bodyBackgroundEnabled?: boolean;
  importsTitle?: string;
  importsDescription?: unknown;
  exportsTitle?: string;
  exportsDescription?: unknown;
  salesTitle?: string;
  salesDescription?: unknown;
  seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
};

const HOME_QUERY = `*[_type == "home"][0]{
  title,
  introTitle,
  introMessage,
  "introBackgroundEnabled": introBackground.enabled,
  ceoName,
  ceoPosition,
  ceoOrganization,
  ceoPhoto,
  bodyTitle,
  bodyMessage,
  "bodyBackgroundEnabled": bodyBackground.enabled,
  importsTitle,
  importsDescription,
  exportsTitle,
  exportsDescription,
  salesTitle,
  salesDescription,
  seo{seoTitle, metaDescription, keywords}
}`;


export async function generateMetadata() {
  const data = (await sanityClient.fetch(`*[_type == "home"][0]{ title, seo{seoTitle, metaDescription, keywords[]} }`)) as HomeDoc | null;
  return {
    title: data?.seo?.seoTitle || data?.title || "Home",
    description: data?.seo?.metaDescription || "",
    keywords: data?.seo?.keywords?.length ? data.seo.keywords.join(", ") : undefined,
  };
}

/** The CEO message, with the name/position shown as a signature (not repeated inside the text). */
function CeoMessage({ home }: { home: HomeDoc }) {
  const dark = !!home.introBackgroundEnabled;
  const signature = [home.ceoName, home.ceoPosition, home.ceoOrganization]
    .map((s) => (s ?? "").trim().toLowerCase())
    .filter(Boolean);
  // Older content has the signature typed as the last paragraphs — hide those duplicates.
  const message = (home.introMessage ?? []).filter((b) => !signature.includes(toPlain([b]).toLowerCase()));
  const photo = imgUrl(home.ceoPhoto ?? undefined, 640, 800);
  const initials = (home.ceoName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <section className={`w-full ${dark ? "bg-brand text-[#F5F5F5]" : "bg-paper text-ink"}`}>
      <div className="mx-auto grid w-[90%] max-w-[493px] grid-cols-1 gap-10 py-14 md:w-[93%] md:max-w-[924px] md:py-20 lg:w-[90%] lg:max-w-[1140px] lg:grid-cols-[1fr_300px] lg:gap-14">
        <div className="min-w-0">
          {home.introTitle && (
            <h2 className="flex items-center gap-3 text-[30px] font-extrabold leading-none tracking-wide md:text-[52px]">
              <span className="h-10 w-1.5 shrink-0 bg-[#F4BA00] md:h-14" aria-hidden="true" />
              {home.introTitle}
            </h2>
          )}

          <div className="relative mt-8">
            <Quote
              size={64}
              strokeWidth={1.2}
              aria-hidden="true"
              className={`absolute -left-1 -top-6 ${dark ? "text-white/10" : "text-brand-fg/10"}`}
            />
            <div className={`relative text-[16px] leading-[1.8] md:text-[18px] ${dark ? "text-[#F5F5F5]/90" : "text-ink/80"}`}>
              <RichText value={message} onDark={dark} />
            </div>
          </div>

          {/* Signature (small screens and when there is no photo) */}
          {home.ceoName && (
            <div className={`mt-8 flex items-center gap-4 border-t pt-6 ${dark ? "border-white/15" : "border-brand-line/10"} ${photo ? "lg:hidden" : ""}`}>
              {!photo && initials && (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-brand text-[18px] font-bold text-[#F4BA00]">
                  {initials}
                </span>
              )}
              <div>
                <p className={`text-[19px] font-bold ${dark ? "text-white" : "text-brand-fg"}`}>{home.ceoName}</p>
                {home.ceoPosition && <p className="text-[15px] font-medium">{home.ceoPosition}</p>}
                {home.ceoOrganization && <p className="text-[14px] opacity-60">{home.ceoOrganization}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Photo card (large screens) */}
        {photo && (
          <aside className="order-first lg:order-none lg:self-start lg:pt-20">
            <figure className="relative mx-auto max-w-[300px]">
              <span className="absolute -right-3 -top-3 h-full w-full border-2 border-[#F4BA00]" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden bg-tint">
                <Image
                  src={photo}
                  alt={home.ceoPhoto?.alt || home.ceoName || "Chief Executive Officer"}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
              {home.ceoName && (
                <figcaption className="relative hidden bg-brand px-5 py-4 text-white lg:block">
                  <span className="absolute left-0 top-0 h-[3px] w-12 bg-[#F4BA00]" />
                  <p className="text-[18px] font-bold">{home.ceoName}</p>
                  {home.ceoPosition && <p className="text-[14px] text-white/80">{home.ceoPosition}</p>}
                  {home.ceoOrganization && <p className="text-[13px] text-[#8FB8C8]">{home.ceoOrganization}</p>}
                </figcaption>
              )}
            </figure>
          </aside>
        )}
      </div>
    </section>
  );
}

export default async function Home() {
  const [home, importsData, exportsData, salesData, heroData, extra] = await Promise.all([
    sanityClient.fetch(HOME_QUERY) as Promise<HomeDoc | null>,
    sanityClient.fetch(homeImportsQuery) as Promise<HomeImportsData | null>,
    sanityClient.fetch(sectionHomeQuery(SERVICES.exports)).catch(() => null) as Promise<HomeImportsData | null>,
    sanityClient.fetch(sectionHomeQuery(SERVICES.sales)).catch(() => null) as Promise<HomeImportsData | null>,
    // hero: chosen in Sanity → "Home Hero"
    sanityClient.fetch(HERO_QUERY).catch(() => null) as Promise<HeroData>,
    sanityClient.fetch(HOME_EXTRA_QUERY).catch(() => null) as Promise<HomeExtra>,
  ]);

  const hasIntro = !!home && (!!home.introTitle || hasRich(home.introMessage));
  const hasBody = !!home && (!!home.bodyTitle || hasRich(home.bodyMessage));

  return (
    <>
      <ScrollToTop />

      <HomeHero data={heroData} />

      {hasIntro && home && <CeoMessage home={home} />}

      {/* A card for every part of the website */}
      <HomeExplore data={extra} />

      {/* Imports section: title & description from the Home document, data from the Import schema */}
      <HomeImports title={home?.importsTitle} description={home?.importsDescription as never} data={importsData} buttonLabel="Explore All Imports" />

      {/* Exports and Sales sections: same design; hidden automatically when there are no categories */}
      <HomeImports
        id="home-exports"
        base={SERVICES.exports.base}
        eyebrow="Exports"
        title={home?.exportsTitle}
        fallbackTitle="What We Export"
        description={home?.exportsDescription as never}
        data={exportsData}
        buttonLabel="Explore All Exports"
        className="bg-paper"
      />
      <HomeImports
        id="home-sales"
        base={SERVICES.sales.base}
        eyebrow="Sales"
        title={home?.salesTitle}
        fallbackTitle="What We Sell"
        description={home?.salesDescription as never}
        data={salesData}
        buttonLabel="Explore All Products"
      />

      {hasBody && (
        <section className={`mx-auto w-full md:max-w-[1440px] ${home?.bodyBackgroundEnabled ? "bg-brand text-[#F5F5F5]" : ""}`}>
          <div className="mx-auto w-[90%] max-w-[493px] py-10 md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]">
            {home?.bodyTitle && (
              <h3 className="mb-4 text-[30px] font-extrabold leading-none tracking-wide md:text-[65px]">{home.bodyTitle}</h3>
            )}
            {hasRich(home?.bodyMessage) && (
              <div className="mt-2 max-w-3xl text-[17px]">
                <RichText value={home?.bodyMessage} onDark={!!home?.bodyBackgroundEnabled} />
              </div>
            )}
          </div>
        </section>
      )}

      <HomeContact />
    </>
  );
}
