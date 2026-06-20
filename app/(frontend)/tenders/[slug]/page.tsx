import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DownloadButton from "@/components/DownloadButton";
import { sanityClient } from "@/sanity/lib/client";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

export const revalidate = 60;

type PortableTextSpan = {
  _type?: "span";
  text?: string;
  marks?: string[];
};

type PortableTextMarkDef = {
  _key?: string;
  _type?: string;
  href?: string;
  url?: string;
};

type PortableTextBlock = {
  _key?: string;
  _type?: string;
  style?: string;
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  listItem?: string;
  level?: number;
  assetUrl?: string;
  alt?: string;
};

type Attachment = {
  url?: string;
  filename?: string;
};

type TenderDoc = {
  _id: string;
  title?: string;
  slug?: string;
  refNo?: string;
  category?: string;
  publishDate?: string;
  expirationDate?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  location?: string;
  type?: string;
  attachments?: Attachment[];
  description?: PortableTextBlock[];
};

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

const isExpiredTender = (expirationDate?: string | null) => {
  if (!expirationDate) return false;
  const exp = new Date(expirationDate);
  return !Number.isNaN(exp.getTime()) ? exp < new Date() : false;
};

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 text-base md:text-lg leading-8 text-slate-700">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="mt-8 text-[30px] md:text-[48px] font-extrabold leading-tight text-slate-900">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 text-[24px] md:text-[36px] font-semibold leading-tight text-slate-900">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-[20px] md:text-[28px] font-semibold leading-tight text-slate-900">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-5 border-r-4 border-[#02587B] pr-4 text-slate-700 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }: any) => {
      const href = value?.href ?? value?.url;
      if (!href) return <>{children}</>;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#02587B] underline"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc pr-6 space-y-2 text-slate-700">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal pr-6 space-y-2 text-slate-700">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-8">{children}</li>,
    number: ({ children }) => <li className="leading-8">{children}</li>,
  },
  types: {
    image: ({ value }: any) => {
      const src = value?.assetUrl ?? value?.asset?.url;
      if (!src) return null;

      return (
        <div className="my-6">
          <img
            src={src}
            alt={value?.alt ?? "image"}
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>
      );
    },
  },
  hardBreak: () => <br />,
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;

    const query = `*[_type == "tender" && slug.current == $slug][0]{
      title,
      refNo,
      category,
      "descriptionText": pt::text(description)
    }`;

    const tender = await sanityClient.fetch(query, { slug });

    if (!tender) {
      return { title: "Tender Not Found" };
    }

    return {
      title: `${tender.title ?? "Tender"} | Tenders`,
      description:
        tender.descriptionText ||
        `View tender ${tender.refNo ?? ""} ${tender.category ? `in ${tender.category}` : ""}`.trim(),
    };
  } catch (error) {
    console.error("Metadata fetch failed:", error);
    return { title: "Tender" };
  }
}

export default async function TenderDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const query = `*[_type == "tender" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    refNo,
    category,
    publishDate,
    expirationDate,
    contactPersonName,
    contactPersonPhone,
    contactPersonEmail,
    location,
    type,
    "attachments": attachments[]{
      "url": asset->url,
      "filename": asset->originalFilename
    },
    description[]{
      ...,
      "assetUrl": asset->url
    }
  }`;

  let tender: TenderDoc | null = null;

  try {
    tender = await sanityClient.fetch(query, { slug });
  } catch (error) {
    console.error("Failed to fetch tender:", error);
    tender = null;
  }

  if (!tender) {
    notFound();
  }

  const expired = isExpiredTender(tender.expirationDate);
  const attachments = Array.isArray(tender.attachments) ? tender.attachments : [];
  const descriptionBlocks = Array.isArray(tender.description) ? tender.description : [];

  return (
    <main className="bg-[#F3F7FB] text-[#0F172A] font-rubik">
      <section className="relative overflow-hidden bg-[#062B3B] text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(244,186,0,0.32) 0, transparent 22%), radial-gradient(circle at 82% 30%, rgba(255,255,255,0.12) 0, transparent 18%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0))",
          }}
        />
        <div className="relative mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-18 md:py-18">
          <Link
            href="/tenders"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-white/90 hover:bg-white/15"
          >
            ← Back to tenders
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-[#F4BA00] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1A1A1A]">
                {tender.refNo ?? "NO REF"}
              </span>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                {tender.category ?? "Uncategorized"}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  expired ? "bg-rose-500/20 text-rose-200" : "bg-emerald-500/20 text-emerald-200"
                }`}
              >
                {expired ? "Closed" : "Open"}
              </span>
            </div>

            <h1
              dir="rtl"
              style={{ textAlign: "justify" }}
              className="mt-5 text-[28px] md:text-[36px] lg:text-[36px] font-extrabold leading-[1.3]"
            >
              {tender.title ?? "Untitled Tender"}
            </h1>

            <p className="mt-5 max-w-3xl text-white/80 text-base md:text-lg leading-7">
              Full tender information, contact details, and downloadable attachments are shown below.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Publish</div>
              <div className="mt-2 font-bold">{formatDate(tender.publishDate)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Expiry</div>
              <div className="mt-2 font-bold">{formatDate(tender.expirationDate)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Location</div>
              <div className="mt-2 font-bold">{tender.location ?? "Not specified"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Type</div>
              <div className="mt-2 font-bold">{tender.type ?? "Not specified"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-12 w-full mx-auto md:max-w-[1440px]">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <section className="rounded-[28px] bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-[#0F172A]">
                  Description
                </h2>

                <div
                  dir="rtl"
                  style={{ textAlign: "justify" }}
                  className="mt-4 prose prose-lg max-w-none prose-p:leading-8 prose-strong:font-bold prose-strong:text-slate-900 prose-em:italic prose-headings:text-slate-900 prose-li:leading-8"
                >
                  {descriptionBlocks.length > 0 ? (
                    <PortableText value={descriptionBlocks} components={portableTextComponents} />
                  ) : (
                    <p className="text-slate-600">No description available.</p>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-[#0F172A]">
                  Attachments
                </h2>

                {attachments.length > 0 ? (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((file, idx) => {
                      const url = file?.url;
                      const filename =
                        file?.filename ||
                        (url ? url.split("/").pop() : null) ||
                        `attachment-${idx + 1}.pdf`;

                      return (
                        <div
                          key={`${filename}-${idx}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="text-sm font-semibold text-slate-500">
                            Attachment {idx + 1}
                          </div>
                          <div className="mt-2 font-bold text-slate-900 break-all">
                            {filename}
                          </div>

                          <div className="mt-4">
                            {url ? (
                              <DownloadButton url={url} filename={filename}>
                                <span className="px-4 font-bold">Download</span>
                              </DownloadButton>
                            ) : (
                              <div className="text-sm text-slate-500">No file available</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-slate-600">No attachments uploaded for this tender.</p>
                )}
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <section className="rounded-[28px] bg-[#02587B] p-6 md:p-7 text-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
                <h2 className="text-[22px] md:text-[28px] font-extrabold">Tender Details</h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Ref No</div>
                    <div className="mt-1 font-bold">{tender.refNo ?? "Not specified"}</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Category</div>
                    <div className="mt-1 font-bold">{tender.category ?? "Not specified"}</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Location</div>
                    <div className="mt-1 font-bold">{tender.location ?? "Not specified"}</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Type</div>
                    <div className="mt-1 font-bold">{tender.type ?? "Not specified"}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] bg-white p-6 md:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                <h2 className="text-[22px] md:text-[28px] font-extrabold text-[#0F172A]">
                  Contact Person
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="text-sm text-slate-500">Name</div>
                    <div className="mt-1 font-bold text-slate-900">
                      {tender.contactPersonName ?? "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">Phone</div>
                    <div className="mt-1 font-bold text-slate-900">
                      {tender.contactPersonPhone ? (
                        <a href={`tel:${tender.contactPersonPhone}`} className="underline">
                          {tender.contactPersonPhone}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <div className="mt-1 font-bold text-slate-900 break-all">
                      {tender.contactPersonEmail ? (
                        <a href={`mailto:${tender.contactPersonEmail}`} className="underline">
                          {tender.contactPersonEmail}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] bg-[#F4BA00] p-6 md:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.08)] text-[#1A1A1A]">
                <h2 className="text-[22px] md:text-[28px] font-extrabold">Quick View</h2>
                <p className="mt-3 text-sm md:text-base leading-7">
                  Published on {formatDate(tender.publishDate)} and closing on {formatDate(tender.expirationDate)}.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}