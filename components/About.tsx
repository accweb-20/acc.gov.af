// components/About.tsx
// Shared parts of the About Us pages (Who We Are + Mission, Vision, What We Do, Values).

import Link from "next/link";
import type { ReactNode } from "react";
import DownloadButton from "@/components/DownloadButton";
import {
  ArrowRight, Award, Briefcase, CircleCheck, Download, Eye, FileText, Globe, Handshake, Lightbulb, Mail,
  Package, Phone, Scale, Shield, Star, Target, TrendingUp, Truck, Users,
} from "lucide-react";

export const CONTAINER = "mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]";

/** All About Us pages, for the tabs and the "explore" cards. */
export const ABOUT_NAV_QUERY = `{
  "main": *[_type == "aboutUs"][0]{ title, "label": coalesce(breadcrumbLabel, "Who We Are") },
  "pages": *[_type == "aboutPage" && defined(slug.current)] | order(coalesce(menuOrder, 99) asc){
    title, "slug": slug.current, "text": coalesce(statement, pt::text(introBody))
  }
}`;

export type AboutNav = {
  main?: { title?: string; label?: string } | null;
  pages?: { title?: string; slug: string; text?: string }[] | null;
} | null;

const ICONS = {
  target: Target, eye: Eye, briefcase: Briefcase, shield: Shield, star: Star, users: Users,
  globe: Globe, truck: Truck, handshake: Handshake, award: Award, check: CircleCheck,
  lightbulb: Lightbulb, package: Package, scale: Scale, trending: TrendingUp,
};
export const SUB_ICONS: Record<string, keyof typeof ICONS> = { mission: "target", vision: "eye", "what-we-do": "briefcase", values: "award", policies: "scale" };

export function AboutIcon({ name, size = 22 }: { name?: string; size?: number }) {
  const Icon = ICONS[(name ?? "check") as keyof typeof ICONS] ?? CircleCheck;
  return <Icon size={size} />;
}

const label = (t?: string) => (t ?? "").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

/** Tabs under the page header: Who We Are | Our Mission | ... */
export function AboutTabs({ nav, active }: { nav: AboutNav; active: string }) {
  const tabs = [{ href: "/about-us", text: "Who We Are", key: "" }, ...(nav?.pages ?? []).map((p) => ({ href: `/about-us/${p.slug}`, text: label(p.title), key: p.slug }))];
  return (
    <nav aria-label="About Us pages" className="border-b border-brand-line/10 bg-paper">
      <div className={`${CONTAINER} flex gap-1 overflow-x-auto`}>
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.key === active ? "page" : undefined}
            className={`shrink-0 border-b-[3px] px-4 py-4 text-[15px] font-semibold transition ${
              t.key === active ? "border-[#F4BA00] text-brand-fg" : "border-transparent text-ink/65 hover:text-brand-fg"
            }`}
          >
            {t.text}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Small label + big title + yellow bar. */
export function SectionTitle({ eyebrow, title, light = false, center = false }: { eyebrow?: string; title?: string; light?: boolean; center?: boolean }) {
  if (!title && !eyebrow) return null;
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && <span className={`text-[13px] font-bold uppercase tracking-[0.16em] ${light ? "text-[#F4BA00]" : "text-brand-fg"}`}>{eyebrow}</span>}
      {title && <h2 className={`mt-2 text-[32px] font-extrabold leading-[1.1] md:text-[44px] ${light ? "text-white" : "text-ink"}`}>{title}</h2>}
      <span className={`mt-4 block h-1 w-16 bg-[#F4BA00] ${center ? "mx-auto" : ""}`} />
    </div>
  );
}

/** Cards linking to the other About Us pages. */
export function AboutExplore({ nav, active, title = "Explore more about us" }: { nav: AboutNav; active: string; title?: string }) {
  const pages = (nav?.pages ?? []).filter((p) => p.slug !== active);
  const cards = [
    ...(active ? [{ href: "/about-us", title: "Who We Are", text: nav?.main?.title, icon: "users" }] : []),
    ...pages.map((p) => ({ href: `/about-us/${p.slug}`, title: label(p.title), text: p.text, icon: SUB_ICONS[p.slug] ?? "check" })),
  ];
  if (!cards.length) return null;
  return (
    <section className="bg-mist py-14 md:py-20">
      <div className={CONTAINER}>
        <SectionTitle eyebrow="About Us" title={title} />
        <div className={`mt-10 grid gap-5 sm:grid-cols-2 ${cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="group flex flex-col border-t-4 border-brand-line bg-paper p-6 shadow-[0_10px_30px_rgba(2,88,123,0.07)] transition hover:-translate-y-1 hover:border-[#F4BA00] hover:shadow-[0_20px_44px_rgba(2,88,123,0.15)]">
              <span className="grid h-12 w-12 place-items-center bg-brand/8 text-brand-fg transition group-hover:bg-[#F4BA00] group-hover:text-[#1A1A1A]">
                <AboutIcon name={c.icon} />
              </span>
              <b className="mt-5 text-[19px]">{c.title}</b>
              {c.text && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink/65">{c.text}</p>}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-bold text-brand-fg">
                Read more <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const yellowBtn = "inline-flex items-center gap-2 bg-[#F4BA00] px-6 py-3 text-[15px] font-bold text-[#1A1A1A] transition hover:bg-white";

/** Blue contact band at the end of the page. */
export function AboutCta({ children }: { children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-deep py-14 text-white">
      <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rotate-12 border-[3px] border-[#F4BA00]/25" />
      <div className={`${CONTAINER} relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <h2 className="text-[26px] font-extrabold md:text-[34px]">For more information</h2>
          <p className="mt-2 max-w-xl text-[16px] text-[#8FB8C8]">{children ?? "Talk to our team about imports, exports and sales."}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="tel:0202925043" className={yellowBtn} style={{ clipPath: "polygon(0 0, 100% 14%, 100% 100%, 0 100%)" }}>
            <Phone size={17} /> Call Us
          </a>
          <a href="mailto:info@acc.gov.af" className="inline-flex items-center gap-2 border border-white/40 px-6 py-3 text-[15px] font-bold transition hover:border-[#F4BA00] hover:text-[#F4BA00]">
            <Mail size={17} /> Email Us
          </a>
          <Link href="/contact-us" className="inline-flex items-center gap-2 px-2 py-3 text-[15px] font-bold underline-offset-4 hover:underline">
            Contact page <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export type FileDoc = { _id: string; title?: string; pdfUrl?: string };

/** Download cards for PDF documents (on a blue background). */
export function Files({ title, files }: { title: string; files: FileDoc[] }) {
  if (!files.length) return null;
  return (
    <div className="mt-10 first:mt-0">
      {title && <h3 className="mb-5 text-[20px] font-bold text-white md:text-[24px]">{title}</h3>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => (
          <div key={f._id} className="flex flex-col bg-paper p-5 text-ink">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center bg-brand/10 text-brand-fg">
                <FileText size={21} />
              </span>
              <b className="text-[17px] leading-snug">{f.title ?? "Document"}</b>
            </div>
            <div className="mt-auto pt-5">
              {f.pdfUrl ? (
                <DownloadButton url={f.pdfUrl} filename={f.title ?? "document.pdf"}>
                  <span className="inline-flex items-center gap-2 px-4 font-bold">
                    <Download size={16} /> Download PDF
                  </span>
                </DownloadButton>
              ) : (
                <span className="text-sm text-gray-500">No file</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
