// components/Home/Hero.tsx
// Home page hero. "Home Hero" in Sanity decides which of the six designs is shown:
//   productShowcase · serviceBanner · storySlider · tradeRoutes · boldStatement · featuredProduct
// Texts come from that document; products, categories, numbers and photos come from the
// rest of the website (see heroData.ts), so the hero stays up to date by itself.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Package, PackageCheck, Ship, Store } from "lucide-react";
import { CONTAINER } from "@/components/Import/ImportsGrid";
import { FeaturedRotator, StorySlider, type Featured, type Slide } from "./HeroClient";
import { photo, pickProducts, randomProducts, type HeroButton, type HeroData, type HeroProduct, type HeroTexts } from "./heroData";

const CLIP = { clipPath: "polygon(0 0, 100% 14%, 100% 100%, 0 100%)" };

/* ---------------- small shared pieces ---------------- */

/** Title with the "highlighted words" in colour. */
function Title({ title, highlight, color }: { title?: string; highlight?: string; color: string }) {
  const t = title ?? "";
  const i = highlight ? t.indexOf(highlight) : -1;
  if (!highlight || i < 0) return <>{t}</>;
  return (
    <>
      {t.slice(0, i)}
      <span className={color}>{highlight}</span>
      {t.slice(i + highlight.length)}
    </>
  );
}

function Eyebrow({ children, dark = false, center = false }: { children?: React.ReactNode; dark?: boolean; center?: boolean }) {
  if (!children) return null;
  return (
    <span className={`inline-flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.16em] md:text-[13px] ${dark ? "text-white/75" : "text-ink/55"} ${center ? "justify-center" : ""}`}>
      <span className="h-[3px] w-8 bg-[#F4BA00]" /> {children}
    </span>
  );
}

function Buttons({ primary, secondary, dark = false, center = false }: { primary?: HeroButton; secondary?: HeroButton; dark?: boolean; center?: boolean }) {
  return (
    <div className={`mt-8 flex flex-wrap items-center gap-4 ${center ? "justify-center" : ""}`}>
      {primary?.label && primary.link && (
        <Link href={primary.link} style={CLIP} className="inline-flex items-center gap-2 bg-[#F4BA00] px-7 py-3.5 text-[16px] font-bold text-[#1A1A1A] transition hover:bg-brand hover:text-white">
          {primary.label} <ArrowRight size={17} />
        </Link>
      )}
      {secondary?.label && secondary.link && (
        <Link
          href={secondary.link}
          className={`inline-flex items-center gap-2 border-2 px-6 py-3 text-[16px] font-bold transition ${
            dark ? "border-white/50 text-white hover:border-[#F4BA00] hover:text-[#F4BA00]" : "border-brand-line/35 text-brand-fg hover:border-brand-line hover:bg-brand hover:text-white"
          }`}
        >
          {secondary.label}
        </Link>
      )}
    </div>
  );
}

/** Landscape photos (e.g. coal, dry fruits) fill the box; square product photos are shown whole. */
const isWide = (img?: HeroProduct["image"]) => {
  const m = (img?.asset?._ref ?? "").match(/-(\d+)x(\d+)-/);
  return m ? Number(m[1]) / Number(m[2]) > 1.15 : false;
};

function ProductPhoto({ p, sizes, className = "", pad = "" }: { p: HeroProduct; sizes: string; className?: string; pad?: string }) {
  const wide = isWide(p.image);
  return (
    <Image
      src={photo(p.image, 600)}
      alt={p.image?.alt || p.title || ""}
      fill
      sizes={sizes}
      className={`${wide ? "object-cover" : `object-contain mix-blend-multiply ${pad}`} ${className}`}
    />
  );
}

/* ================================================================== */
/* 1. Product Showcase                                                 */
/* ================================================================== */

function ProductShowcase({ d, data, years }: { d: HeroTexts & { products?: (HeroProduct | null)[] | null }; data: HeroData; years: number }) {
  const products = pickProducts(d.products, randomProducts(data), 4);
  // collage positions on large screens; a 2 × 2 grid on phones
  const pos = [
    "lg:left-0 lg:top-[5%] lg:h-[54%] lg:w-[55%]",
    "lg:right-0 lg:top-0 lg:h-[41%] lg:w-[41%]",
    "lg:right-[3%] lg:top-[46%] lg:h-[40%] lg:w-[40%]",
    "lg:left-[9%] lg:top-[64%] lg:h-[34%] lg:w-[46%]",
  ];
  const stats = [
    { n: `${years}+`, l: "Years of trade" },
    { n: data?.counts?.imports ?? 0, l: "Import products" },
    { n: data?.counts?.exports ?? 0, l: "Export products" },
  ];

  return (
    <section className="relative mt-16 overflow-hidden bg-gradient-to-b from-mist to-paper">
      <span className="pointer-events-none absolute -left-28 -top-16 h-80 w-80 rotate-12 bg-brand/[0.05]" />
      <span className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 -rotate-12 border-[3px] border-[#F4BA00]/35" />
      <div className={`${CONTAINER} relative grid grid-cols-1 items-center gap-12 py-14 lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-16`}>
        <div>
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-[38px] font-extrabold leading-[1.06] text-ink md:text-[52px] xl:text-[58px]">
            <Title title={d.title} highlight={d.highlight} color="text-brand-fg" />
          </h1>
          {d.text && <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink/65 md:text-[18px]">{d.text}</p>}
          <Buttons primary={d.primary} secondary={d.secondary} />
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-brand-line/10 pt-7">
            {stats.map((s) => (
              <div key={s.l}>
                <b className="block text-[30px] font-extrabold leading-none text-brand-fg md:text-[34px]">{s.n}</b>
                <span className="mt-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/50">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:block lg:h-[560px]">
          {products.map((p, i) => (
            <Link
              key={p._id}
              href={p.href}
              className={`group relative block aspect-square overflow-hidden border border-brand-line/10 bg-paper shadow-[0_24px_60px_rgba(2,88,123,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(2,88,123,0.22)] lg:absolute lg:aspect-auto ${pos[i]}`}
            >
              <ProductPhoto p={p} sizes="(max-width: 1023px) 45vw, 320px" pad="p-5" className="transition-transform duration-700 group-hover:scale-105" />
              {p.category && (
                <span className="absolute right-3 top-3 max-w-[85%] truncate bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-fg shadow-sm">
                  {p.category}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* 2. Service Banner                                                   */
/* ================================================================== */

function ServiceBanner({ d, data }: { d: HeroTexts & { image?: HeroProduct["image"] }; data: HeroData }) {
  const bg = photo(d.image ?? data?.sliderImage ?? undefined, 1920);
  const s = data?.services;
  const cut = (t?: string) => (t && t.length > 110 ? `${t.slice(0, 110).replace(/\s+\S*$/, "")}…` : t);
  const cards = [
    { icon: Ship, title: s?.imports?.title && s.imports.title !== "What We Import" ? s.imports.title : "Imports", text: cut(s?.imports?.text), n: data?.counts?.imports, href: "/services/imports" },
    { icon: PackageCheck, title: s?.exports?.title || "Exports", text: cut(s?.exports?.text), n: data?.counts?.exports, href: "/services/exports" },
    { icon: Store, title: s?.sales?.title || "Sales", text: cut(s?.sales?.text), n: data?.counts?.sales, href: "/services/sales" },
  ];

  return (
    <section className="relative mt-16 bg-paper pb-12">
      <div className="relative overflow-hidden bg-[#0b2733] pb-28 pt-16 md:pb-36 md:pt-24">
        {bg && <Image src={bg} alt="" fill priority sizes="100vw" className="object-cover" />}
        <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,63,89,0.97)_0%,rgba(2,88,123,0.9)_40%,rgba(2,88,123,0.35)_78%,rgba(2,88,123,0.15)_100%)]" />
        <span className="absolute inset-0 bg-deep/60 md:hidden" />
        <div className={`${CONTAINER} relative text-white`}>
          <Eyebrow dark>{d.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-[680px] text-[38px] font-extrabold leading-[1.05] md:text-[56px] xl:text-[64px]">
            <Title title={d.title} highlight={d.highlight} color="text-[#F4BA00]" />
          </h1>
          {d.text && <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-white/80 md:text-[19px]">{d.text}</p>}
          <Buttons primary={d.primary} secondary={d.secondary} dark />
        </div>
      </div>

      <div className={`${CONTAINER} relative z-10 -mt-20 grid grid-cols-1 shadow-[0_30px_70px_rgba(2,88,123,0.22)] md:-mt-24 md:grid-cols-3`}>
        {cards.map(({ icon: Icon, title, text, n, href }, i) => (
          <Link
            key={href}
            href={href}
            className={`group relative flex gap-4 border-b border-brand-line/10 p-6 transition md:border-b-0 md:border-r md:p-7 ${i === 0 ? "bg-[#F4BA00]" : "bg-paper hover:bg-mist"}`}
          >
            <span className="absolute left-0 top-0 h-[3px] w-12 bg-brand transition-all duration-500 group-hover:w-full" />
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand text-[#F4BA00]">
              <Icon size={22} />
            </span>
            <span>
              <span className="block text-[20px] font-bold text-ink">{title}</span>
              {text && <span className="mt-1 block text-[14px] leading-relaxed text-ink/70">{text}</span>}
              <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-brand-fg">
                {n ? `${n} products` : "Learn more"} <ArrowRight size={14} />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* 4. Story Slider (moving parts in HeroClient)                        */
/* ================================================================== */

function StoryHero({ d, data }: { d: NonNullable<NonNullable<HeroData>["hero"]>["storySlider"]; data: HeroData }) {
  const custom = (d?.slides ?? []).filter((s) => s.image && s.title);
  const slides: Slide[] = custom.length
    ? custom.map((s) => ({
        key: s._key,
        label: s.label || s.title || "",
        title: s.title || "",
        text: s.text,
        image: photo(s.image, 1400),
        thumb: photo(s.image, 240, 140),
        cover: true,
        buttonLabel: s.buttonLabel || "Learn More",
        link: s.link,
      }))
    : (data?.categories ?? [])
        .filter((c) => c.image)
        .slice(0, 5)
        .map((c) => {
          const wide = (c.image?.asset?._ref ?? "").match(/-(\d+)x(\d+)-/);
          const isPhoto = wide ? Number(wide[1]) / Number(wide[2]) > 1.2 : false; // landscape photos fill the area
          return {
            key: c._id,
            label: c.title || "",
            title: c.title || "",
            text: c.text,
            image: photo(c.image, isPhoto ? 1400 : 800),
            thumb: photo(c.image, 240),
            cover: isPhoto,
            buttonLabel: "View Products",
            link: c.href,
          };
        });
  if (!slides.length) return null;
  return <StorySlider slides={slides} seconds={d?.seconds ?? 6} />;
}

/* ================================================================== */
/* E. Trade Routes                                                     */
/* ================================================================== */

// Positions on the 800 × 560 map; Kabul is the centre of every route.
const KABUL = { x: 470, y: 280 };
const REGIONS: Record<string, { name: string; x: number; y: number }> = {
  europe: { name: "Europe", x: 150, y: 130 },
  turkey: { name: "Turkey", x: 230, y: 235 },
  iran: { name: "Iran", x: 360, y: 300 },
  gulf: { name: "Gulf", x: 310, y: 400 },
  pakistan: { name: "Pakistan", x: 520, y: 380 },
  india: { name: "India", x: 610, y: 440 },
  centralAsia: { name: "Central Asia", x: 440, y: 160 },
  russia: { name: "Russia", x: 380, y: 60 },
  china: { name: "China", x: 690, y: 210 },
};
// a few soft "continents" drawn as dots
const BLOBS: [number, number, number, number][] = [[200, 160, 150, 85], [400, 120, 170, 75], [430, 300, 120, 100], [640, 250, 150, 110], [600, 430, 70, 60], [320, 410, 80, 45], [210, 260, 70, 40]];
const DOTS = (() => {
  const out: [number, number][] = [];
  for (let x = 20; x < 800; x += 14) for (let y = 30; y < 540; y += 14) if (BLOBS.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) out.push([x, y]);
  return out;
})();

function TradeMap({ regions }: { regions: string[] }) {
  const list = regions.map((r) => REGIONS[r]).filter(Boolean);
  return (
    <svg viewBox="0 0 800 560" className="h-auto w-full" role="img" aria-label={`Trade routes from Kabul to ${list.map((r) => r.name).join(", ")}`}>
      <style>{`.route{stroke-dasharray:6 8;animation:routeMove 1.6s linear infinite}@keyframes routeMove{to{stroke-dashoffset:-28}}@keyframes pulse{0%{r:10;opacity:.9}100%{r:42;opacity:0}}.pulse{animation:pulse 2.2s ease-out infinite}@media (prefers-reduced-motion:reduce){.route,.pulse{animation:none}}`}</style>
      <g fill="rgba(255,255,255,0.2)">
        {DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2} />
        ))}
      </g>
      {list.map((r) => {
        const cx = (r.x + KABUL.x) / 2;
        const cy = Math.min(r.y, KABUL.y) - 70;
        return <path key={r.name} className="route" d={`M${KABUL.x} ${KABUL.y} Q ${cx} ${cy} ${r.x} ${r.y}`} fill="none" stroke="#F4BA00" strokeWidth={2.2} />;
      })}
      {list.map((r) => (
        <g key={`${r.name}-pin`}>
          <circle cx={r.x} cy={r.y} r={6} fill="#fff" />
          <text x={r.x} y={r.y - 14} textAnchor="middle" fontSize={15} fontWeight={600} fill="rgba(255,255,255,0.85)">
            {r.name}
          </text>
        </g>
      ))}
      <circle className="pulse" cx={KABUL.x} cy={KABUL.y} r={10} fill="none" stroke="#F4BA00" strokeWidth={3} />
      <circle cx={KABUL.x} cy={KABUL.y} r={10} fill="#F4BA00" stroke="#fff" strokeWidth={3} />
      <text x={KABUL.x + 18} y={KABUL.y + 6} fontSize={18} fontWeight={700} fill="#fff">
        Kabul
      </text>
    </svg>
  );
}

function TradeRoutes({ d, data, years }: { d: HeroTexts & { regions?: string[]; products?: (HeroProduct | null)[] | null }; data: HeroData; years: number }) {
  const regions = d.regions?.length ? d.regions : ["europe", "turkey", "gulf", "india", "china"];
  const pool = randomProducts(data);
  const auto = [pool.find((p) => p._type === "importProduct"), pool.find((p) => p._type === "exportProduct")].filter(Boolean) as HeroProduct[];
  const pins = pickProducts(d.products, auto, 2);
  const stats = [
    { n: `${years}+`, l: "Years in trade" },
    { n: data?.counts?.imports ?? 0, l: "Import products" },
    { n: data?.counts?.exports ?? 0, l: "Export products" },
    { n: regions.length, l: "Trade regions" },
  ];

  return (
    <section className="relative mt-16 overflow-hidden bg-[radial-gradient(circle_at_72%_40%,#046a93_0%,var(--color-brand)_35%,#01334a_100%)] text-white">
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(circle_at_70%_45%,black,transparent_75%)]" />
      <div className={`${CONTAINER} relative grid grid-cols-1 items-center gap-8 pb-10 pt-14 lg:min-h-[560px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pb-14 lg:pt-16`}>
        <div className="relative z-10">
          <Eyebrow dark>{d.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-[38px] font-extrabold leading-[1.05] md:text-[54px] xl:text-[60px]">
            <Title title={d.title} highlight={d.highlight} color="text-[#F4BA00]" />
          </h1>
          {d.text && <p className="mt-5 text-[17px] leading-relaxed text-[#8FB8C8] md:text-[18px]">{d.text}</p>}
          <Buttons primary={d.primary} secondary={d.secondary} dark />
        </div>
        <div className="relative lg:-mr-10">
          <TradeMap regions={regions} />
          {pins.map((p, i) => (
            <Link
              key={p._id}
              href={p.href}
              className={`absolute hidden items-center gap-3 bg-paper py-2.5 pl-2.5 pr-4 text-ink shadow-[0_14px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 sm:flex ${i === 0 ? "right-[16%] top-[2%]" : "bottom-[4%] right-0"}`}
            >
              <span className="relative block h-11 w-11">
                <ProductPhoto p={p} sizes="44px" />
              </span>
              <span>
                <b className="block max-w-[200px] truncate text-[14px]">{p.title}</b>
                <small className="text-[12px] text-ink/55">{p._type === "exportProduct" ? "Export" : p._type === "salesProduct" ? "Sales" : "Import"}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="relative border-t border-white/10 bg-[#01283a]/75">
        <div className={`${CONTAINER} grid grid-cols-2 md:grid-cols-4`}>
          {stats.map((s, i) => (
            <div key={s.l} className={`py-5 md:py-6 ${i % 2 ? "pl-5" : ""} md:pl-7 ${i === 0 ? "md:pl-0" : "md:border-l md:border-white/10"}`}>
              <b className="block text-[26px] font-extrabold md:text-[32px]">{s.n}</b>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 md:text-[12px]">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* F. Bold Statement                                                   */
/* ================================================================== */

function BoldStatement({ d, data }: { d: NonNullable<NonNullable<NonNullable<HeroData>["hero"]>["boldStatement"]>; data: HeroData }) {
  const products = pickProducts(d.products, randomProducts(data), 12);
  const label = (t: string) => (t === "exportProduct" ? "Exports" : t === "salesProduct" ? "Sales" : "Imports");
  const strip = [...products, ...products]; // twice, for an endless loop

  return (
    <section className="relative mt-16 overflow-hidden bg-paper pt-12 md:pt-16">
      <style>{`@keyframes heroMarquee{to{transform:translateX(-50%)}}.hero-strip{animation:heroMarquee 50s linear infinite}.hero-strip:hover{animation-play-state:paused}@media (prefers-reduced-motion:reduce){.hero-strip{animation:none}}`}</style>
      <span className="absolute inset-x-0 bottom-0 h-[45%] bg-mist" />
      <div className={`${CONTAINER} relative text-center`}>
        <Eyebrow center>{d.eyebrow}</Eyebrow>
        <h1 className="mt-5 text-[46px] font-extrabold leading-[0.98] tracking-tight text-ink sm:text-[72px] lg:text-[104px]">
          {d.line1 && <span className="text-transparent [-webkit-text-stroke:1.5px_var(--color-brand-fg)] sm:[-webkit-text-stroke:2px_var(--color-brand-fg)]">{d.line1}</span>}{" "}
          {d.line2 && (
            <span className="relative z-0 text-brand-fg">
              {d.line2}
              <span className="absolute inset-x-1 bottom-[0.06em] -z-10 h-[0.16em] bg-[#F4BA00]" />
            </span>
          )}
          {d.line3 && (
            <>
              <br />
              {d.line3}
            </>
          )}
        </h1>
        {d.text && <p className="mx-auto mt-6 max-w-[640px] text-[17px] leading-relaxed text-ink/65 md:text-[19px]">{d.text}</p>}
        <Buttons primary={d.primary} secondary={d.secondary} center />
      </div>

      {products.length > 0 && (
        <div className="relative mt-12 overflow-hidden pb-14 pt-2 md:mt-14">
          <div className="hero-strip flex w-max gap-4 md:gap-5">
            {strip.map((p, i) => (
              <Link
                key={`${p._id}-${i}`}
                href={p.href}
                tabIndex={i >= products.length ? -1 : undefined}
                aria-hidden={i >= products.length ? true : undefined}
                className={`group relative block w-[170px] shrink-0 border border-brand-line/10 bg-paper p-3 shadow-[0_18px_40px_rgba(2,88,123,0.1)] transition hover:-translate-y-1 md:w-[210px] md:p-4 ${i % 2 ? "md:translate-y-6" : ""}`}
              >
                <span className="absolute left-0 top-0 h-[3px] w-10 bg-[#F4BA00]" />
                <span className="relative block h-[120px] md:h-[150px]">
                  <ProductPhoto p={p} sizes="210px" className="transition-transform duration-500 group-hover:scale-105" />
                </span>
                <small className="mt-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-brand-fg md:text-[11px]">{label(p._type)}</small>
                <b className="mt-0.5 line-clamp-2 block text-left text-[13px] leading-snug text-ink md:text-[15px]">{p.title}</b>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ================================================================== */
/* G. Featured Product (rotation in HeroClient)                        */
/* ================================================================== */

function FeaturedProduct({ d, data, since }: { d: HeroTexts & { points?: string[]; seconds?: number; products?: (HeroProduct | null)[] | null }; data: HeroData; since: number }) {
  const items: Featured[] = pickProducts(d.products, randomProducts(data), 6).map((p) => ({
    key: p._id,
    title: p.title ?? "",
    category: p.category,
    image: photo(p.image, 700),
    href: p.href,
    specs: (p.specs ?? []).filter((s) => s.label && s.value).map((s) => ({ label: s.label!, value: s.value! })),
  }));

  return (
    <section className="relative mt-16 overflow-hidden bg-mist">
      {/* blue band with a yellow stripe (large screens) */}
      <span className="absolute inset-y-0 right-0 hidden w-[52%] bg-brand [clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)] lg:block" />
      <span className="absolute inset-y-0 right-0 hidden w-[52%] bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:20px_20px] [clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)] lg:block" />
      <span className="absolute inset-y-0 right-[49.5%] hidden w-7 -skew-x-[9deg] bg-[#F4BA00] lg:block" />

      <div className={`${CONTAINER} relative grid grid-cols-1 items-center gap-10 py-14 lg:min-h-[640px] lg:grid-cols-2 lg:py-16`}>
        <div>
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-[38px] font-extrabold leading-[1.06] text-ink md:text-[52px] xl:text-[58px]">
            <Title title={d.title} highlight={d.highlight} color="text-brand-fg" />
          </h1>
          {d.text && <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink/65 md:text-[18px]">{d.text}</p>}
          <Buttons primary={d.secondary} secondary={null} />
          {(d.points ?? []).length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {d.points!.map((t) => (
                <span key={t} className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-ink/65">
                  <span className="flex h-6 w-6 items-center justify-center bg-brand text-[#F4BA00]">
                    <Check size={14} />
                  </span>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="-mx-[5.5%] bg-brand px-[8%] py-10 sm:mx-0 sm:px-10 lg:bg-transparent lg:p-0 lg:pl-[10%]">
          {items.length ? (
            <FeaturedRotator items={items} seconds={d.seconds ?? 6} since={since} />
          ) : (
            <div className="flex aspect-square items-center justify-center text-white/60">
              <Package size={64} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function HomeHero({ data }: { data: HeroData }) {
  const h = data?.hero;
  const since = h?.foundedYear || 1978;
  const years = Math.max(1, new Date().getFullYear() - since);

  switch (h?.active) {
    case "serviceBanner":
      return <ServiceBanner d={h.serviceBanner ?? {}} data={data} />;
    case "storySlider":
      return <StoryHero d={h.storySlider} data={data} />;
    case "tradeRoutes":
      return <TradeRoutes d={h.tradeRoutes ?? {}} data={data} years={years} />;
    case "boldStatement":
      return <BoldStatement d={h.boldStatement ?? {}} data={data} />;
    case "featuredProduct":
      return <FeaturedProduct d={h.featuredProduct ?? {}} data={data} since={since} />;
    default:
      // also used when the Home Hero document does not exist yet
      return <ProductShowcase d={h?.productShowcase ?? DEFAULT_SHOWCASE} data={data} years={years} />;
  }
}

const DEFAULT_SHOWCASE: HeroTexts = {
  eyebrow: "Afghan Cart Corporation · Since 1978",
  title: "Your trusted partner in import, export & sales",
  highlight: "import, export",
  text: "Quality electrical equipment, home appliances, office supplies and the finest Afghan dry fruits — sourced, delivered and sold by a state-owned company you can rely on.",
  primary: { label: "Explore Our Services", link: "/services" },
  secondary: { label: "Contact Us", link: "/contact-us" },
};

