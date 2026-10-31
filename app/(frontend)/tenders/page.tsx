// app/(frontend)/tenders/page.tsx
// Tenders list: Open / Closed tabs, one wide card per tender, pages, and "how to take part".

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, FileText, Gavel, MapPin, Paperclip, Tag } from "lucide-react";
import { hasRich } from "@/lib/imports";
import PageHeader from "@/components/PageHeader";
import { sanityClient } from "@/sanity/lib/client";

export const revalidate = 60;

type TenderListItem = {
  _id: string;
  title?: string;
  slug?: string;
  refNo?: string;
  category?: string;
  publishDate?: string;
  expirationDate?: string;
  location?: string;
  type?: string;
  descriptionText?: string;
  attachmentCount?: number;
};

type TendersPageConfig = {
  title?: string;
  breadcrumbLabel?: string;
  breadcrumbLinks?: Array<{ _key?: string; label?: string; href?: string }>;
  headerMessage?: unknown;
};

type TendersPageProps = { searchParams?: Promise<{ page?: string; view?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tenders",
    description: "Browse open and closed tenders of Afghan Cart Corporation and download tender documents.",
  };
}

const CONTAINER = "mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]";
const PER_PAGE = 6;
const DAY = 24 * 60 * 60 * 1000;

const toDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const formatDate = (v?: string | null) => {
  const d = toDate(v);
  return d ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d) : "Not specified";
};
/** A tender is closed after its expiration day has ended. */
const isClosed = (t: TenderListItem, now: Date) => {
  const exp = toDate(t.expirationDate);
  return exp ? exp.getTime() + DAY <= now.getTime() : false;
};
const daysLeft = (t: TenderListItem, now: Date) => {
  const exp = toDate(t.expirationDate);
  return exp ? Math.ceil((exp.getTime() + DAY - now.getTime()) / DAY) : null;
};
const pageHref = (page: number, view: "open" | "closed") => {
  const p = new URLSearchParams();
  if (view === "closed") p.set("view", "archived");
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/tenders?${q}` : "/tenders";
};

export default async function TendersPage({ searchParams }: TendersPageProps) {
  const params = (await searchParams) ?? {};
  const view: "open" | "closed" = params.view === "archived" ? "closed" : "open";
  const pageParam = Number.parseInt(params.page ?? "1", 10);

  let tenders: TenderListItem[] = [];
  let config: TendersPageConfig | null = null;
  try {
    const data = await sanityClient.fetch(`{
      "tenders": *[_type == "tender" && defined(slug.current)] | order(publishDate desc, _createdAt desc){
        _id, title, "slug": slug.current, refNo, category, publishDate, expirationDate, location, type,
        "descriptionText": pt::text(description), "attachmentCount": count(attachments)
      },
      "config": *[_type == "tendersPage"][0]{ title, breadcrumbLabel, breadcrumbLinks[]{ _key, label, href }, "headerMessage": coalesce(headerDescription, headerMessage) }
    }`);
    tenders = data?.tenders ?? [];
    config = data?.config ?? null;
  } catch (error) {
    console.error("Failed to fetch tenders:", error);
  }

  const now = new Date();
  const open = tenders.filter((t) => !isClosed(t, now));
  const closed = tenders.filter((t) => isClosed(t, now));
  const list = view === "closed" ? closed : open;
  const totalPages = Math.max(Math.ceil(list.length / PER_PAGE), 1);
  const page = Math.min(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1, totalPages);
  const paged = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const tabs = [
    { key: "open" as const, label: "Open tenders", count: open.length },
    { key: "closed" as const, label: "Closed tenders", count: closed.length },
  ];

  return (
    <main className="bg-mist text-ink">
      <PageHeader
        title={config?.title ?? "Tenders"}
        breadcrumbLinks={config?.breadcrumbLinks}
        breadcrumbLabel={config?.breadcrumbLabel ?? "Tenders"}
        headerMessage={
          (hasRich(config?.headerMessage) ? config?.headerMessage : null) ||
          "Explore current opportunities, review tender requirements, and download relevant documents from Afghan Cart Corporation."
        }
      />

      {/* Tabs + counts */}
      <div className="border-b border-brand-line/10 bg-paper">
        <div className={`${CONTAINER} flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between`}>
          <nav aria-label="Tender lists" className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const on = t.key === view;
              return (
                <Link
                  key={t.key}
                  href={pageHref(1, t.key)}
                  aria-current={on ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 border-b-[3px] px-4 py-3 text-[15px] font-semibold transition ${
                    on ? "border-[#F4BA00] text-brand-fg" : "border-transparent text-ink/60 hover:text-brand-fg"
                  }`}
                >
                  {t.label}
                  <span className={`min-w-6 px-1.5 py-0.5 text-center text-[12px] font-bold ${on ? "bg-brand text-white" : "bg-brand/10 text-brand-fg"}`}>{t.count}</span>
                </Link>
              );
            })}
          </nav>
          <span className="text-[14px] text-ink/55">
            {tenders.length} {tenders.length === 1 ? "tender" : "tenders"} published in total
          </span>
        </div>
      </div>

      {/* List */}
      <section className="py-12 md:py-16">
        <div className={CONTAINER}>
          <div className="mb-8">
            <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-brand-fg">{view === "closed" ? "Archive" : "Procurement"}</span>
            <h2 className="mt-2 text-[30px] font-extrabold leading-tight md:text-[40px]">{view === "closed" ? "Closed tenders" : "Open tenders"}</h2>
            <span className="mt-4 block h-1 w-16 bg-[#F4BA00]" />
            <p className="mt-4 text-[16px] text-ink/65">
              {view === "closed" ? "These tenders have passed their closing date and are kept for reference." : "Tenders you can still take part in. Submit your offer before the closing date."}
            </p>
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-center border border-dashed border-brand-line/25 bg-paper px-6 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center bg-brand/10 text-brand-fg">
                <Gavel size={26} />
              </span>
              <h3 className="mt-5 text-[20px] font-bold">{view === "closed" ? "No closed tenders yet" : "No open tenders right now"}</h3>
              <p className="mt-2 max-w-md text-[15px] text-ink/60">
                {view === "closed" ? "Closed tenders will be listed here." : "New tenders are announced on this page. Please check back soon or browse our earlier tenders."}
              </p>
              {view === "open" && closed.length > 0 && (
                <Link href={pageHref(1, "closed")} className="mt-6 inline-flex items-center gap-2 bg-[#F4BA00] px-6 py-3 text-[15px] font-bold transition hover:bg-brand hover:text-white">
                  See closed tenders <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {paged.map((t) => {
                const closedNow = isClosed(t, now);
                const left = daysLeft(t, now);
                const pub = toDate(t.publishDate);
                return (
                  <Link
                    key={t._id}
                    href={`/tenders/${t.slug}`}
                    className="group grid border border-brand-line/10 bg-paper transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(2,88,123,0.14)] md:grid-cols-[120px_minmax(0,1fr)_220px]"
                  >
                    {/* Publish date */}
                    <div className={`flex items-center gap-3 px-5 py-4 md:flex-col md:justify-center md:gap-0 md:py-6 ${closedNow ? "bg-[#1A1A1A]/[0.06] text-ink/60" : "bg-brand text-white"}`}>
                      <b className="text-[30px] font-extrabold leading-none md:text-[40px]">{pub ? pub.getDate() : "–"}</b>
                      <span className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                        {pub ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(pub) : "No date"}
                      </span>
                      <span className={`ml-auto text-[11px] md:ml-0 md:mt-2 ${closedNow ? "" : "text-white/70"}`}>Published</span>
                    </div>

                    {/* Details */}
                    <div className="p-5 md:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {t.refNo && <span className="bg-[#F4BA00] px-2.5 py-1 text-[12px] font-bold tracking-wide">{t.refNo}</span>}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-bold ${closedNow ? "bg-alert/10 text-alert" : "bg-emerald-50 text-emerald-700"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${closedNow ? "bg-alert" : "bg-emerald-500"}`} />
                          {closedNow ? "Closed" : "Open"}
                        </span>
                      </div>
                      <h3 dir="auto" className="mt-4 text-[19px] font-bold leading-relaxed transition group-hover:text-brand-fg md:text-[21px]">
                        {t.title ?? "Untitled tender"}
                      </h3>
                      {t.descriptionText && (
                        <p dir="auto" className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink/65">
                          {t.descriptionText}
                        </p>
                      )}
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink/65">
                        {t.location && (
                          <li dir="auto" className="inline-flex items-center gap-1.5">
                            <MapPin size={15} className="shrink-0 text-brand-fg" /> {t.location}
                          </li>
                        )}
                        {t.type && (
                          <li dir="auto" className="inline-flex items-center gap-1.5">
                            <Tag size={15} className="shrink-0 text-brand-fg" /> {t.type}
                          </li>
                        )}
                        {t.category && (
                          <li dir="auto" className="inline-flex items-center gap-1.5">
                            <FileText size={15} className="shrink-0 text-brand-fg" /> {t.category}
                          </li>
                        )}
                        {t.attachmentCount ? (
                          <li className="inline-flex items-center gap-1.5">
                            <Paperclip size={15} className="shrink-0 text-brand-fg" /> {t.attachmentCount} document{t.attachmentCount === 1 ? "" : "s"}
                          </li>
                        ) : null}
                      </ul>
                    </div>

                    {/* Closing date + button */}
                    <div className="flex flex-col justify-between gap-4 border-t border-brand-line/10 p-5 md:border-l md:border-t-0 md:p-6">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink/50">
                          <CalendarDays size={14} /> Closing date
                        </span>
                        <b className="mt-1 block text-[18px]">{formatDate(t.expirationDate)}</b>
                        {!closedNow && left !== null && (
                          <span className={`mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold ${left <= 3 ? "text-alert" : "text-emerald-700"}`}>
                            <Clock size={14} /> {left === 1 ? "Last day" : `${left} days left`}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center justify-between gap-2 bg-[#F4BA00] px-4 py-2.5 text-[14px] font-bold transition group-hover:bg-brand group-hover:text-white">
                        View details <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pages */}
          {totalPages > 1 && (
            <nav aria-label="Tender pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n, view)}
                  aria-current={n === page ? "page" : undefined}
                  className={`grid h-10 min-w-10 place-items-center border px-3 text-[15px] font-semibold transition ${
                    n === page ? "border-brand-line bg-brand text-white" : "border-brand-line/20 bg-paper hover:border-brand-line"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      {/* How to take part */}
      <section className="bg-paper py-12 md:py-16">
        <div className={CONTAINER}>
          <h2 className="text-[24px] font-extrabold md:text-[30px]">How to take part</h2>
          <span className="mt-3 block h-1 w-12 bg-[#F4BA00]" />
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { t: "Read the announcement", d: "Open the tender to see the requirements, location and closing date." },
              { t: "Download the documents", d: "Get the tender documents attached to the announcement." },
              { t: "Submit before the deadline", d: "Hand in your offer as described in the announcement before the closing date." },
            ].map((s, i) => (
              <li key={s.t} className="border-t-4 border-brand-line bg-mist p-6">
                <span className="text-[34px] font-extrabold leading-none text-[#F4BA00]">{String(i + 1).padStart(2, "0")}</span>
                <b className="mt-3 block text-[18px]">{s.t}</b>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[15px] text-ink/65">
            Questions about a tender?{" "}
            <Link href="/contact-us" className="font-bold text-brand-fg underline-offset-4 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
