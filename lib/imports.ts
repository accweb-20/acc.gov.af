// lib/imports.ts
// Shared types, GROQ queries and image helper for the Imports section
// (/services/imports, /services/imports/[category], /services/imports/[category]/[product]).

import { urlFor } from "@/sanity/lib/image";

export const IMPORTS_BASE = "/services/imports";

/* ---------------- the three sections (Imports, Exports, Sales) ---------------- */

export type ServiceKey = "imports" | "exports" | "sales";

export type ServiceConfig = {
  key: ServiceKey;
  base: string; // "/services/imports"
  label: string; // "Imports"
  singular: string; // "Import"
  pageType: string; // Sanity document types
  categoryType: string;
  productType: string;
  /** small texts that differ per section */
  promises: { title: string; text: string }[];
  ctaTitle: string;
  ctaText: string;
  categoryCta: string; // "Need a product in {category} that is not listed?"
  empty: string;
};

export const SERVICES: Record<ServiceKey, ServiceConfig> = {
  imports: {
    key: "imports",
    base: "/services/imports",
    label: "Imports",
    singular: "Import",
    pageType: "import",
    categoryType: "importCategory",
    productType: "importProduct",
    promises: [
      { title: "Quality Assured", text: "Products sourced from trusted, verified suppliers." },
      { title: "Reliable Supply", text: "Planned logistics from origin to Afghanistan." },
      { title: "Direct Support", text: "Our sales team answers every inquiry personally." },
    ],
    ctaTitle: "Can’t find the product you need?",
    ctaText: "Tell us what you are looking for and our sales team will help you source it.",
    categoryCta: "Need a product in {category} that is not listed?",
    empty: "Import products will be published soon.",
  },
  exports: {
    key: "exports",
    base: "/services/exports",
    label: "Exports",
    singular: "Export",
    pageType: "export",
    categoryType: "exportCategory",
    productType: "exportProduct",
    promises: [
      { title: "Genuine Afghan Origin", text: "Products sourced directly from Afghan growers and producers." },
      { title: "Export-Ready Packing", text: "Sorted, graded and packed to buyer and market requirements." },
      { title: "Full Documentation", text: "Certificates of origin, phytosanitary and customs papers handled." },
    ],
    ctaTitle: "Looking for an Afghan product we have not listed?",
    ctaText: "Tell us the product, quantity and destination – we will prepare an offer.",
    categoryCta: "Need {category} in a specific grade or packing?",
    empty: "Export products will be published soon.",
  },
  sales: {
    key: "sales",
    base: "/services/sales",
    label: "Sales",
    singular: "Sales",
    pageType: "sales",
    categoryType: "salesCategory",
    productType: "salesProduct",
    promises: [
      { title: "Genuine Products", text: "Quality goods imported by Afghan Cart Corporation." },
      { title: "Wholesale & Retail", text: "Single items or bulk orders for offices and shops." },
      { title: "Local Support", text: "Our sales team in Kabul answers every inquiry." },
    ],
    ctaTitle: "Need something that is not listed?",
    ctaText: "Tell us what you need and our sales team will check availability for you.",
    categoryCta: "Need more items from {category}?",
    empty: "Products will be published soon.",
  },
};

/** Default breadcrumbs for a section page, its categories and its products. */
export function sectionCrumbs(cfg: ServiceConfig): { page: Crumb[]; category: Crumb[] } {
  const page = [
    { _key: "home", label: "Home", href: "/" },
    { _key: "services", label: "Services", href: "/services" },
  ];
  return { page, category: [...page, { _key: cfg.key, label: cfg.label, href: cfg.base }] };
}

/* ---------------- breadcrumbs ---------------- */

export type Crumb = { _key?: string; label?: string; href?: string };

// Used when nothing is set in Sanity (keep in sync with sanity/schemaTypes/import.ts)
export const DEFAULT_CRUMBS: Record<"servicesPage" | "importsPage" | "category" | "product", Crumb[]> = {
  servicesPage: [{ _key: "home", label: "Home", href: "/" }],
  importsPage: [
    { _key: "home", label: "Home", href: "/" },
    { _key: "services", label: "Services", href: "/services" },
  ],
  category: [
    { _key: "home", label: "Home", href: "/" },
    { _key: "services", label: "Services", href: "/services" },
    { _key: "imports", label: "Imports", href: IMPORTS_BASE },
  ],
  product: [
    { _key: "home", label: "Home", href: "/" },
    { _key: "services", label: "Services", href: "/services" },
    { _key: "imports", label: "Imports", href: IMPORTS_BASE },
  ],
};

/** First list that has at least one valid link wins. */
export function pickCrumbs(...lists: (Crumb[] | null | undefined)[]): Crumb[] {
  for (const l of lists) {
    const ok = (l ?? []).filter((c) => c?.label && c?.href);
    if (ok.length) return ok;
  }
  return [];
}

/* ---------------- types ---------------- */

export type SanityImg = {
  _key?: string;
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  caption?: string;
  hotspot?: unknown;
  crop?: unknown;
} | null;

export type Spec = { _key?: string; label?: string; value?: string };

export type ProductCardData = {
  _id: string;
  title?: string;
  slug?: string;
  shortDescription?: RichValue;
  excerpt?: string;
  image?: SanityImg;
  imageCount?: number;
  highlights?: string[] | null;
  specs?: Spec[] | null;
  featured?: boolean;
  category?: { title?: string; slug?: string } | null;
};

export type CategoryData = {
  _id: string;
  title?: string;
  slug?: string;
  description?: RichValue;
  image?: SanityImg;
  count?: number;
  products?: ProductCardData[];
};

export type ProductDetail = ProductCardData & {
  images?: SanityImg[] | null;
  description?: unknown[] | null;
  specifications?: Spec[] | null;
  seo?: { seoTitle?: string; metaDescription?: string } | null;
};

/* ---------------- image helper ---------------- */

// Largest size requested for each place. next/image + the Sanity loader then
// download only the width each screen needs (e.g. 320px on a phone).
export const IMG = {
  card: 520, // product cards (displayed up to 260×260)
  main: 800, // product page gallery (square; uploads are 400×400)
  thumb: 160, // gallery thumbnails
  full: 800, // full-screen viewer
} as const;

export function productImg(source: SanityImg | undefined, size: number): string | null {
  if (!source?.asset) return null;
  try {
    return urlFor(source as never)
      .width(size)
      .height(size)
      .fit("fill")
      .bg("ffffff")
      .auto("format")
      .quality(65)
      .url();
  } catch {
    return null;
  }
}

export function imgUrl(source: SanityImg | undefined, w: number, h?: number): string | null {
  if (!source?.asset) return null;
  try {
    let b = urlFor(source as never).width(w).auto("format").quality(65);
    if (h) b = b.height(h).fit("crop");
    return b.url();
  } catch {
    return null;
  }
}

/* Shared label style: light, bold, uppercase (used for all sub-titles). */
export const EYEBROW = "text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45";

/* ---------------- GROQ ---------------- */

// Lower "order" first, featured items first, newest first.
const productOrder = `order(featured desc, coalesce(order, 9999) asc, _createdAt desc)`;

export const productCardProjection = `{
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "excerpt": pt::text(description),
  "image": images[0],
  "imageCount": count(images),
  "highlights": highlights[0...3],
  "specs": specifications[0...2]{_key, label, value},
  featured,
  "category": category->{title, "slug": slug.current}
}`;

/** Small projection for sidebar lists ("You may like"). */
export const miniProductProjection = `{
  _id,
  title,
  "slug": slug.current,
  "image": images[0],
  "category": category->{title, "slug": slug.current},
  "spec": specifications[0]{label, value}
}`;

/** Pick `n` random items (a fresh mix every time the page is regenerated). */
export function pickRandom<T>(items: T[] | null | undefined, n: number): T[] {
  const a = [...(items ?? [])];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/** Product status (set in Sanity): only "active" products are listed; "draft" products are hidden
 *  everywhere; "archived" products are not listed but their page still opens (with a notice).
 *  Products without a status count as active. */
export const LIVE = `!(status in ["draft", "archived"])`;
export const NOT_DRAFT = `status != "draft"`;

export const servicePageQuery = (cfg: ServiceConfig) => `*[_type == "${cfg.pageType}"][0]{
  title,
  subtitle,
  breadcrumbLinks[]{_key, label, href},
  breadcrumbLabel,
  "headerMessage": coalesce(headerDescription, headerMessage),
  introTitle,
  introMessage,
  introBackground,
  itemsPerCategory,
  categoriesTitle,
  categoriesMessage,
  bodyTitle,
  bodyMessage,
  bodyBackground,
  seo
}`;

export const sectionCategoriesQuery = (cfg: ServiceConfig) => `*[_type == "${cfg.categoryType}"] | order(coalesce(order, 9999) asc, title asc){
  _id,
  title,
  "slug": slug.current,
  description,
  image,
  "count": count(*[_type == "${cfg.productType}" && ${LIVE} && references(^._id)]),
  "products": *[_type == "${cfg.productType}" && ${LIVE} && references(^._id)] | ${productOrder} [0...$limit] ${productCardProjection}
}`;

export const sectionCategoryBySlugQuery = (cfg: ServiceConfig) => `*[_type == "${cfg.categoryType}" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  image,
  seo,
  breadcrumbLinks[]{_key, label, href},
  "defaultCrumbs": *[_type == "${cfg.pageType}"][0].categoryBreadcrumbLinks[]{_key, label, href},
  "count": count(*[_type == "${cfg.productType}" && ${LIVE} && references(^._id)]),
  "products": *[_type == "${cfg.productType}" && ${LIVE} && references(^._id)] | ${productOrder} [$start...$end] ${productCardProjection}
}`;

/** Products per page on category pages. */
export const PRODUCTS_PER_PAGE = 10;

export const sectionCategoryListQuery = (cfg: ServiceConfig) => `*[_type == "${cfg.categoryType}"] | order(coalesce(order, 9999) asc, title asc){
  _id,
  title,
  "slug": slug.current,
  "count": count(*[_type == "${cfg.productType}" && ${LIVE} && references(^._id)])
}`;

export const sectionProductQuery = (cfg: ServiceConfig) => `*[_type == "${cfg.productType}" && ${NOT_DRAFT} && slug.current == $product && category->slug.current == $category][0]{
  _id,
  title,
  status,
  "slug": slug.current,
  shortDescription,
  images,
  description,
  highlights,
  specifications[]{_key, label, value},
  seo,
  breadcrumbLinks[]{_key, label, href},
  "defaultCrumbs": *[_type == "${cfg.pageType}"][0].productBreadcrumbLinks[]{_key, label, href},
  "category": category->{_id, title, "slug": slug.current},
  "related": *[_type == "${cfg.productType}" && ${LIVE} && category._ref == ^.category._ref && _id != ^._id] | ${productOrder} [0...4] ${productCardProjection},
  "pool": *[_type == "${cfg.productType}" && ${LIVE} && _id != ^._id && defined(slug.current)] | order(_updatedAt desc) [0...40] ${miniProductProjection}
}`;

export const sectionProductParamsQuery = (cfg: ServiceConfig) =>
  `*[_type == "${cfg.productType}" && ${NOT_DRAFT} && defined(slug.current) && defined(category->slug.current)]{ "product": slug.current, "category": category->slug.current }`;

// Older names (Imports section)
export const importPageQuery = servicePageQuery(SERVICES.imports);
export const categoriesWithProductsQuery = sectionCategoriesQuery(SERVICES.imports);
export const categoryBySlugQuery = sectionCategoryBySlugQuery(SERVICES.imports);
export const categoryListQuery = sectionCategoryListQuery(SERVICES.imports);
export const productBySlugQuery = sectionProductQuery(SERVICES.imports);

/* ---------------- small text helpers ---------------- */

/** Category cards with a 2×2 photo mosaic (home page and /services). */
export const sectionHomeQuery = (cfg: ServiceConfig) => `{
  "categories": *[_type == "${cfg.categoryType}"] | order(coalesce(order, 9999) asc, title asc)[0...6]{
    _id,
    title,
    "slug": slug.current,
    description,
    image,
    "count": count(*[_type == "${cfg.productType}" && ${LIVE} && references(^._id)]),
    "images": *[_type == "${cfg.productType}" && ${LIVE} && references(^._id) && defined(images[0].asset)] | ${productOrder} [0...4]{ "image": images[0] }
  },
  "categoryCount": count(*[_type == "${cfg.categoryType}"]),
  "productCount": count(*[_type == "${cfg.productType}" && ${LIVE}])
}`;

export const homeImportsQuery = sectionHomeQuery(SERVICES.imports);

/** Rich text from Sanity: Portable Text blocks, or a plain string (older content). */
export type RichValue = string | { _type?: string; children?: { text?: string }[] }[] | null;

/** Plain text of a rich value (for metadata, headers, fallbacks). */
export function toPlain(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v.replace(/\s+/g, " ").trim();
  if (!Array.isArray(v)) return "";
  return v
    .map((b) => (Array.isArray(b?.children) ? b.children.map((c: { text?: string }) => c?.text ?? "").join("") : ""))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasRich(v: unknown): boolean {
  return toPlain(v).length > 0;
}

export function cardText(p: ProductCardData): string {
  return (toPlain(p.shortDescription) || p.excerpt || "").replace(/\s+/g, " ").trim();
}
