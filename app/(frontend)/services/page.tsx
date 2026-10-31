// app/(frontend)/services/page.tsx
// Services overview: Imports (live data from Import Category / Import Product),
// Exports and Sales (texts from the "Services Page" document; detailed content later).

import Image from "next/image";
import type { Metadata } from "next";
import { ArrowDownRight, Check, Clock, Handshake, PackageCheck, Ship, Store, type LucideIcon } from "lucide-react";
import { client } from "@/sanity/lib/client";
import PageHeader from "@/components/PageHeader";
import { CONTAINER, HomeImports, YellowButton, type HomeImportsData } from "@/components/Import/ImportsGrid";
import RichText from "@/components/Import/RichText";
import { Reveal } from "@/components/Import/Motion";
import { DEFAULT_CRUMBS, EYEBROW, SERVICES, hasRich, homeImportsQuery, imgUrl, pickCrumbs, sectionHomeQuery, toPlain, type Crumb, type RichValue, type SanityImg } from "@/lib/imports";

export const revalidate = 60;

type Section = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  description?: RichValue;
  highlights?: string[];
  buttonLabel?: string;
  comingSoon?: boolean;
  image?: SanityImg;
};

type ServicesDoc = {
  title?: string;
  breadcrumbLinks?: Crumb[] | null;
  breadcrumbLabel?: string;
  headerMessage?: unknown;
  introTitle?: string;
  introMessage?: unknown[];
  importsSection?: Section;
  exportsSection?: Section;
  salesSection?: Section;
  ctaTitle?: string;
  ctaText?: unknown;
  seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
};

const query = `*[_type == "servicesPage"][0]{
  ...,
  "headerMessage": coalesce(headerDescription, headerMessage),
  "ctaText": coalesce(ctaDescription, ctaText)
}`;

export async function generateMetadata(): Promise<Metadata> {
  const d = (await client.fetch(query).catch(() => null)) as ServicesDoc | null;
  const title = d?.seo?.seoTitle ?? d?.title ?? "Services";
  const description = d?.seo?.metaDescription ?? (toPlain(d?.headerMessage) || undefined);
  return { title, description, keywords: d?.seo?.keywords, openGraph: { title, description } };
}

/* ---------- Exports / Sales block ---------- */

function ServiceBlock({
  id,
  section,
  href,
  icon: Icon,
  reverse,
  fallbackTitle,
}: {
  id: string;
  section?: Section;
  href: string;
  icon: LucideIcon;
  reverse?: boolean;
  fallbackTitle: string;
}) {
  if (section?.enabled === false) return null;
  const img = imgUrl(section?.image ?? undefined, 900, 675);
  const comingSoon = section?.comingSoon ?? true;

  return (
    <section id={id} className={`scroll-mt-24 py-16 md:py-20 ${reverse ? "bg-smoke" : "bg-paper"}`}>
      <div className={`${CONTAINER} grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14`}>
        <Reveal from={reverse ? "right" : "left"} className={reverse ? "lg:order-2" : ""}>
          <span className={`inline-flex items-center gap-2 ${EYEBROW}`}>
            <span className="h-[3px] w-8 bg-[#F4BA00]" /> {section?.eyebrow || fallbackTitle}
          </span>
          <h2 className="mt-2 text-[30px] font-extrabold leading-tight text-ink md:text-[44px]">
            {section?.title || fallbackTitle}
          </h2>
          {hasRich(section?.description) && (
            <div className="mt-4 text-[16px] leading-[1.7] text-ink/70 md:text-[18px]">
              <RichText value={section?.description} />
            </div>
          )}
          {!!section?.highlights?.length && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {section.highlights.map((h, i) => (
                <li key={i} className="inline-flex items-center gap-1.5 bg-tint px-3 py-1.5 text-[14px] font-medium leading-[1.4] text-brand-fg">
                  <Check size={14} strokeWidth={3} /> {h}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            {comingSoon ? (
              <span className="inline-flex items-center gap-2 border border-brand-line/25 px-5 py-2.5 text-[14px] font-bold uppercase tracking-[0.12em] text-brand-fg">
                <Clock size={16} /> Coming soon
              </span>
            ) : (
              <YellowButton href={href}>{section?.buttonLabel || `View ${fallbackTitle}`}</YellowButton>
            )}
          </div>
        </Reveal>

        <Reveal from={reverse ? "left" : "right"} delay={120} className={reverse ? "lg:order-1" : ""}>
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-brand-line/10 bg-brand">
            {img ? (
              <Image src={img} alt={section?.image?.alt || section?.title || fallbackTitle} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover transition-transform duration-700 hover:scale-105" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                <span className="absolute -right-16 -top-16 h-56 w-56 rotate-12 bg-white/5" />
                <span className="absolute -bottom-12 -left-12 h-40 w-40 -rotate-12 bg-[#F4BA00]/20" />
                <Icon size={72} strokeWidth={1.2} className="relative text-[#F4BA00]" />
                <span className="relative text-[22px] font-bold tracking-wide">{section?.title || fallbackTitle}</span>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

export default async function ServicesPage() {
  const [d, importsData, exportsData, salesData] = await Promise.all([
    client.fetch(query).catch(() => null) as Promise<ServicesDoc | null>,
    client.fetch(homeImportsQuery).catch(() => null) as Promise<HomeImportsData | null>,
    client.fetch(sectionHomeQuery(SERVICES.exports)).catch(() => null) as Promise<HomeImportsData | null>,
    client.fetch(sectionHomeQuery(SERVICES.sales)).catch(() => null) as Promise<HomeImportsData | null>,
  ]);
  const exp = d?.exportsSection;
  const sal = d?.salesSection;

  const imp = d?.importsSection;
  const nav = [
    { id: "imports", label: imp?.title || "Imports", icon: Ship, show: imp?.enabled !== false },
    { id: "exports", label: d?.exportsSection?.title || "Exports", icon: PackageCheck, show: d?.exportsSection?.enabled !== false },
    { id: "sales", label: d?.salesSection?.title || "Sales", icon: Store, show: d?.salesSection?.enabled !== false },
  ].filter((n) => n.show);

  return (
    <main className="font-rubik">
      <PageHeader
        title={d?.title ?? "Our Services"}
        breadcrumbLinks={pickCrumbs(d?.breadcrumbLinks, DEFAULT_CRUMBS.servicesPage)}
        breadcrumbLabel={d?.breadcrumbLabel ?? "Services"}
        headerMessage={d?.headerMessage}
      >
        <nav aria-label="Services" className="flex flex-wrap justify-center gap-3">
          {nav.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="group inline-flex items-center gap-2 border border-white/30 px-5 py-2.5 text-[15px] font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#F4BA00] hover:bg-[#F4BA00] hover:text-[#1A1A1A]"
            >
              <Icon size={18} className="text-[#F4BA00] transition-colors group-hover:text-ink" />
              {label}
              <ArrowDownRight size={16} className="opacity-60" />
            </a>
          ))}
        </nav>
      </PageHeader>

      {(d?.introTitle || (d?.introMessage?.length ?? 0) > 0) && (
        <section className="bg-paper">
          <Reveal className={`${CONTAINER} py-14 text-ink`}>
            {d?.introTitle && <h2 className="mb-4 text-[36px] font-extrabold md:text-[52px]">{d.introTitle}</h2>}
            {d?.introMessage && (
              <div className="max-w-[920px] text-[17px] text-ink/80">
                <RichText value={d.introMessage} />
              </div>
            )}
          </Reveal>
        </section>
      )}

      {imp?.enabled !== false && (
        <HomeImports
          id="imports"
          eyebrow={imp?.eyebrow || "Imports"}
          title={imp?.title}
          description={imp?.description}
          buttonLabel={imp?.buttonLabel || "Explore All Imports"}
          data={importsData}
          className="bg-smoke"
        />
      )}

      {/* Exports and Sales: category cards when products exist, otherwise the simple block */}
      {exp?.enabled !== false &&
        (exportsData?.categories?.length ? (
          <HomeImports
            id="exports"
            base={SERVICES.exports.base}
            eyebrow={exp?.eyebrow || "Exports"}
            title={exp?.title}
            fallbackTitle="What We Export"
            description={exp?.description}
            buttonLabel={exp?.buttonLabel || "Explore All Exports"}
            data={exportsData}
            className="bg-paper"
          />
        ) : (
          <ServiceBlock id="exports" section={exp} href="/services/exports" icon={PackageCheck} fallbackTitle="Exports" />
        ))}
      {sal?.enabled !== false &&
        (salesData?.categories?.length ? (
          <HomeImports
            id="sales"
            base={SERVICES.sales.base}
            eyebrow={sal?.eyebrow || "Sales"}
            title={sal?.title}
            fallbackTitle="What We Sell"
            description={sal?.description}
            buttonLabel={sal?.buttonLabel || "Explore All Products"}
            data={salesData}
            className="bg-smoke"
          />
        ) : (
          <ServiceBlock id="sales" section={sal} href="/services/sales" icon={Store} reverse fallbackTitle="Sales" />
        ))}

      <section className="bg-brand">
        <div className={`${CONTAINER} flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between`}>
          <Reveal from="left" className="flex items-start gap-4">
            <Handshake size={40} strokeWidth={1.5} className="hidden shrink-0 text-[#F4BA00] md:block" />
            <div>
              <h2 className="text-[26px] font-bold text-white md:text-[32px]">{d?.ctaTitle || "Let’s work together"}</h2>
              <p className="mt-2 max-w-2xl text-[16px] text-[#8FB8C8]">
                {hasRich(d?.ctaText) ? (
                  <RichText value={d?.ctaText} inline onDark />
                ) : (
                  "Tell us what you need and our team will get back to you."
                )}
              </p>
            </div>
          </Reveal>
          <Reveal from="right">
            <YellowButton href="/contact-us">Contact Us</YellowButton>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
