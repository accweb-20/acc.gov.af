// components/Home/heroData.ts
// Data for the home page hero (one GROQ request). Products, categories, counts and
// the old slider images come from the rest of the website; "homeHero" only adds texts.

import { imgUrl, type SanityImg } from "@/lib/imports";

const PRODUCT_TYPES = `["importProduct", "exportProduct", "salesProduct"]`;
const LIVE = `!(status in ["draft", "archived"])`;

/** A product with its page link, category, first photo and first specifications. */
const P = `{
  _id,
  _type,
  title,
  "href": select(_type == "importProduct" => "/services/imports/", _type == "exportProduct" => "/services/exports/", "/services/sales/")
    + category->slug.current + "/" + slug.current,
  "category": category->title,
  "image": images[0],
  "specs": specifications[0...3]{ label, value },
  "summary": pt::text(shortDescription)
}`;

const texts = `eyebrow, title, highlight, text, primary, secondary`;

export const HERO_QUERY = `{
  "hero": *[_type == "homeHero"][0]{
    active,
    foundedYear,
    productShowcase{ ${texts}, "products": products[]->${P} },
    serviceBanner{ ${texts}, image },
    storySlider{ seconds, slides[]{ _key, label, title, text, image, buttonLabel, link } },
    tradeRoutes{ ${texts}, regions, "products": products[]->${P} },
    boldStatement{ eyebrow, line1, line2, line3, text, primary, secondary, "products": products[]->${P} },
    featuredProduct{ ${texts}, points, seconds, "products": products[]->${P} }
  },
  "featured": *[_type in ${PRODUCT_TYPES} && ${LIVE} && featured == true && defined(images[0].asset) && defined(category->slug.current)]
    | order(coalesce(order, 9999) asc)[0...12] ${P},
  "latest": *[_type in ${PRODUCT_TYPES} && ${LIVE} && defined(images[0].asset) && defined(category->slug.current)]
    | order(_createdAt desc)[0...80] ${P},
  "counts": {
    "imports": count(*[_type == "importProduct" && ${LIVE}]),
    "exports": count(*[_type == "exportProduct" && ${LIVE}]),
    "sales": count(*[_type == "salesProduct" && ${LIVE}])
  },
  "services": *[_type == "servicesPage"][0]{
    "imports": importsSection{ title, "text": pt::text(description) },
    "exports": exportsSection{ title, "text": pt::text(description) },
    "sales": salesSection{ title, "text": pt::text(description) }
  },
  "categories": *[_type in ["exportCategory", "importCategory", "salesCategory"] && count(*[references(^._id) && ${LIVE}]) > 0]
    | order(_type asc, coalesce(order, 9999) asc)[0...6]{
      _id,
      title,
      "href": select(_type == "importCategory" => "/services/imports/", _type == "exportCategory" => "/services/exports/", "/services/sales/") + slug.current,
      "text": pt::text(description),
      "image": coalesce(image, *[references(^._id) && ${LIVE} && defined(images[0].asset)] | order(featured desc, coalesce(order, 9999) asc)[0].images[0])
    },
  "sliderImage": coalesce(
    *[_type == "slider" && defined(order)] | order(order asc)[0].desktopImage,
    *[_type == "slider" && defined(order)] | order(order asc)[0].desktop_image
  )
}`;

export type HeroButton = { label?: string; link?: string } | null;
export type HeroTexts = {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  text?: string;
  primary?: HeroButton;
  secondary?: HeroButton;
};
export type HeroProduct = {
  _id: string;
  _type: string;
  title?: string;
  href: string;
  category?: string;
  image?: SanityImg;
  specs?: { label?: string; value?: string }[] | null;
  summary?: string;
};
type WithProducts = { products?: (HeroProduct | null)[] | null };

export type HeroData = {
  hero?: {
    active?: string;
    foundedYear?: number;
    productShowcase?: HeroTexts & WithProducts;
    serviceBanner?: HeroTexts & { image?: SanityImg };
    storySlider?: {
      seconds?: number;
      slides?: { _key: string; label?: string; title?: string; text?: string; image?: SanityImg; buttonLabel?: string; link?: string }[];
    };
    tradeRoutes?: HeroTexts & WithProducts & { regions?: string[] };
    boldStatement?: { eyebrow?: string; line1?: string; line2?: string; line3?: string; text?: string; primary?: HeroButton; secondary?: HeroButton } & WithProducts;
    featuredProduct?: HeroTexts & WithProducts & { points?: string[]; seconds?: number };
  } | null;
  featured?: HeroProduct[];
  latest?: HeroProduct[];
  counts?: { imports?: number; exports?: number; sales?: number };
  services?: Record<"imports" | "exports" | "sales", { title?: string; text?: string } | null> | null;
  categories?: { _id: string; title?: string; href: string; text?: string; image?: SanityImg }[];
  sliderImage?: SanityImg | null;
} | null;

/** Random order (the page is rebuilt every minute, so the products change). */
function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Automatic products: products marked "Featured" first (random order), then other products at random. */
export function randomProducts(data: HeroData) {
  const featured = data?.featured ?? [];
  const ids = new Set(featured.map((p) => p._id));
  return [...shuffle(featured), ...shuffle((data?.latest ?? []).filter((p) => !ids.has(p._id)))];
}

/** Chosen products, or the automatic list – without duplicates (the same item can be both an import and a sale). */
export function pickProducts(chosen: (HeroProduct | null)[] | null | undefined, auto: HeroProduct[] | undefined, n: number) {
  const list = (chosen ?? []).filter((p): p is HeroProduct => !!p?.image);
  const source = list.length ? list : auto ?? [];
  const seen = new Set<string>();
  return source
    .filter((p) => {
      const k = (p.title ?? "").toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, n);
}

export const photo = (img: SanityImg | undefined, w: number, h?: number) => imgUrl(img, w, h) ?? "";
