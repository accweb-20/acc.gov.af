// components/Import/ImportsGrid.tsx
// Building blocks shared by the Imports pages and the home page:
//   YellowButton     → the site's slanted yellow call-to-action
//   ProductGrid      → grid (or single-column list) of product cards
//   CategorySection  → one category block on the main Imports page
//   HomeImports      → the imports section on the home page
//   ptComponents     → Portable Text styles

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Boxes, ChevronLeft, ChevronRight, Layers, Package, PackageOpen, Sparkles } from "lucide-react";
import ImportCard from "./ImportCard";
import { CountUp, Reveal, ViewScope, ViewToggle } from "./Motion";
import RichText from "./RichText";
import {
  EYEBROW,
  IMPORTS_BASE,
  hasRich,
  imgUrl,
  type CategoryData,
  type RichValue,
  type ProductCardData,
  type SanityImg,
} from "@/lib/imports";

export const CONTAINER =
  "mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]";

export function YellowButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-2 bg-[#F4BA00] px-6 py-2.5 text-[15px] font-bold text-[#1A1A1A] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(244,186,0,0.35)] ${className}`}
      style={{ clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)" }}
    >
      {children}
      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/* ---------------------------------------------------------------- */

// Grid columns: 2 per row on phones (gallery), 1 per row in list view.
const GRID_COLS = {
  2: "grid grid-cols-2 gap-3 sm:gap-5 group-data-[view=list]/view:grid-cols-1 sm:group-data-[view=auto]/view:grid-cols-1",
  3: "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 group-data-[view=list]/view:grid-cols-1 sm:group-data-[view=auto]/view:grid-cols-1",
  4: "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 group-data-[view=list]/view:grid-cols-1 sm:group-data-[view=auto]/view:grid-cols-1",
} as const;

export function ProductGrid({
  products,
  categorySlug,
  cols = 3,
  priorityCount = 0,
  base = IMPORTS_BASE,
  framed = false,
}: {
  products: ProductCardData[];
  /** category pages: square framed photos in list view */
  framed?: boolean;
  categorySlug?: string;
  base?: string;
  /** gallery columns on large screens */
  cols?: 2 | 3 | 4;
  /** how many of the first images load immediately (above the fold) */
  priorityCount?: number;
}) {
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-brand-line/25 bg-paper px-6 py-14 text-center">
        <PackageOpen size={40} strokeWidth={1.4} className="text-brand-fg/50" />
        <p className="text-[16px] font-medium text-ink">Products will be added soon.</p>
        <p className="max-w-md text-[14px] text-ink/60">
          Looking for something specific? Contact our sales team and we will source it for you.
        </p>
      </div>
    );
  }

  return (
    <div className={GRID_COLS[cols]}>
      {products.map((p, i) => (
        <Reveal key={p._id} delay={(i % 4) * 90} className="h-full">
          <ImportCard product={p} categorySlug={categorySlug} base={base} priority={i < priorityCount} framed={framed} />
        </Reveal>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */

/** Compact product list for sidebars ("You may like"). Randomly picked on the server. */
export type MiniProduct = {
  _id: string;
  title?: string;
  slug?: string;
  image?: SanityImg;
  category?: { title?: string; slug?: string } | null;
  spec?: { label?: string; value?: string } | null;
};

export function YouMayLike({
  products,
  title = "You May Like",
  base = IMPORTS_BASE,
  className = "",
}: {
  products: MiniProduct[];
  title?: string;
  base?: string;
  className?: string;
}) {
  const items = products.filter((p) => p.slug && p.category?.slug);
  if (!items.length) return null;

  return (
    <aside aria-label={title} className={`border border-brand-line/10 bg-paper ${className}`}>
      <h2 className="flex items-center gap-2 bg-brand px-4 py-3 text-[15px] font-semibold uppercase tracking-wide text-white">
        <Sparkles size={16} className="text-[#F4BA00]" /> {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-1 xl:gap-0 xl:p-0">
        {items.map((p) => {
          const src = imgUrl(p.image, 240);
          return (
            <li key={p._id} className="xl:border-b xl:border-brand-line/8 xl:last:border-b-0">
              <Link
                href={`${base}/${p.category!.slug}/${p.slug}`}
                className="group flex h-full flex-col gap-2 border border-brand-line/10 p-2 transition duration-300 hover:border-brand-line/30 hover:shadow-[0_8px_20px_rgba(2,88,123,0.12)] xl:flex-row xl:items-center xl:gap-3 xl:border-0 xl:px-4 xl:py-3 xl:hover:bg-mist xl:hover:shadow-none"
              >
                <span className="relative block aspect-square w-full shrink-0 overflow-hidden bg-tint xl:h-16 xl:w-16">
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 1199px) 45vw, 64px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-brand-fg/30">
                      <Package size={22} />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand-fg xl:text-[14px]">
                    {p.title}
                  </span>
                  {p.spec?.label && p.spec?.value ? (
                    <span className="mt-0.5 block truncate text-[12px] text-ink/50">
                      {p.spec.label}: {p.spec.value}
                    </span>
                  ) : p.category?.title ? (
                    <span className="mt-0.5 block truncate text-[12px] text-ink/50">{p.category.title}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/* ---------------------------------------------------------------- */

export function CategorySection({
  category,
  index,
  base = IMPORTS_BASE,
}: {
  category: CategoryData;
  index: number;
  base?: string;
}) {
  const products = category.products ?? [];
  const total = category.count ?? products.length;
  const href = `${base}/${category.slug}`;
  const tinted = index % 2 === 1;

  return (
    <section
      id={category.slug}
      className={`scroll-mt-28 py-14 md:py-16 ${tinted ? "bg-smoke" : "bg-paper"}`}
      aria-labelledby={`cat-${category._id}`}
    >
      <div className={CONTAINER}>
        <Reveal>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[13px] font-bold tracking-[0.2em] text-[#F4BA00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px w-10 bg-brand/30" />
                <span className={`inline-flex items-center gap-1.5 ${EYEBROW}`}>
                  <Boxes size={14} /> {total} {total === 1 ? "Product" : "Products"}
                </span>
              </div>
              <h2
                id={`cat-${category._id}`}
                className="text-[30px] font-bold leading-tight text-brand-fg md:text-[40px]"
              >
                {category.title}
              </h2>
              {hasRich(category.description) && (
                <div className="mt-3 text-[16px] leading-relaxed text-ink/70">
                  <RichText value={category.description} />
                </div>
              )}
            </div>

            {total > 0 && (
              <YellowButton href={href}>
                Show All{total > products.length ? ` (${total})` : ""}
              </YellowButton>
            )}
          </div>
        </Reveal>

        <ProductGrid products={products} categorySlug={category.slug} base={base} priorityCount={index === 0 ? 2 : 0} />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

// Category cards: gallery = mosaic on top (2 per row on phones), list = mosaic on the left.
// Unlike products, categories default to the gallery layout on every screen.
const CATEGORY_COLS =
  "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 group-data-[view=list]/view:grid-cols-1 lg:group-data-[view=list]/view:grid-cols-2";
const CATEGORY_CARD =
  "group flex h-full flex-col border border-brand-line/10 bg-paper transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(2,88,123,0.18)] group-data-[view=list]/view:flex-row";
const CATEGORY_MEDIA =
  "grid aspect-square grid-cols-2 grid-rows-2 gap-px overflow-hidden bg-brand/10 group-data-[view=list]/view:aspect-auto group-data-[view=list]/view:min-h-[120px] group-data-[view=list]/view:w-[120px] group-data-[view=list]/view:self-stretch group-data-[view=list]/view:shrink-0 sm:group-data-[view=list]/view:w-[200px]";

export type HomeImportsData = {
  categories?: (CategoryData & { images?: { image?: SanityImg }[] })[];
  categoryCount?: number;
  productCount?: number;
};

export function HomeImports({
  title,
  description,
  data,
  eyebrow = "Imports",
  buttonLabel = "Explore All Imports",
  id,
  className = "bg-smoke",
  base = IMPORTS_BASE,
  fallbackTitle = "What We Import",
}: {
  base?: string;
  fallbackTitle?: string;
  title?: string | null;
  description?: RichValue;
  data: HomeImportsData | null;
  eyebrow?: string;
  buttonLabel?: string | null;
  id?: string;
  className?: string;
}) {
  const categories = (data?.categories ?? []).filter((c) => c.slug);
  if (!categories.length) return null;

  return (
    <section id={id} className={`relative scroll-mt-24 overflow-hidden py-16 md:py-20 ${className}`}>
      {/* decorative shapes */}
      <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rotate-12 bg-brand/5" />
      <span className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 -rotate-12 bg-[#F4BA00]/10" />

      <div className={`${CONTAINER} relative`}>
        <Reveal>
          <div className="mb-10 grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className={`inline-flex items-center gap-2 ${EYEBROW}`}>
                <span className="h-[3px] w-8 bg-[#F4BA00]" /> {eyebrow}
              </span>
              <h2 className="mt-2 text-[30px] font-extrabold leading-tight text-ink md:text-[52px]">
                {title || fallbackTitle}
              </h2>
              {hasRich(description) && (
                <div className="mt-4 text-[16px] leading-relaxed text-ink/70 md:text-[18px]">
                  <RichText value={description} />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center bg-brand text-[#F4BA00]">
                  <Layers size={22} />
                </span>
                <div>
                  <div className="text-[28px] font-bold leading-none text-brand-fg">
                    <CountUp value={data?.categoryCount ?? categories.length} />
                  </div>
                  <div className={EYEBROW}>Categories</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center bg-brand text-[#F4BA00]">
                  <Package size={22} />
                </span>
                <div>
                  <div className="text-[28px] font-bold leading-none text-brand-fg">
                    <CountUp value={data?.productCount ?? 0} />
                  </div>
                  <div className={EYEBROW}>Products</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <ViewScope storageKey={`acc-categories-view-${id ?? "home"}`} autoAs="grid">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className={EYEBROW}>Browse categories</span>
            <ViewToggle />
          </div>

          <div className={CATEGORY_COLS}>
            {categories.map((c, i) => {
              const imgs = (c.images ?? []).map((x) => imgUrl(x.image ?? undefined, 320)).filter(Boolean) as string[];
              // The category's own (square) image is used when set; otherwise a 2×2 mosaic of its products
              const own = imgUrl(c.image, 640);
              return (
                <Reveal key={c._id} delay={(i % 3) * 110} className="h-full">
                  <Link href={`${base}/${c.slug}`} className={CATEGORY_CARD}>
                    {/* Square image: the category image, or a 2×2 mosaic of its product images */}
                    <div className={CATEGORY_MEDIA}>
                      {own ? (
                        <div className="relative col-span-2 row-span-2 overflow-hidden bg-paper">
                          <Image
                            src={own}
                            alt={c.image?.alt || c.title || ""}
                            fill
                            sizes="(max-width: 574px) 50vw, 380px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : [0, 1, 2, 3].map((k) =>
                        imgs[k] ? (
                          <div key={k} className="relative overflow-hidden bg-paper">
                            <Image
                              src={imgs[k]}
                              alt=""
                              fill
                              sizes="(max-width: 574px) 25vw, 190px"
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div key={k} className="flex items-center justify-center bg-tint text-brand-fg/25">
                            <Package size={22} strokeWidth={1.3} />
                          </div>
                        )
                      )}
                    </div>

                    <div className="relative flex min-w-0 flex-1 flex-col p-3 sm:p-5">
                      <span className="absolute left-0 top-0 h-[3px] w-12 bg-[#F4BA00] transition-all duration-500 group-hover:w-full" />
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-brand-fg sm:text-[20px]">
                          {c.title}
                        </h3>
                        <span className="hidden h-9 w-9 shrink-0 items-center justify-center border border-brand-line/20 text-brand-fg transition duration-300 group-hover:rotate-45 group-hover:border-brand-line group-hover:bg-brand group-hover:text-white sm:flex">
                          <ArrowUpRight size={18} />
                        </span>
                      </div>
                      {hasRich(c.description) && (
                        <div className="mt-2 hidden sm:block">
                          <p className="line-clamp-2 text-[14px] leading-[1.6] text-ink/65">
                            <RichText value={c.description} inline noLinks />
                          </p>
                        </div>
                      )}
                      <span className={`mt-auto inline-flex items-center gap-1.5 pt-3 sm:pt-4 ${EYEBROW}`}>
                        <Boxes size={14} /> {c.count ?? 0} {(c.count ?? 0) === 1 ? "Product" : "Products"}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </ViewScope>

        <Reveal delay={150}>
          <div className="mt-10 flex justify-center">
            <YellowButton href={base}>{buttonLabel || "Explore All"}</YellowButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

/** Page numbers with previous/next. Page 1 uses the plain URL. */
export function Pagination({
  page,
  pages,
  baseHref,
  anchor = "products",
}: {
  page: number;
  pages: number;
  baseHref: string;
  anchor?: string;
}) {
  if (pages <= 1) return null;
  const href = (n: number) => `${baseHref}${n > 1 ? `?page=${n}` : ""}#${anchor}`;

  // 1 … 4 5 6 … 12
  const nums: (number | "…")[] = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) nums.push(n);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  const box =
    "inline-flex h-10 min-w-10 items-center justify-center border px-3 text-[15px] font-medium transition duration-300";
  const idle = "border-brand-line/20 bg-paper text-ink hover:-translate-y-0.5 hover:border-brand-line hover:text-brand-fg";
  const off = "pointer-events-none border-ink/10 bg-paper text-ink/30";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-col items-center gap-3">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          <Link href={href(page - 1)} aria-label="Previous page" aria-disabled={page <= 1} className={`${box} gap-1 ${page <= 1 ? off : idle}`}>
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
          </Link>
        </li>
        {nums.map((n, i) =>
          n === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-ink/40">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                className={`${box} ${n === page ? "border-brand-line bg-brand text-white" : idle}`}
              >
                {n}
              </Link>
            </li>
          )
        )}
        <li>
          <Link href={href(page + 1)} aria-label="Next page" aria-disabled={page >= pages} className={`${box} gap-1 ${page >= pages ? off : idle}`}>
            <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
          </Link>
        </li>
      </ul>
      <span className={EYEBROW}>
        Page {page} of {pages}
      </span>
    </nav>
  );
}

/* Portable Text styles (kept here for older imports) */
export { ptComponents } from "./RichText";
