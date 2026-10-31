// components/Import/ImportCard.tsx
// Product card with two layouts, switched by the List / Gallery buttons (see ViewScope in Motion.tsx):
//   Gallery → image on top, title, short info, "Send Inquiry" (2 per row on phones)
//   List    → image on the left, details on the right (highlights + key specs on larger screens)
// The whole card opens the product; the "Send Inquiry" button jumps straight to the inquiry form.
// Outside a ViewScope (e.g. "Related products") the card always uses the gallery layout.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Images, ListChecks, Package, Send, Star } from "lucide-react";
import { EYEBROW, IMG, IMPORTS_BASE, cardText, hasRich, imgUrl, type ProductCardData } from "@/lib/imports";
import RichText from "./RichText";

// "list" layout = chosen List view, or the automatic default on screens ≥ 575px
const ROOT =
  "group/card relative flex h-full flex-col overflow-hidden border border-brand-line/10 bg-paper shadow-[0_2px_10px_rgba(2,88,123,0.07)] transition duration-300 ease-out hover:-translate-y-1 hover:border-brand-line/30 hover:shadow-[0_16px_36px_rgba(2,88,123,0.18)] " +
  "group-data-[view=list]/view:flex-row sm:group-data-[view=auto]/view:flex-row";
// Extra for the default (Imports page) card: a minimum height in list view
const ROOT_FILL = " sm:group-data-[view=list]/view:min-h-[220px] sm:group-data-[view=auto]/view:min-h-[220px]";

// Gallery view: square photo on top. List view: the photo fills the full height of the card
// on the left (object-cover), so there is no empty space above or below it.
const MEDIA =
  "relative aspect-square w-full shrink-0 overflow-hidden border-b border-brand-line/10 bg-paper " +
  "group-data-[view=list]/view:aspect-auto group-data-[view=list]/view:min-h-[120px] group-data-[view=list]/view:w-[120px] group-data-[view=list]/view:self-stretch group-data-[view=list]/view:border-b-0 group-data-[view=list]/view:border-r " +
  "sm:group-data-[view=list]/view:w-[220px] md:group-data-[view=list]/view:w-[250px] " +
  "sm:group-data-[view=auto]/view:aspect-auto sm:group-data-[view=auto]/view:w-[220px] sm:group-data-[view=auto]/view:self-stretch sm:group-data-[view=auto]/view:border-b-0 sm:group-data-[view=auto]/view:border-r md:group-data-[view=auto]/view:w-[250px]";

const BODY =
  "flex min-w-0 flex-1 flex-col p-3 sm:p-4 sm:group-data-[view=list]/view:p-6 sm:group-data-[view=auto]/view:p-6";

const TITLE =
  "line-clamp-2 text-[14px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover/card:text-brand-fg sm:text-[16px] sm:group-data-[view=list]/view:text-[19px] sm:group-data-[view=auto]/view:text-[19px]";

// Only in the list layout on screens ≥ 575px
const LIST_ONLY = "hidden sm:group-data-[view=list]/view:block sm:group-data-[view=auto]/view:block";

const DETAILS_LINK =
  "hidden items-center gap-1.5 text-[14px] font-semibold text-brand-fg sm:group-data-[view=list]/view:inline-flex sm:group-data-[view=auto]/view:inline-flex";

const INQUIRY =
  "relative z-10 inline-flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap bg-[#F4BA00] px-3 py-2 text-[13px] font-bold text-[#1A1A1A] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(244,186,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-fg " +
  "group-data-[view=list]/view:w-auto sm:group-data-[view=auto]/view:w-auto";

export default function ImportCard({
  product,
  categorySlug,
  base = IMPORTS_BASE,
  priority = false,
  framed = false,
}: {
  product: ProductCardData;
  /** category pages: no minimum card height in list view */
  framed?: boolean;
  categorySlug?: string;
  /** section address: /services/imports, /services/exports or /services/sales */
  base?: string;
  /** true for the first cards on a page (loads the image immediately) */
  priority?: boolean;
}) {
  const cat = categorySlug ?? product.category?.slug ?? "";
  const href = product.slug && cat ? `${base}/${cat}/${product.slug}` : base;
  const title = product.title ?? "Untitled product";
  // Square crop (follows the Sanity hotspot) so the photo always fills its box
  const src = imgUrl(product.image, IMG.card);
  const text = cardText(product);
  const highlights = (product.highlights ?? []).filter(Boolean).slice(0, 3);
  const specs = (product.specs ?? []).filter((s) => s?.label && s?.value).slice(0, 4);
  const hasDetails = !!text || highlights.length > 0 || specs.length > 0;
  const imageCount = product.imageCount ?? 0;
  const firstSpec = specs[0];

  return (
    <article className={framed ? ROOT : ROOT + ROOT_FILL}>
      {/* Accent line that grows on hover */}
      <span className="absolute left-0 top-0 z-10 h-[3px] w-0 bg-[#F4BA00] transition-all duration-500 group-hover/card:w-full" />

      {/* ---------- Image ---------- */}
      <div className={MEDIA}>
        {src ? (
          <Image
            src={src}
            alt={product.image?.alt || title}
            fill
            priority={priority}
            sizes="(max-width: 574px) 50vw, (max-width: 991px) 260px, 260px"
            className={`object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-tint text-brand-fg/45">
            <Package size={40} strokeWidth={1.3} />
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-ink/45 sm:block">Image coming soon</span>
          </div>
        )}

        {product.featured && (
          <span
            className="absolute left-0 top-2 inline-flex items-center gap-1 bg-[#F4BA00] py-0.5 pl-2 pr-3 text-[10px] font-bold uppercase tracking-wide text-[#1A1A1A] sm:top-3 sm:py-1 sm:pl-3 sm:pr-4 sm:text-[11px]"
            style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
          >
            <Star size={11} fill="#1A1A1A" /> Featured
          </span>
        )}

        {imageCount > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-[#1A1A1A]/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
            <Images size={12} /> {imageCount}
          </span>
        )}
      </div>

      {/* ---------- Details ---------- */}
      <div className={BODY}>
        {product.category?.title && !categorySlug && (
          <span className={`mb-1 hidden truncate sm:block ${EYEBROW}`}>{product.category.title}</span>
        )}

        <h3 className={TITLE}>
          {/* Stretched link: the whole card is clickable */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-fg"
          >
            {title}
          </Link>
        </h3>
        <span className="mt-2 hidden h-[3px] w-10 shrink-0 bg-[#F4BA00] transition-all duration-500 group-hover/card:w-16 sm:block" />

        {/* Phones: one key fact under the title */}
        {firstSpec && (
          <p className="mt-1 truncate text-[12px] text-ink/55 sm:hidden">
            {firstSpec.label}: <span className="font-medium text-ink/80">{firstSpec.value}</span>
          </p>
        )}

        {text && (
          <div className="mt-2 hidden sm:block">
            <p className="line-clamp-2 text-[14px] leading-[1.6] text-ink/65 sm:group-data-[view=list]/view:text-[15px]">
              {hasRich(product.shortDescription) ? <RichText value={product.shortDescription} inline noLinks /> : text}
            </p>
          </div>
        )}

        {highlights.length > 0 && (
          <div className={`mt-3 ${LIST_ONLY}`}>
            <ul className="flex flex-wrap gap-2" aria-label="Highlights">
              {highlights.map((h, i) => (
                <li
                  key={i}
                  className="inline-flex max-w-full items-center gap-1 bg-tint px-2.5 py-1 text-[13px] font-medium leading-[1.4] text-brand-fg transition-colors duration-300 group-hover/card:bg-tint-strong"
                >
                  <Check size={12} strokeWidth={3} className="shrink-0" />
                  <span className="truncate">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {specs.length > 0 && (
          <div className={`mt-3 ${LIST_ONLY}`}>
            <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {specs.map((s, i) => (
                <div key={s._key ?? i} className="min-w-0 border-l-2 border-[#F4BA00] bg-smoke px-2.5 py-1.5">
                  <dt className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-ink/45">{s.label}</dt>
                  <dd className="truncate text-[14px] font-medium leading-[1.5] text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {!hasDetails && (
          <p className="mt-2 hidden items-start gap-2 text-[13.5px] leading-relaxed text-ink/55 sm:flex">
            <ListChecks size={16} className="mt-0.5 shrink-0 text-brand-fg/50" />
            Contact our sales team for specifications, availability and pricing.
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3 sm:pt-4">
          <span className={DETAILS_LINK} aria-hidden="true">
            View Details
            <ArrowRight size={16} className="transition-transform duration-300 group-hover/card:translate-x-1" />
          </span>
          <Link href={`${href}#inquiry`} className={INQUIRY} aria-label={`Send an inquiry about ${title}`}>
            <Send size={14} className="shrink-0" /> Send Inquiry
          </Link>
        </div>
      </div>
    </article>
  );
}
