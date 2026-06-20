// app/(frontend)/tenders/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
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

type TendersPageProps = {
  searchParams?: Promise<{
    page?: string;
    view?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tenders",
    description: "Browse active and archived tenders, announcements, and downloadable tender details.",
  };
}

const formatDate = (value?: string | null) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const isExpiredTender = (tender: TenderListItem, now: Date) => {
  if (!tender.expirationDate) return false;
  const exp = new Date(tender.expirationDate);
  return !Number.isNaN(exp.getTime()) ? exp < now : false;
};

const buildPageHref = (page: number, view: "active" | "archived") => {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (view === "archived") params.set("view", "archived");

  const query = params.toString();
  return query ? `/tenders?${query}` : "/tenders";
};

export default async function TendersPage({ searchParams }: TendersPageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view === "archived" ? "archived" : "active";

  const pageParam = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const itemsPerPage = 6;

  const query = `*[_type == "tender"] | order(publishDate desc, _createdAt desc){
    _id,
    title,
    "slug": slug.current,
    refNo,
    category,
    publishDate,
    expirationDate,
    location,
    type,
    "descriptionText": pt::text(description),
    "attachmentCount": count(attachments)
  }`;

  let tenders: TenderListItem[] = [];

  try {
    tenders = await sanityClient.fetch(query);
  } catch (error) {
    console.error("Failed to fetch tenders:", error);
    tenders = [];
  }

  const now = new Date();

  const activeTenders = tenders.filter((t) => !isExpiredTender(t, now));
  const archivedTenders = tenders.filter((t) => isExpiredTender(t, now));

  const visibleTenders = view === "archived" ? archivedTenders : activeTenders;
  const totalItems = visibleTenders.length;
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTenders = visibleTenders.slice(startIndex, endIndex);

  const pageRangeStart = totalItems === 0 ? 0 : startIndex + 1;
  const pageRangeEnd = Math.min(endIndex, totalItems);
  const isArchivedView = view === "archived";

  return (
    <main className="bg-[#F3F7FB] text-[#0F172A] font-rubik">
      <section className="relative overflow-hidden bg-[#062B3B] text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(244,186,0,0.35) 0, transparent 24%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12) 0, transparent 18%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0))",
          }}
        />
        <div className="relative mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-16 md:py-20">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs md:text-sm tracking-[0.3em] uppercase">
            Announcements
          </p>

          <div className="mt-5 max-w-3xl">
            <h1 className="text-[42px] md:text-[70px] lg:text-[88px] font-extrabold leading-[0.95]">
              Tenders
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/80 max-w-2xl">
              Explore current opportunities, view complete tender details, and download attachments from one clean, Sanity-powered listing.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5">
              <div className="text-3xl font-bold">{tenders.length}</div>
              <div className="mt-1 text-sm text-white/75">Total tenders</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5">
              <div className="text-3xl font-bold">{activeTenders.length}</div>
              <div className="mt-1 text-sm text-white/75">Active tenders</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5">
              <div className="text-3xl font-bold">{archivedTenders.length}</div>
              <div className="mt-1 text-sm text-white/75">Archived tenders</div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-12 w-full mx-auto md:max-w-[1440px]">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h2 className="text-[26px] md:text-[40px] font-extrabold">
                {isArchivedView ? "Archived Tenders" : "Latest Tenders"}
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-600">
                {isArchivedView
                  ? "These tenders have passed their expiration date."
                  : "Only active tenders are shown here."}
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {totalItems > 0 ? (
                <span>
                  Showing {pageRangeStart}-{pageRangeEnd} of {totalItems}
                </span>
              ) : (
                <span>No tenders found</span>
              )}
            </div>
          </div>

          {totalItems === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-slate-500">
              {isArchivedView
                ? "No archived tenders are available at the moment."
                : "No active tenders available at the moment."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedTenders
                .filter((t) => typeof t.slug === "string" && t.slug.length > 0)
                .map((t, index) => {
                  const expired = isExpiredTender(t, now);

                  return (
                    <Link
                      key={t._id}
                      href={`/tenders/${t.slug}`}
                      className="group block h-full"
                    >
                      <article className="relative h-full overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                        <div
                          className="absolute inset-x-0 top-0 h-2"
                          style={{
                            background:
                              index % 3 === 0
                                ? "linear-gradient(90deg, #F4BA00, #FEDB76)"
                                : index % 3 === 1
                                  ? "linear-gradient(90deg, #02587B, #56A8C6)"
                                  : "linear-gradient(90deg, #0F172A, #334155)",
                          }}
                        />

                        <div className="p-6 md:p-7 pt-8">
                          <div className="flex items-start justify-between gap-4">
                            <span className="inline-flex rounded-full bg-[#F4BA00] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1A1A1A]">
                              {t.refNo ?? "NO REF"}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                expired
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {expired ? "Inactive" : "Active"}
                            </span>
                          </div>

                          <h3 className="mt-5 text-[24px] md:text-[28px] font-extrabold leading-tight text-[#0F172A]">
                            {t.title ?? "Untitled Tender"}
                          </h3>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {t.category ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {t.category}
                              </span>
                            ) : null}
                            {t.type ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {t.type}
                              </span>
                            ) : null}
                            {t.attachmentCount ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {t.attachmentCount} attachment{t.attachmentCount === 1 ? "" : "s"}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="text-slate-500">Publish Date</div>
                              <div className="mt-1 font-bold text-slate-900">
                                {formatDate(t.publishDate)}
                              </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="text-slate-500">Expiration</div>
                              <div className="mt-1 font-bold text-slate-900">
                                {formatDate(t.expirationDate)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="text-slate-500">Location</div>
                              <div className="mt-1 font-bold text-slate-900">
                                {t.location ?? "Not specified"}
                              </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="text-slate-500">Type</div>
                              <div className="mt-1 font-bold text-slate-900">
                                {t.type ?? "Not specified"}
                              </div>
                            </div>
                          </div>

                          <p
                            className="mt-5 text-sm md:text-[15px] leading-6 text-slate-600"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {t.descriptionText ||
                              "Open this tender to read the full description, contact details, and attachments."}
                          </p>

                          <div className="mt-6 inline-flex items-center gap-2 font-bold text-[#02587B]">
                            View details
                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
            </div>
          )}

          {totalItems > 0 ? (
            <div className="mt-10 flex flex-col items-center gap-5">
              {totalPages > 1 ? (
                <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Tenders pagination">
                  <Link
                    href={buildPageHref(Math.max(safeCurrentPage - 1, 1), view)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      safeCurrentPage === 1
                        ? "pointer-events-none bg-slate-200 text-slate-400"
                        : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                    }`}
                  >
                    Previous
                  </Link>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const active = pageNumber === safeCurrentPage;

                    return (
                      <Link
                        key={pageNumber}
                        href={buildPageHref(pageNumber, view)}
                        aria-current={active ? "page" : undefined}
                        className={`min-w-10 rounded-full px-4 py-2 text-sm font-semibold text-center transition ${
                          active
                            ? "bg-[#02587B] text-white shadow-md"
                            : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}

                  <Link
                    href={buildPageHref(Math.min(safeCurrentPage + 1, totalPages), view)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      safeCurrentPage === totalPages
                        ? "pointer-events-none bg-slate-200 text-slate-400"
                        : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                    }`}
                  >
                    Next
                  </Link>
                </nav>
              ) : null}

              {!isArchivedView ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/tenders?view=archived"
                    className="inline-flex items-center justify-center rounded-full bg-[#F4BA00] px-5 py-3 text-sm font-extrabold text-[#1A1A1A] shadow-sm transition hover:opacity-90"
                  >
                    Archived Tenders List
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}