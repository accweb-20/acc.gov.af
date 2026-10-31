// components/Import/Skeletons.tsx
// Loading placeholders that match the real page layouts (pure CSS, no JavaScript, no data).
//   Services sections: listing, category and product pages
//   Site pages: home, services, about, contact, tenders and jobs

const CONTAINER =
  "mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]";

/** Blue page header (same size as PageHeader). extra: what sits under the title. */
export function ImportHeaderSkeleton({ extra = "chips" }: { extra?: "chips" | "badge" | "none" } = {}) {
  return (
    <header className="w-full" aria-hidden="true">
      <section className="mt-15 flex min-h-[320px] w-full flex-col bg-brand text-center md:min-h-[388px]">
        {/* breadcrumb – top left */}
        <div className={`${CONTAINER} flex items-center gap-2 pt-6`}>
          <div className="h-3.5 w-12 animate-pulse bg-white/30" />
          <div className="h-3.5 w-16 animate-pulse bg-white/30" />
          <div className="h-3.5 w-24 animate-pulse bg-white/40" />
        </div>
        <div className="mx-auto flex w-full max-w-[1252px] flex-1 flex-col items-center justify-center px-5 pb-14 pt-8 sm:px-8">
          <div className="h-[40px] w-[70%] max-w-[460px] animate-pulse rounded-sm bg-tint-strong/70 md:h-[56px]" />
          <div className="mt-6 h-4 w-[80%] max-w-[640px] animate-pulse bg-white/15" />
          <div className="mt-3 h-4 w-[55%] max-w-[420px] animate-pulse bg-white/15" />
          {extra === "chips" && (
            <>
              <div className="mt-8 flex items-center gap-6">
                <div className="h-7 w-36 animate-pulse bg-white/20" />
                <span className="h-8 w-px bg-white/30" />
                <div className="h-7 w-36 animate-pulse bg-white/20" />
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-28 animate-pulse border border-white/30" />
                ))}
              </div>
            </>
          )}
          {extra === "badge" && <div className="mt-6 h-8 w-36 animate-pulse bg-[#F4BA00]/70" />}
        </div>
      </section>
    </header>
  );
}

export function ImportIntroSkeleton() {
  return (
    <section className={`${CONTAINER} py-12`}>
      <div className="mb-6 h-10 w-1/3 animate-pulse bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse bg-gray-200" />
        <div className="h-4 w-11/12 animate-pulse bg-gray-200" />
        <div className="h-4 w-9/12 animate-pulse bg-gray-200" />
      </div>
    </section>
  );
}

export function ImportCardSkeleton({ framed = false }: { framed?: boolean }) {
  // Gallery card on phones, list card from 575px (matches ImportCard's default)
  return (
    <div className="flex flex-col overflow-hidden border border-brand-line/10 bg-paper sm:min-h-[220px] sm:flex-row">
      <div
        className={`aspect-square w-full shrink-0 animate-pulse bg-gray-200 ${
          framed ? "sm:m-4 sm:w-[200px] sm:self-center md:w-[220px]" : "sm:w-[220px] sm:self-center md:w-[250px]"
        }`}
      />
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-5">
        <div className="h-4 w-11/12 animate-pulse bg-gray-200 sm:h-5 sm:w-3/4" />
        <div className="hidden h-[3px] w-10 bg-[#F4BA00]/60 sm:block" />
        <div className="h-3 w-2/3 animate-pulse bg-gray-100 sm:w-full" />
        <div className="hidden h-3 w-5/6 animate-pulse bg-gray-100 sm:block" />
        <div className="hidden gap-2 sm:flex">
          <div className="h-6 w-24 animate-pulse bg-tint" />
          <div className="h-6 w-28 animate-pulse bg-tint" />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="hidden h-4 w-24 animate-pulse bg-gray-200 sm:block" />
          <div className="h-8 w-full animate-pulse bg-[#F4BA00]/40 sm:w-32" />
        </div>
      </div>
    </div>
  );
}

const CARD_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-5";

/** Category sections (like CategorySection) with card placeholders. */
export function ImportsGridSkeleton({ count = 4, sections = 2 }: { count?: number; sections?: number }) {
  return (
    <>
      {Array.from({ length: sections }).map((_, s) => (
        <section key={s} className={`py-14 md:py-16 ${s % 2 ? "bg-smoke" : "bg-paper"}`}>
          <div className={CONTAINER}>
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-5 bg-[#F4BA00]/60" />
                  <span className="h-px w-10 bg-brand/30" />
                  <div className="h-3 w-24 animate-pulse bg-gray-200" />
                </div>
                <div className="h-9 w-2/3 animate-pulse bg-brand/15 md:h-11" />
                <div className="h-4 w-full animate-pulse bg-gray-100" />
              </div>
              <div className="h-11 w-36 animate-pulse bg-[#F4BA00]/50" />
            </div>
            <div className={CARD_GRID}>
              {Array.from({ length: count }).map((__, i) => (
                <ImportCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/** Listing page (/services/imports, exports, sales): header, intro, promise strip, categories. */
export function ListingPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading products">
      <ImportHeaderSkeleton />
      <ImportIntroSkeleton />
      {/* promise strip */}
      <section className="border-y border-brand-line/10 bg-paper">
        <div className={`${CONTAINER} grid grid-cols-1 gap-6 py-8 md:grid-cols-3`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 bg-brand/80" />
              <div className="flex-1 space-y-2">
                <Line className="h-4 w-1/2" />
                <Line className="h-3 w-5/6 bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* list / gallery bar */}
      <div className="mt-8 border-y border-brand-line/10 bg-paper">
        <div className={`${CONTAINER} flex items-center justify-between gap-4 py-2`}>
          <Line className="h-3.5 w-48" />
          <div className="flex gap-1">
            <div className="h-9 w-9 bg-brand/80" />
            <div className="h-9 w-9 border border-brand-line/20 bg-paper" />
          </div>
        </div>
      </div>
      <ImportsGridSkeleton count={3} sections={2} />
    </main>
  );
}

export function ImportBodySkeleton() {
  return (
    <section className={`${CONTAINER} py-12`}>
      <div className="mb-6 h-8 w-1/3 animate-pulse bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse bg-gray-200" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Line({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}

/** "You may like" sidebar placeholder. */
function SidebarSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-brand-line/10 bg-paper">
      <div className="h-11 bg-brand" />
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 xl:flex-row xl:items-center">
            <div className="aspect-square w-full animate-pulse bg-gray-200 xl:h-16 xl:w-16" />
            <div className="flex-1 space-y-2">
              <Line className="h-3 w-full" />
              <Line className="h-3 w-2/3 bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Category page: header, category list, product cards, "You may like". */
export function CategoryPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading products">
      <ImportHeaderSkeleton extra="badge" />
      <section className="bg-smoke py-12 md:py-16">
        <div className={`${CONTAINER} grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]`}>
          <div className="border border-brand-line/10 bg-paper">
            <div className="h-11 bg-brand" />
            <div className="flex gap-2 overflow-hidden p-3 lg:block lg:space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Line key={i} className="h-5 w-28 shrink-0 lg:w-full" />
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-6 flex items-end justify-between border-b border-brand-line/15 pb-4">
              <div className="space-y-2">
                <Line className="h-8 w-56" />
                <Line className="h-3 w-24 bg-gray-100" />
              </div>
              <div className="flex gap-1">
                <div className="h-9 w-9 bg-brand/80" />
                <div className="h-9 w-9 border border-brand-line/20 bg-paper" />
              </div>
            </div>
            <div className={CARD_GRID}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ImportCardSkeleton key={i} framed />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/** Light breadcrumb bar (same size as BreadcrumbBar): product and job pages. */
function BreadcrumbBarSkeleton() {
  return (
    <div className="mt-15 border-b border-brand-line/10 bg-mist">
      <div className={`${CONTAINER} flex h-[44px] items-center gap-2`}>
        <Line className="h-3 w-12 bg-brand/15" />
        <Line className="h-3 w-16 bg-brand/15" />
        <Line className="h-3 w-40 bg-gray-300" />
      </div>
    </div>
  );
}

/** Product page: breadcrumb, gallery, title, highlights, specifications, inquiry form, "You may like". */
export function ProductPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading product">
      <BreadcrumbBarSkeleton />

      {/* Overview */}
      <section className="bg-paper py-10 md:py-14">
        <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12`}>
          {/* Gallery: same as ProductGallery – white square, round arrows, counter, centred thumbnails */}
          <div>
            <div className="relative aspect-square w-full border border-brand-line/10 bg-paper">
              <div className="absolute inset-[12%] animate-pulse bg-tint" />
              <span className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-paper shadow-md" />
              <span className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-paper shadow-md" />
              <span className="absolute bottom-3 left-3 h-5 w-12 bg-[#1A1A1A]/20" />
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className="h-[38px] w-[38px] shrink-0" />
              <div className="flex min-w-0 flex-1 justify-center gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-[72px] w-[72px] shrink-0 border-2 bg-paper p-2 ${i === 0 ? "border-brand-line" : "border-transparent"}`}
                  >
                    <div className="h-full w-full animate-pulse bg-tint" />
                  </div>
                ))}
              </div>
              <span className="h-[38px] w-[38px] shrink-0" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="h-6 w-28 animate-pulse bg-tint" />
            <Line className="mt-4 h-9 w-11/12" />
            <Line className="mt-2 h-9 w-2/3" />
            <div className="mt-3 h-1 w-14 bg-[#F4BA00]/70" />
            <div className="mt-6 space-y-2.5">
              <Line className="h-4 w-full bg-gray-100" />
              <Line className="h-4 w-10/12 bg-gray-100" />
            </div>
            <Line className="mt-8 h-3.5 w-40" />
            <div className="mt-3 flex flex-wrap gap-2">
              {[28, 36, 24, 32].map((w, i) => (
                <div key={i} className="h-8 animate-pulse bg-tint" style={{ width: `${w * 4}px` }} />
              ))}
            </div>
            <Line className="mt-8 h-3.5 w-32" />
            <div className="mt-3 overflow-hidden border border-brand-line/12 border-l-[3px] border-l-[#F4BA00]/70">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`grid grid-cols-[40%_1fr] gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-mist" : "bg-paper"}`}>
                  <Line className="h-3.5 w-3/4 bg-brand/15" />
                  <Line className="h-3.5 w-2/3 bg-gray-100" />
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-12 w-44 animate-pulse bg-[#F4BA00]/50" />
              <Line className="h-4 w-32 bg-brand/15" />
            </div>
          </div>
        </div>
      </section>

      {/* Description / inquiry / you may like */}
      <section className="bg-smoke py-12 md:py-16">
        <div className={`${CONTAINER} grid grid-cols-1 gap-10 xl:grid-cols-[1fr_270px]`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] xl:grid-cols-1">
            <div className="space-y-3 border border-brand-line/10 bg-paper p-6 md:p-8">
              <Line className="h-3.5 w-44" />
              <Line className="h-4 w-full bg-gray-100" />
              <Line className="h-4 w-11/12 bg-gray-100" />
              <Line className="h-4 w-4/5 bg-gray-100" />
              <Line className="h-4 w-10/12 bg-gray-100" />
            </div>
            <div className="border border-brand-line/15 bg-paper">
              <div className="h-12 bg-brand" />
              <div className="space-y-4 p-5">
                <Line className="h-16 w-full bg-gray-100" />
                <Line className="h-32 w-full bg-gray-100" />
                <Line className="h-11 w-full bg-gray-100" />
                <div className="ml-auto h-10 w-40 animate-pulse bg-[#F4BA00]/50" />
              </div>
            </div>
          </div>
          <SidebarSkeleton rows={6} />
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Site pages                                                          */
/* ------------------------------------------------------------------ */

/** A heading with a few text lines (intro / body sections). */
function TextBlockSkeleton({ tinted = false, lines = 4 }: { tinted?: boolean; lines?: number }) {
  return (
    <section className={tinted ? "bg-smoke" : "bg-paper"}>
      <div className={`${CONTAINER} space-y-3 py-12`}>
        <Line className="mb-6 h-9 w-1/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <Line key={i} className={`h-4 bg-gray-100 ${["w-full", "w-11/12", "w-10/12", "w-9/12"][i % 4]}`} />
        ))}
      </div>
    </section>
  );
}

/** Imports / Exports / Sales section of the home and services pages (HomeImports). */
export function HomeSectionSkeleton({ tinted = false }: { tinted?: boolean }) {
  return (
    <section className={`py-16 md:py-20 ${tinted ? "bg-smoke" : "bg-paper"}`}>
      <div className={CONTAINER}>
        <div className="mb-10 grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-[3px] w-8 bg-[#F4BA00]" />
              <Line className="h-3 w-20" />
            </div>
            <Line className="h-9 w-2/3 md:h-12" />
            <Line className="h-4 w-full bg-gray-100" />
          </div>
          <div className="flex gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 bg-brand/80" />
                <div className="space-y-2">
                  <Line className="h-6 w-10" />
                  <Line className="h-3 w-20 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex flex-col border border-brand-line/10 bg-paper ${i === 2 ? "hidden lg:flex" : ""}`}>
              <div className="aspect-square w-full animate-pulse bg-tint" />
              <div className="space-y-3 p-3 sm:p-5">
                <div className="h-[3px] w-12 bg-[#F4BA00]/60" />
                <Line className="h-5 w-3/4" />
                <Line className="hidden h-3 w-full bg-gray-100 sm:block" />
                <Line className="h-3 w-24 bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <div className="h-11 w-48 animate-pulse bg-[#F4BA00]/50" />
        </div>
      </div>
    </section>
  );
}

/** Home page: slider, CEO message, imports / exports / sales sections. */
export function HomePageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading">
      {/* Hero (the design is chosen in Sanity): headline, text, buttons and a picture area */}
      <section className="mt-16 bg-mist">
        <div className={`${CONTAINER} grid grid-cols-1 items-center gap-10 py-14 lg:min-h-[640px] lg:grid-cols-2`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="h-[3px] w-8 bg-[#F4BA00]" />
              <Line className="h-3 w-48" />
            </div>
            <Line className="h-11 w-11/12 md:h-14" />
            <Line className="h-11 w-3/4 md:h-14" />
            <Line className="mt-6 h-4 w-full bg-gray-100" />
            <Line className="h-4 w-10/12 bg-gray-100" />
            <div className="flex gap-4 pt-6">
              <div className="h-12 w-48 animate-pulse bg-[#F4BA00]/50" />
              <div className="h-12 w-36 border-2 border-brand-line/15" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square animate-pulse border border-brand-line/10 bg-paper" />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-paper">
        <div className={`${CONTAINER} grid grid-cols-1 gap-10 py-14 md:py-20 lg:grid-cols-[1fr_300px] lg:gap-14`}>
          <div className="space-y-3">
            <div className="mb-8 flex items-center gap-3">
              <span className="h-10 w-1.5 bg-[#F4BA00] md:h-14" />
              <Line className="h-9 w-1/2 md:h-12" />
            </div>
            {["w-full", "w-11/12", "w-full", "w-10/12", "w-9/12"].map((w, i) => (
              <Line key={i} className={`h-4 bg-gray-100 ${w}`} />
            ))}
          </div>
          <div className="order-first mx-auto aspect-[4/5] w-full max-w-[300px] animate-pulse bg-tint lg:order-none lg:mt-20" />
        </div>
      </section>
      <HomeSectionSkeleton tinted />
      <HomeSectionSkeleton />
    </main>
  );
}

/** Services page: header, intro, imports / exports / sales sections. */
export function ServicesPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading">
      <ImportHeaderSkeleton extra="none" />
      <TextBlockSkeleton lines={3} />
      <HomeSectionSkeleton tinted />
      <HomeSectionSkeleton />
    </main>
  );
}

/** Text pages (About us, Contact us, a tender): header and text sections; optional form. */
export function TextPageSkeleton({ sections = 2, form = false }: { sections?: number; form?: boolean }) {
  return (
    <main aria-busy="true" aria-label="Loading">
      <ImportHeaderSkeleton extra="none" />
      {Array.from({ length: sections }).map((_, i) => (
        <TextBlockSkeleton key={i} tinted={i % 2 === 1} />
      ))}
      {form && (
        <section className={`${CONTAINER} py-10`}>
          <div className="grid gap-4 border border-brand-line/10 bg-paper p-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Line key={i} className="h-11 w-full bg-gray-100" />
            ))}
            <Line className="h-32 w-full bg-gray-100 md:col-span-2" />
            <div className="h-11 w-40 animate-pulse bg-[#F4BA00]/50" />
          </div>
        </section>
      )}
    </main>
  );
}

/** Tenders list: header, tabs, wide tender cards. */
export function TendersPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading tenders" className="bg-mist">
      <ImportHeaderSkeleton extra="none" />
      <div className="border-b border-brand-line/10 bg-paper">
        <div className={`${CONTAINER} flex gap-6 py-6`}>
          <Line className="h-4 w-32" />
          <Line className="h-4 w-32" />
        </div>
      </div>
      <section className={`${CONTAINER} py-12`}>
        <Line className="h-3 w-24" />
        <Line className="mt-3 h-10 w-64" />
        <div className="mt-8 space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid border border-brand-line/10 bg-paper md:grid-cols-[120px_minmax(0,1fr)_220px]">
              <div className="h-20 animate-pulse bg-brand/15 md:h-auto" />
              <div className="space-y-3 p-6">
                <Line className="h-5 w-28" />
                <Line className="h-5 w-full" />
                <Line className="h-4 w-2/3 bg-gray-100" />
              </div>
              <div className="space-y-3 border-t border-brand-line/10 p-6 md:border-l md:border-t-0">
                <Line className="h-3 w-24" />
                <Line className="h-5 w-32" />
                <div className="h-10 w-full animate-pulse bg-[#F4BA00]/40" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/** Strip under the header: count or back link on one side, language buttons on the other. */
function JobsStripSkeleton() {
  return (
    <div className="border-b border-brand-line/10 bg-paper">
      <div className={`${CONTAINER} flex items-center justify-between gap-3 py-3`}>
        <Line className="h-9 w-44" />
        <Line className="h-10 w-56" />
      </div>
    </div>
  );
}

/** Jobs list (/jobs/<lang>): header, strip, filters, wide job cards. */
export function JobsPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading jobs" className="bg-mist">
      <ImportHeaderSkeleton extra="none" />
      <JobsStripSkeleton />
      <section className="py-12 md:py-16">
        <div className={CONTAINER}>
          <div className="mb-8 grid gap-3 border-t-4 border-brand-line/40 bg-paper p-4 md:p-5 lg:grid-cols-[minmax(0,1fr)_220px_200px_160px]">
            {[0, 1, 2, 3].map((i) => (
              <Line key={i} className="h-12 bg-gray-100" />
            ))}
          </div>
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid border border-brand-line/10 bg-paper md:grid-cols-[130px_minmax(0,1fr)_170px]">
                <div className="h-16 animate-pulse bg-brand/40 md:h-auto" />
                <div className="space-y-3 p-5 md:p-6">
                  <Line className="h-6 w-28 bg-gray-100" />
                  <Line className="h-6 w-2/3" />
                  <Line className="h-4 w-1/2 bg-gray-100" />
                </div>
                <div className="hidden items-center p-5 md:flex">
                  <Line className="h-10 w-10 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/** One job (/jobs/<lang>/<slug>): header, strip, text cards and the facts sidebar. */
export function JobPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading job" className="bg-mist">
      <ImportHeaderSkeleton extra="badge" />
      <JobsStripSkeleton />
      <section className="py-12 md:py-16">
        <div className={`${CONTAINER} grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10`}>
          <div className="space-y-6">
            {[0, 1, 2].map((b) => (
              <div key={b} className="space-y-3 bg-paper p-6 md:p-8">
                <Line className="h-7 w-1/3" />
                <Line className="h-1 w-12 bg-[#F4BA00]/60" />
                {["w-full", "w-11/12", "w-9/12"].map((w) => (
                  <Line key={w} className={`h-4 bg-gray-100 ${w}`} />
                ))}
              </div>
            ))}
          </div>
          <div className="h-fit border-t-4 border-brand-line/40 bg-paper">
            <div className="h-14 bg-brand/60" />
            <div className="space-y-3 p-5">
              {Array.from({ length: 7 }).map((_, i) => (
                <Line key={i} className="h-6 w-full bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/** About Us pages: header, tabs, text with a side panel, a row of cards. */
export function AboutPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading">
      <ImportHeaderSkeleton extra="none" />
      <div className="border-b border-brand-line/10">
        <div className={`${CONTAINER} flex gap-6 py-4`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Line key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      <section className={`${CONTAINER} grid gap-10 py-14 lg:grid-cols-2`}>
        <div>
          <Line className="h-3 w-28" />
          <Line className="mt-3 h-10 w-2/3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Line key={i} className="mt-4 h-4 w-full bg-gray-100" />
          ))}
        </div>
        <div className="aspect-[4/3] animate-pulse bg-brand/15" />
      </section>
      <section className="bg-mist py-14">
        <div className={`${CONTAINER} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse border border-brand-line/10 bg-paper" />
          ))}
        </div>
      </section>
    </main>
  );
}
