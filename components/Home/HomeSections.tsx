// components/Home/HomeSections.tsx
// Short "taster" sections on the home page that invite visitors to the rest of the website:
//   HomeExplore  → about text + a card for every part of the site (with live numbers)
//   HomeContact  → contact call-to-action band
// Data comes from HOME_EXTRA_QUERY (one request).

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  FileCheck2,
  Landmark,
  PieChart,
  Users,
  Building2,
  FileText,
  Images,
  Phone,
  Ship,
} from "lucide-react";
import { CONTAINER, YellowButton } from "@/components/Import/ImportsGrid";
import { CountUp, Reveal } from "@/components/Import/Motion";
import { EYEBROW } from "@/lib/imports";

export const HOME_EXTRA_QUERY = `{
  "about": *[_type == "aboutUs"][0]{ title, introTitle, "intro": pt::text(introBody) },
  "productCount": count(*[_type in ["importProduct", "exportProduct", "salesProduct"] && !(status in ["draft", "archived"])]),
  "tenderCount": count(*[_type == "tender"]),
  "jobCount": count(*[_type == "jobPosting" && status != "draft"]),
  "photoCount": count(*[_type == "photosPage"][0].photos),
  "videoCount": count(*[_type == "videosPage"][0].videos),
  "facts": *[_type == "aboutPage" && slug.current == "policies"][0].facts[defined(value)]{ _key, value, label }
}`;

export type HomeExtra = {
  about?: { title?: string; introTitle?: string; intro?: string } | null;
  productCount?: number;
  tenderCount?: number;
  jobCount?: number;
  photoCount?: number;
  videoCount?: number;
  facts?: { _key: string; value?: string; label?: string }[] | null; // same facts as the Our Policies page
} | null;


/** Small heading used by every section here. */
function Heading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className={`inline-flex items-center gap-2 ${EYEBROW}`}>
        <span className="h-[3px] w-8 bg-[#F4BA00]" /> {eyebrow}
      </span>
      <h2 className="mt-2 text-[30px] font-extrabold leading-tight text-ink md:text-[44px]">{title}</h2>
      {text && <p className="mt-3 text-[16px] leading-relaxed text-ink/65 md:text-[17px]">{text}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function HomeExplore({ data }: { data: HomeExtra }) {
  const intro = (data?.about?.intro ?? "").replace(/\s+/g, " ").trim();
  const short = intro.length > 260 ? `${intro.slice(0, 260).replace(/\s+\S*$/, "")}…` : intro;

  const cards = [
    { href: "/about-us", icon: Building2, title: "About Us", text: "Our story, mission and shareholders.", stat: null as number | null, unit: "" },
    { href: "/services", icon: Ship, title: "Services", text: "Imports, exports and sales.", stat: data?.productCount ?? null, unit: "products" },
    { href: "/tenders", icon: FileText, title: "Tenders", text: "Procurement opportunities and documents.", stat: data?.tenderCount ?? null, unit: "tenders" },
    { href: "/jobs", icon: Briefcase, title: "Jobs", text: "Vacancies and careers at ACC.", stat: data?.jobCount ?? null, unit: "job posts" },
    { href: "/publication/photos", icon: Images, title: "Photo Gallery", text: "Our products, events and work.", stat: data?.photoCount ?? null, unit: "photos" },
    { href: "/contact-us", icon: Phone, title: "Contact Us", text: "Questions, orders and partnerships.", stat: null, unit: "" },
  ];

  return (
    <section className="relative overflow-hidden bg-mist py-16 md:py-20">
      <span className="pointer-events-none absolute -left-24 top-10 h-64 w-64 -rotate-12 bg-brand/[0.04]" />
      <div className={`${CONTAINER} relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14`}>
        <Reveal from="left" className="flex flex-col justify-center">
          <Heading
            eyebrow={data?.about?.introTitle || "About Us"}
            title="Explore Afghan Cart"
            text={short || "Import, export and sales across Afghanistan and the world for more than four decades."}
          />
          <div className="mt-7">
            <YellowButton href="/about-us">Read Our Story</YellowButton>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {cards.map(({ href, icon: Icon, title, text, stat, unit }, i) => (
            <Reveal key={href} delay={(i % 3) * 90} className="h-full">
              <Link
                href={href}
                className="group relative flex h-full flex-col border border-brand-line/10 bg-paper p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-line/30 hover:shadow-[0_14px_34px_rgba(2,88,123,0.14)] sm:p-5"
              >
                <span className="absolute left-0 top-0 h-[3px] w-10 bg-[#F4BA00] transition-all duration-500 group-hover:w-full" />
                <span className="flex items-start justify-between gap-2">
                  <span className="flex h-11 w-11 items-center justify-center bg-brand text-[#F4BA00] transition-colors duration-300 group-hover:bg-[#F4BA00] group-hover:text-brand-fg">
                    <Icon size={21} />
                  </span>
                  <ArrowUpRight size={18} className="text-brand-fg/40 transition duration-300 group-hover:rotate-45 group-hover:text-brand-fg" />
                </span>
                <span className="mt-4 text-[16px] font-bold text-ink sm:text-[18px]">{title}</span>
                <span className="mt-1 hidden text-[14px] leading-snug text-ink/60 sm:block">{text}</span>
                {stat ? (
                  <span className="mt-auto pt-3 text-[13px] font-semibold text-brand-fg">
                    <CountUp value={stat} /> {unit}
                  </span>
                ) : null}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Icon for a fact, picked from its label. */
function factIcon(label = "") {
  const l = label.toLowerCase();
  if (l.includes("capital")) return Landmark;
  if (l.includes("share")) return PieChart;
  if (l.includes("board") || l.includes("member")) return Users;
  if (l.includes("report") || l.includes("standard")) return FileCheck2;
  return BadgeCheck;
}

/** "At a glance" band right under the hero. Facts are edited on the "Our Policies" page in Sanity. */
export function HomeFacts({ data }: { data: HomeExtra }) {
  const facts = (data?.facts ?? []).slice(0, 4);
  if (!facts.length) return null;
  return (
    <section className="relative border-b border-brand-line/10 bg-paper py-12 md:py-16">
      <div className={`${CONTAINER} grid overflow-hidden shadow-[0_24px_60px_rgba(2,88,123,0.12)] lg:grid-cols-[300px_minmax(0,1fr)]`}>
        {/* Label panel */}
        <Reveal from="left" className="relative flex flex-col justify-center overflow-hidden bg-brand p-7 text-white md:p-9">
          <span className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rotate-12 border-[3px] border-[#F4BA00]/30" />
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#F4BA00]">At a glance</span>
          <h2 className="mt-2 text-[26px] font-extrabold leading-tight md:text-[30px]">Afghan Cart in numbers</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/70">A state-owned corporation, governed by its official Statute.</p>
          <Link href="/about-us/policies" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#F4BA00] hover:underline">
            Read our policies <ArrowRight size={15} />
          </Link>
        </Reveal>

        {/* Facts */}
        <div className="grid grid-cols-2 bg-paper lg:grid-cols-4">
          {facts.map((f, i) => {
            const Icon = factIcon(f.label);
            return (
              <Reveal key={f._key} delay={i * 90} className={`group relative flex flex-col justify-center border-brand-line/10 p-6 md:p-7 ${i % 2 ? "border-l" : "lg:border-l"} ${i === 0 ? "lg:border-l-0" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""}`}>
                <span className="absolute left-0 top-0 h-[3px] w-10 bg-[#F4BA00] transition-all duration-500 group-hover:w-full" />
                <span className="grid h-11 w-11 place-items-center bg-brand/10 text-brand-fg transition group-hover:bg-[#F4BA00] group-hover:text-[#1A1A1A]">
                  <Icon size={21} />
                </span>
                <b className="mt-5 block whitespace-nowrap text-[22px] font-extrabold leading-none text-ink sm:text-[26px] lg:text-[24px] xl:text-[28px]">{f.value}</b>
                <span className="mt-2 block text-[14px] leading-snug text-ink/60">{f.label}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function HomeContact() {
  return (
    <section className="relative overflow-hidden bg-brand">
      <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rotate-12 bg-white/5" />
      <span className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 -rotate-12 border-[3px] border-[#F4BA00]/20" />
      <div className={`${CONTAINER} relative flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14`}>
        <Reveal from="left">
          <h2 className="text-[26px] font-bold text-white md:text-[34px]">Let&apos;s work together</h2>
          <p className="mt-2 max-w-2xl text-[16px] text-[#8FB8C8] md:text-[18px]">
            Looking for a product, a partner or more information? Our team is ready to help.
          </p>
        </Reveal>
        <Reveal from="right" className="flex flex-wrap items-center gap-5">
          <YellowButton href="/contact-us">Contact Us</YellowButton>
          <Link href="/services" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-white hover:text-[#F4BA00]">
            Our Services <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
