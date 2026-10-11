// app/(frontend)/tenders/[slug]/page.tsx

import React from "react";

import type { Metadata } from "next";


import { notFound } from "next/navigation";

import DownloadButton from "@/components/DownloadButton";
import PageHeader from "@/components/PageHeader";

import { sanityClient } from "@/sanity/lib/client";

export const revalidate = 60;

type Span = { _type?: string; text?: string; marks?: string[] };

type MarkDef = { _key?: string; href?: string; url?: string };

type Block = {

  _type?: string;

  style?: string;

  children?: Span[];

  markDefs?: MarkDef[];

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

  description?: Block[];

};

const renderSpan = (child: Span, markDefs?: MarkDef[], keyBase = "") => {

  const text = typeof child?.text === "string" ? child.text : "";

  const marks = Array.isArray(child?.marks) ? child.marks : [];

  let node: React.ReactNode = text;

  for (const mark of marks) {

    if (mark === "strong") node = <strong key={`${keyBase}-strong`}>{node}</strong>;

    else if (mark === "em") node = <em key={`${keyBase}-em`}>{node}</em>;

    else {

      const md = Array.isArray(markDefs) ? markDefs.find((d) => d._key === mark) : undefined;

      if (md && (md.href || md.url)) {

        const href = (md.href ?? md.url) as string;

        node = (

          <a key={`${keyBase}-a`} href={href} target="_blank" rel="noopener noreferrer" className="underline">

            {node}

          </a>

        );

      } else {

        node = <span key={`${keyBase}-span`}>{node}</span>;

      }

    }

  }

  return <React.Fragment key={keyBase}>{node}</React.Fragment>;

};

const renderBlock = (block: Block, i: number) => {

  if (!block || typeof block !== "object") return null;

  if (block._type === "image" || typeof block.assetUrl === "string") {

    const src = typeof block.assetUrl === "string" ? block.assetUrl : undefined;

    if (!src) return null;

    return (

      <div key={`img-${i}`} className="mt-6">

        <img src={src} alt={block.alt ?? "image"} className="w-full h-auto object-cover" />

      </div>

    );

  }

  if (block._type === "block" && Array.isArray(block.children)) {

    const style = block.style ?? "normal";

    const children = block.children.map((c, idx) => renderSpan(c, block.markDefs, `c-${i}-${idx}`));

    if (style === "h1") return <h1 key={`h1-${i}`} className="text-[30px] md:text-[48px] font-extrabold mt-8 leading-tight">{children}</h1>;

    if (style === "h2") return <h2 key={`h2-${i}`} className="text-[24px] md:text-[36px] font-semibold mt-8 leading-tight">{children}</h2>;

    if (style === "h3") return <h3 key={`h3-${i}`} className="text-[20px] md:text-[28px] font-semibold mt-8 leading-tight">{children}</h3>;

    return <p key={`p-${i}`} className="mt-4 text-base md:text-lg leading-8 text-slate-700">{children}</p>;

  }

  return null;

};

const renderBlocks = (blocks?: Block[] | null) => (Array.isArray(blocks) ? blocks.map((b, idx) => renderBlock(b, idx)) : null);

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

      return {

        title: "Tender Not Found",

      };

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

    description[]{..., "assetUrl": asset->url}

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

  const expired =

    tender.expirationDate && !Number.isNaN(new Date(tender.expirationDate).getTime())

      ? new Date(tender.expirationDate) < new Date()

      : false;

  const attachments = Array.isArray(tender.attachments) ? tender.attachments : [];

  const descriptionBlocks = Array.isArray(tender.description) ? tender.description : [];

  return (

    <main className="bg-[#F3F7FB] text-[#0F172A] font-rubik">

      <PageHeader
        title={tender.title ?? "Procurement Opportunities"}
        breadcrumbLinks={[
          { label: "Home", href: "/" },
          { label: "Tenders", href: "/tenders" },
        ]}
        breadcrumbLabel="Tender Details"
        headerMessage="Review the tender summary, important dates, location, and downloadable documents below."
      />

      <section className="relative z-10 mt-15 w-full mx-auto px-5 md:max-w-[1440px]">
        <div className="mx-auto max-w-[1140px] border border-slate-200 bg-white p-5 shadow-[0_15px_45px_rgba(2,88,123,0.12)] md:p-7">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex bg-[#F4BA00] px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#1A1A1A]">
              {tender.refNo ?? "NO REF"}
            </span>
            <span className="inline-flex bg-[#02587B]/10 px-3 py-1.5 text-xs font-bold text-[#02587B]">
              {tender.category ?? "Uncategorized"}
            </span>
            <span
              className={`inline-flex px-3 py-1.5 text-xs font-bold ${
                expired ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {expired ? "Closed" : "Active"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-slate-100 bg-[#F5F9FB] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Publish Date</div>
              <div className="mt-2 font-bold text-[#02587B]">{formatDate(tender.publishDate)}</div>
            </div>
            <div className="border border-slate-100 bg-[#F5F9FB] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Expiry Date</div>
              <div className="mt-2 font-bold text-[#02587B]">{formatDate(tender.expirationDate)}</div>
            </div>
            <div className="border border-slate-100 bg-[#F5F9FB] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Location</div>
              <div className="mt-2 font-bold text-[#02587B]">{tender.location ?? "Not specified"}</div>
            </div>
            <div className="border border-slate-100 bg-[#F5F9FB] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Type</div>
              <div className="mt-2 font-bold text-[#02587B]">{tender.type ?? "Not specified"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-12 w-full mx-auto md:max-w-[1440px]">

        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <div className="lg:col-span-8 space-y-6">

              <section className=" bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">

                <h2 className="text-[24px] md:text-[34px] font-extrabold text-[#0F172A]">Description</h2>

                <div dir="rtl" style={{textAlign: "justify"}} className="mt-3 prose max-w-none">

                  {descriptionBlocks.length > 0 ? (

                    renderBlocks(descriptionBlocks)

                  ) : (

                    <p className="text-slate-600">No description available.</p>

                  )}

                </div>

              </section>

              <section className=" bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">

                <h2 className="text-[24px] md:text-[34px] font-extrabold text-[#0F172A]">Attachments</h2>

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

                          className="border border-slate-200 bg-slate-50 p-5"

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

              <section className=" bg-[#02587B] p-6 md:p-7 text-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]">

                <h2 className="text-[22px] md:text-[28px] font-extrabold">Tender Details</h2>

                <div className="mt-5 space-y-4">

                  <div className="bg-white/10 p-4">

                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Ref No</div>

                    <div className="mt-1 font-bold">{tender.refNo ?? "Not specified"}</div>

                  </div>

                  <div className="bg-white/10 p-4">

                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Category</div>

                    <div className="mt-1 font-bold">{tender.category ?? "Not specified"}</div>

                  </div>

                  <div className="bg-white/10 p-4">

                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Location</div>

                    <div className="mt-1 font-bold">{tender.location ?? "Not specified"}</div>

                  </div>

                  <div className="bg-white/10 p-4">

                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Type</div>

                    <div className="mt-1 font-bold">{tender.type ?? "Not specified"}</div>

                  </div>

                </div>

              </section>

              <section className=" bg-white p-6 md:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">

                <h2 className="text-[22px] md:text-[28px] font-extrabold text-[#0F172A]">Contact Person</h2>

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

              <section className="bg-[#F4BA00] p-6 md:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.08)] text-[#1A1A1A]">

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
