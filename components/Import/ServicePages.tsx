// components/Import/ServicePages.tsx
// The pages shared by the three service sections (Imports, Exports, Sales).
// Each route file only picks its section, e.g.
//   const r = productRoute(SERVICES.exports);
//   export const generateMetadata = r.generateMetadata;  export default r.Page;
//
//   listingRoute  → /services/<section>                     header, intro, categories with products, body
//   categoryRoute → /services/<section>/<category>          all products of a category (10 per page)
//   productRoute  → /services/<section>/<category>/<product> gallery, details, inquiry form, related, "You may like"

import { cache, type ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  Headphones,
  Layers,
  MessageCircleQuestion,
  MessageSquareText,
  Package,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { client } from "@/sanity/lib/client";
import PageHeader, { BreadcrumbBar } from "@/components/PageHeader";
import ImportIntro from "./ImportIntro";
import { CONTAINER, CategorySection, Pagination, ProductGrid, YellowButton, YouMayLike, type MiniProduct } from "./ImportsGrid";
import RichText from "./RichText";
import { InquiryForm, ProductGallery, type GalleryImage } from "./ProductClient";
import { CountUp, Reveal, ViewScope, ViewToggle } from "./Motion";
import {
  EYEBROW,
  IMG,
  PRODUCTS_PER_PAGE,
  hasRich,
  imgUrl,
  pickCrumbs,
  pickRandom,
  sectionCategoriesQuery,
  sectionCategoryBySlugQuery,
  sectionCategoryListQuery,
  sectionCrumbs,
  sectionProductParamsQuery,
  sectionProductQuery,
  servicePageQuery,
  toPlain,
  type CategoryData,
  type Crumb,
  type ProductCardData,
  type ProductDetail,
  type RichValue,
  type ServiceConfig,
} from "@/lib/imports";

function SubTitle({ icon: Icon, children, dark }: { icon: LucideIcon; children: ReactNode; dark?: boolean }) {
  return (
    <h2
      className={`mb-3 flex items-center gap-2 ${
        dark ? "text-[13px] font-bold uppercase tracking-[0.14em] text-ink" : EYEBROW
      }`}
    >
      <Icon size={15} className="text-brand-fg" />
      {children}
    </h2>
  );
}

export function listingRoute(cfg: ServiceConfig) {

  type SectionPage = {
    title?: string;
    subtitle?: string;
    breadcrumbLinks?: { _key?: string; label?: string; href?: string }[] | null;
    breadcrumbLabel?: string;
    headerMessage?: unknown;
    introTitle?: string;
    introMessage?: unknown[];
    introBackground?: { enabled?: boolean };
    itemsPerCategory?: number;
    categoriesTitle?: string;
    categoriesMessage?: RichValue;
    bodyTitle?: string;
    bodyMessage?: unknown[];
    bodyBackground?: { enabled?: boolean };
    seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
  };

  async function generateMetadata(): Promise<Metadata> {
    try {
      const data = (await client.fetch(servicePageQuery(cfg))) as SectionPage | null;
      const title = data?.seo?.seoTitle ?? data?.title ?? cfg.label;
      const description = data?.seo?.metaDescription ?? (toPlain(data?.headerMessage) || data?.subtitle || undefined);
      return { title, description, keywords: data?.seo?.keywords, openGraph: { title, description } };
    } catch {
      return { title: cfg.label };
    }
  }

  const promises = cfg.promises.map((p, i) => ({ ...p, icon: [ShieldCheck, Truck, Headphones][i] ?? ShieldCheck }));

  async function Page() {
    const data = (await client.fetch(servicePageQuery(cfg))) as SectionPage | null;
    const limit = Math.min(Math.max(data?.itemsPerCategory ?? 4, 1), 12);
    const categories = ((await client.fetch(sectionCategoriesQuery(cfg), { limit })) as CategoryData[] | null) ?? [];
    const visible = categories.filter((c) => c.slug);
    const totalProducts = visible.reduce((sum, c) => sum + (c.count ?? 0), 0);

    return (
      <main className="font-rubik">
        <PageHeader
          title={data?.title ?? cfg.label}
          subtitle={data?.subtitle}
          breadcrumbLinks={pickCrumbs(data?.breadcrumbLinks, sectionCrumbs(cfg).page)}
          breadcrumbLabel={data?.breadcrumbLabel}
          headerMessage={data?.headerMessage}
        >
          {visible.length > 0 && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-6 text-white">
                <span className="inline-flex items-center gap-2 text-[15px] font-bold uppercase tracking-[0.12em] text-white/70">
                  <Layers size={20} className="text-[#F4BA00]" />
                  <strong className="text-[28px] tracking-normal text-white">
                    <CountUp value={visible.length} />
                  </strong>
                  Categories
                </span>
                <span className="h-8 w-px bg-white/30" />
                <span className="inline-flex items-center gap-2 text-[15px] font-bold uppercase tracking-[0.12em] text-white/70">
                  <Package size={20} className="text-[#F4BA00]" />
                  <strong className="text-[28px] tracking-normal text-white">
                    <CountUp value={totalProducts} />
                  </strong>
                  Products
                </span>
              </div>

              {/* Quick jump to a category */}
              <nav aria-label="Import categories" className="flex max-w-4xl flex-wrap justify-center gap-2">
                {visible.map((c) => (
                  <a
                    key={c._id}
                    href={`#${c.slug}`}
                    className="border border-white/30 px-4 py-1.5 text-[14px] text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#F4BA00] hover:bg-[#F4BA00] hover:text-[#1A1A1A]"
                  >
                    {c.title}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </PageHeader>

        <ImportIntro
          introTitle={data?.introTitle}
          introMessage={(data?.introMessage as never[]) ?? []}
          introBackgroundEnabled={!!data?.introBackground?.enabled}
        />

        {/* Promise strip */}
        <section className="border-y border-brand-line/10 bg-paper">
          <div className={`${CONTAINER} grid grid-cols-1 gap-6 py-8 md:grid-cols-3`}>
            {promises.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="group flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand text-[#F4BA00] transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#F4BA00] group-hover:text-brand-fg">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
                    <p className="text-[14px] leading-snug text-ink/65">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Categories – one List / Gallery switch for all of them */}
        <ViewScope>
          {(data?.categoriesTitle || hasRich(data?.categoriesMessage)) && (
            <Reveal className={`${CONTAINER} pt-14 text-center`}>
              {data?.categoriesTitle && (
                <h2 className="text-[34px] font-extrabold uppercase text-ink md:text-[48px]">{data?.categoriesTitle}</h2>
              )}
              {hasRich(data?.categoriesMessage) && (
                <div className="mx-auto mt-3 max-w-3xl text-[17px] text-ink/65">
                  <RichText value={data?.categoriesMessage} />
                </div>
              )}
            </Reveal>
          )}

          {visible.length > 0 && (
            <div className="sticky top-16 z-30 mt-8 border-y border-brand-line/10 bg-paper/95 backdrop-blur">
              <div className={`${CONTAINER} flex items-center justify-between gap-4 py-2`}>
                <span className="text-[13px] font-medium text-ink/60">
                  <strong className="text-brand-fg">{visible.length}</strong> categories ·{" "}
                  <strong className="text-brand-fg">{totalProducts}</strong> products
                </span>
                <ViewToggle />
              </div>
            </div>
          )}

          {visible.length === 0 ? (
            <div className={`${CONTAINER} py-20 text-center text-ink/60`}>{cfg.empty}</div>
          ) : (
            visible.map((cat, i) => <CategorySection key={cat._id} category={cat} index={i} base={cfg.base} />)
          )}
        </ViewScope>

        {/* Body */}
        {(data?.bodyTitle || (data?.bodyMessage?.length ?? 0) > 0) && (
          <section className={data?.bodyBackground?.enabled ? "bg-tint" : "bg-paper"}>
            <div className={`${CONTAINER} py-14`}>
              <Reveal className="max-w-[920px] text-ink">
                {data?.bodyTitle && <h2 className="mb-6 text-[36px] font-extrabold md:text-[48px]">{data?.bodyTitle}</h2>}
                {data?.bodyMessage && <div className="text-[17px] text-ink/85"><RichText value={data.bodyMessage} /></div>}
              </Reveal>
            </div>
          </section>
        )}

        {/* Call to action */}
        <section className="bg-brand">
          <div className={`${CONTAINER} flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between`}>
            <Reveal from="left" className="flex items-start gap-4">
              <MessageCircleQuestion size={40} strokeWidth={1.5} className="hidden shrink-0 text-[#F4BA00] md:block" />
              <div>
              <h2 className="text-[26px] font-bold text-white md:text-[32px]">{cfg.ctaTitle}</h2>
              <p className="mt-2 max-w-2xl text-[16px] text-[#8FB8C8]">
                {cfg.ctaText}
              </p>
              </div>
            </Reveal>
            <Reveal from="right">
              <YellowButton href="/contact-us">Contact Sales</YellowButton>
            </Reveal>
          </div>
        </section>
      </main>
    );
  }

  return { generateMetadata, Page };
}

export function categoryRoute(cfg: ServiceConfig) {

  type Params = {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ page?: string }>;
  };

  const pageOf = (v?: string) => Math.max(1, Math.floor(Number(v)) || 1);
  type Category = CategoryData & {
    seo?: { seoTitle?: string; metaDescription?: string; keywords?: string[] };
    breadcrumbLinks?: Crumb[] | null;
    defaultCrumbs?: Crumb[] | null;
  };

  async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
    const { category } = await params;
    const page = pageOf((await searchParams).page);
    const data = (await client.fetch(sectionCategoryBySlugQuery(cfg), { slug: category, start: 0, end: 0 })) as Category | null;
    if (!data) return { title: cfg.label };
    const baseTitle = data.seo?.seoTitle ?? `${data.title} | ${cfg.label}`;
    const title = page > 1 ? `${baseTitle} – Page ${page}` : baseTitle;
    const description = data.seo?.metaDescription ?? (toPlain(data.description) || undefined);
    return { title, description, keywords: data.seo?.keywords, openGraph: { title, description } };
  }

  async function Page({ params, searchParams }: Params) {
    const { category } = await params;
    const page = pageOf((await searchParams).page);
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const [data, all] = await Promise.all([
      client.fetch(sectionCategoryBySlugQuery(cfg), { slug: category, start, end: start + PRODUCTS_PER_PAGE }) as Promise<Category | null>,
      client.fetch(sectionCategoryListQuery(cfg)) as Promise<{ _id: string; title?: string; slug?: string; count?: number }[]>,
    ]);

    if (!data) notFound();

    const products = data.products ?? [];
    const total = data.count ?? products.length;
    const pages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
    if (page > pages) notFound();
    const baseHref = `${cfg.base}/${data.slug}`;
    const others = (all ?? []).filter((c) => c.slug);

    return (
      <main className="font-rubik">
        <PageHeader
          title={data.title}
          headerMessage={data.description}
          breadcrumbLinks={pickCrumbs(data.breadcrumbLinks, data.defaultCrumbs, sectionCrumbs(cfg).category)}
          breadcrumbLabel={data.title}
        >
          <span className="inline-flex items-center gap-2 bg-[#F4BA00] px-4 py-1.5 text-[14px] font-bold uppercase tracking-[0.1em] text-[#1A1A1A]">
            <Boxes size={16} />
            <CountUp value={data.count ?? products.length} /> {(data.count ?? products.length) === 1 ? "Product" : "Products"}
          </span>
        </PageHeader>

        <section className="bg-smoke py-12 md:py-16">
          <div className={`${CONTAINER} grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]`}>
            {/* Sidebar: all categories */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Reveal from="left" className="border border-brand-line/10 bg-paper">
                <h2 className="flex items-center gap-2 bg-brand px-4 py-3 text-[15px] font-semibold uppercase tracking-wide text-white">
                  <Layers size={16} className="text-[#F4BA00]" /> Categories
                </h2>
                <nav aria-label="Import categories">
                  <ul className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-0.5">
                    {others.map((c) => {
                      const active = c.slug === data.slug;
                      return (
                        <li key={c._id} className="shrink-0">
                          <Link
                            href={`${cfg.base}/${c.slug}`}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-[15px] transition duration-300 lg:whitespace-normal ${
                              active
                                ? "border-l-4 border-[#F4BA00] bg-brand/8 font-semibold text-brand-fg"
                                : "border-l-4 border-transparent text-ink/75 hover:translate-x-1 hover:bg-smoke hover:text-brand-fg"
                            }`}
                          >
                            <span>{c.title}</span>
                            <span className="text-[12px] text-ink/45">{c.count ?? 0}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <Link
                  href={cfg.base}
                  className="hidden items-center gap-1 border-t border-brand-line/10 px-4 py-3 text-[14px] font-semibold text-brand-fg hover:underline lg:flex"
                >
                  All {cfg.label.toLowerCase()} <ChevronRight size={16} />
                </Link>
              </Reveal>
            </aside>

            {/* Products */}
            <ViewScope className="min-w-0">
              <div id="products" className="scroll-mt-28">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-brand-line/15 pb-4">
                  <div>
                    <h2 className="text-[24px] font-bold text-ink md:text-[30px]">All {data.title}</h2>
                    <span className={`mt-1 inline-flex items-center gap-1.5 ${EYEBROW}`}>
                      <Boxes size={14} />
                      {pages > 1
                        ? `${start + 1}–${start + products.length} of ${total} items`
                        : `${total} ${total === 1 ? "item" : "items"}`}
                    </span>
                  </div>
                  <ViewToggle />
                </div>

                <ProductGrid products={products} categorySlug={data.slug} base={cfg.base} cols={2} priorityCount={2} framed />
                <Pagination page={page} pages={pages} baseHref={baseHref} />
              </div>
            </ViewScope>

          </div>
        </section>

        <section className="bg-brand">
          <div className={`${CONTAINER} flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between`}>
            <p className="flex items-center gap-3 text-[20px] font-semibold text-white md:text-[24px]">
              <MessageCircleQuestion size={30} strokeWidth={1.6} className="hidden shrink-0 text-[#F4BA00] md:block" />
              <span>
                {cfg.categoryCta.split("{category}")[0]}
                <span className="text-[#F4BA00]">{data.title}</span>
                {cfg.categoryCta.split("{category}")[1]}
              </span>
            </p>
            <YellowButton href="/contact-us">Contact Sales</YellowButton>
          </div>
        </section>
      </main>
    );
  }

  return { generateMetadata, Page };
}

export function productRoute(cfg: ServiceConfig) {

  type Params = { params: Promise<{ category: string; product: string }> };
  type Product = ProductDetail & {
    status?: "active" | "draft" | "archived" | null;
    category?: { _id?: string; title?: string; slug?: string } | null;
    related?: ProductCardData[];
    pool?: MiniProduct[];
    breadcrumbLinks?: Crumb[] | null;
    defaultCrumbs?: Crumb[] | null;
  };

  // cache(): metadata and page share one request to Sanity
  const getProduct = cache(async (category: string, product: string) => {
    return (await client.fetch(sectionProductQuery(cfg), { category, product })) as Product | null;
  });

  // Build every product page ahead of time (instant first load); new products are built on first visit.
  async function generateStaticParams() {
    // If Sanity can't be reached during the build, don't fail the deploy:
    // the product pages are then simply built on the first visit.
    const rows = (await client.fetch(sectionProductParamsQuery(cfg)).catch(() => null)) as { category: string; product: string }[] | null;
    return rows ?? [];
  }

  async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { category, product } = await params;
    const p = await getProduct(category, product);
    if (!p) return { title: "Product not found" };
    const title = p.seo?.seoTitle ?? `${p.title} | ${p.category?.title ?? cfg.label}`;
    const description = p.seo?.metaDescription ?? (toPlain(p.shortDescription) || undefined);
    const image = imgUrl(p.images?.[0], 1200, 630);
    return { title, description, openGraph: { title, description, images: image ? [image] : undefined } };
  }


  async function Page({ params }: Params) {
    const { category, product } = await params;
    const p = await getProduct(category, product);
    if (!p) notFound();

    const title = p.title ?? "Product";
    const catTitle = p.category?.title ?? cfg.label;
    const catHref = `${cfg.base}/${p.category?.slug ?? category}`;

    // Gallery images are shown whole (never cropped) inside the square frame.
    // The full-screen viewer shows the complete, uncropped photo.
    const gallery: GalleryImage[] = (p.images ?? []).flatMap((img) => {
      const src = imgUrl(img, IMG.main);
      const thumb = imgUrl(img, IMG.thumb);
      const full = imgUrl(img, IMG.full);
      return src && thumb && full ? [{ src, thumb, full, alt: img?.alt ?? title }] : [];
    });

    const highlights = (p.highlights ?? []).filter(Boolean);
    const specs = (p.specifications ?? []).filter((s) => s?.label && s?.value);
    const hasDescription = Array.isArray(p.description) && p.description.length > 0;
    const related = p.related ?? [];
    const youMayLike = pickRandom(p.pool, 6);

    // Parent links from Sanity (product override → Imports Page default → built-in default), then the category
    const crumbs = [
      ...pickCrumbs(p.breadcrumbLinks, p.defaultCrumbs, sectionCrumbs(cfg).category),
      { _key: "category", label: catTitle, href: catHref },
    ];

    return (
      <main className="font-rubik">
        <BreadcrumbBar
          links={crumbs.map(({ _key, label, href }) => ({ key: _key, label: label ?? "", href: href ?? "/" }))}
          current={title}
          tagHref={catHref}
        />

        {/* Overview */}
        <section className="bg-paper py-10 md:py-14">
          <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12`}>
            {/* Gallery stays pinned while the details on the right scroll (desktop) */}
            <Reveal from="left" className="lg:sticky lg:top-28 lg:self-start">
              <ProductGallery images={gallery} title={title} />
            </Reveal>

            <Reveal from="right" delay={100} className="flex flex-col">
              <Link
                href={catHref}
                className="mb-3 inline-flex w-fit items-center gap-1.5 bg-tint px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-brand-fg transition-colors hover:bg-brand hover:text-white"
              >
                <Tag size={12} /> {catTitle}
              </Link>

              <h1 className="text-[28px] font-bold leading-tight text-ink md:text-[36px]">{title}</h1>
              <span className="mt-3 block h-1 w-14 bg-[#F4BA00]" />

              {p.status === "archived" && (
                <p className="mt-4 border-l-[3px] border-ink/30 bg-[#1A1A1A]/5 px-4 py-2 text-[14px] font-medium text-ink/70">
                  This product is archived and no longer available. Please contact us for similar products.
                </p>
              )}

              {hasRich(p.shortDescription) && (
                <div className="mt-5 text-[17px] leading-relaxed text-ink/75">
                  <RichText value={p.shortDescription} />
                </div>
              )}

              {highlights.length > 0 && (
                <div className="mt-7">
                  <SubTitle icon={Sparkles} dark>Product Highlights</SubTitle>
                  <ul className="flex flex-wrap gap-2">
                    {highlights.map((h, i) => (
                      <li
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-tint px-3 py-1.5 text-[14px] font-medium text-brand-fg transition duration-300 hover:-translate-y-0.5 hover:bg-tint-strong"
                      >
                        <Check size={14} strokeWidth={3} /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {specs.length > 0 && (
                <div className="mt-7">
                  <SubTitle icon={ClipboardList} dark>Specifications</SubTitle>
                  <dl className="overflow-hidden border border-brand-line/12 border-l-[3px] border-l-[#F4BA00]">
                    {specs.map((s, i) => (
                      <div
                        key={s._key ?? i}
                        className={`grid grid-cols-[40%_1fr] text-[15px] transition-colors hover:bg-tint ${
                          i % 2 === 0 ? "bg-mist" : "bg-paper"
                        } ${i > 0 ? "border-t border-brand-line/8" : ""}`}
                      >
                        <dt className="px-4 py-2.5 text-[14px] font-semibold text-brand-fg">{s.label}</dt>
                        <dd className="px-4 py-2.5 text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {!hasRich(p.shortDescription) && highlights.length === 0 && specs.length === 0 && (
                <p className="mt-6 flex gap-3 border-l-4 border-[#F4BA00] bg-smoke px-4 py-3 text-[15px] text-ink/70">
                  <ClipboardList size={20} className="mt-0.5 shrink-0 text-brand-fg/60" />
                  Detailed specifications, availability and pricing for this product are provided on request. Send us an
                  inquiry and our sales team will get back to you.
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-auto lg:pt-8">
                <a
                  href="#inquiry"
                  className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap bg-[#F4BA00] px-8 py-3 text-[16px] font-bold text-[#1A1A1A] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(244,186,0,0.35)]"
                  style={{ clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)" }}
                >
                  <Send size={17} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  Send Inquiry
                </a>
                <Link
                  href={catHref}
                  className="group inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-brand-fg hover:underline"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to {catTitle}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Description + Inquiry (+ "You may like" on the right on large screens) */}
        <section className="bg-smoke py-12 md:py-16">
          <div className={`${CONTAINER} grid grid-cols-1 gap-10 xl:grid-cols-[1fr_270px]`}>
            <div className={`grid min-w-0 grid-cols-1 gap-10 ${hasDescription ? "lg:grid-cols-[1fr_420px] xl:grid-cols-1" : ""}`}>
              {hasDescription && (
                <Reveal>
                  <article className="min-w-0 border border-brand-line/10 bg-paper p-6 text-[16px] text-ink/85 md:p-8">
                    <div className="border-b border-brand-line/10 pb-3">
                      <SubTitle icon={FileText}>Product Description</SubTitle>
                    </div>
                    <RichText value={p.description} />
                  </article>
                </Reveal>
              )}

              <div
                id="inquiry"
                className={`scroll-mt-28 ${hasDescription ? "lg:sticky lg:top-28 lg:self-start xl:static" : "w-full max-w-[760px]"}`}
              >
                <Reveal delay={hasDescription ? 120 : 0}>
                  <SubTitle icon={MessageSquareText}>Send Your Inquiry</SubTitle>
                  <InquiryForm productId={p._id} productTitle={title} productThumb={gallery[0]?.thumb ?? null} />
                </Reveal>
              </div>
            </div>

            {youMayLike.length > 0 && (
              <div className="xl:sticky xl:top-28 xl:self-start">
                <YouMayLike products={youMayLike} base={cfg.base} />
              </div>
            )}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-paper py-12 md:py-16">
            <div className={CONTAINER}>
              <Reveal>
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <span className={`flex items-center gap-2 ${EYEBROW}`}>
                      <Layers size={14} /> Related products
                    </span>
                    <h2 className="mt-1 text-[26px] font-bold text-brand-fg md:text-[32px]">More in {catTitle}</h2>
                  </div>
                  <Link
                    href={catHref}
                    className="group inline-flex items-center gap-1 text-[15px] font-semibold text-brand-fg hover:underline"
                  >
                    View all <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
              <ProductGrid products={related} categorySlug={p.category?.slug ?? category} base={cfg.base} cols={4} />
            </div>
          </section>
        )}
      </main>
    );
  }

  return { generateMetadata, generateStaticParams, Page };
}
