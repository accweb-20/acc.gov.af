// app/about-us/page.tsx
import React from "react";
import { Metadata } from "next";
import { sanityClient } from "@/sanity/lib/client";
import Link from "next/link";
import DownloadButton from "@/components/DownloadButton";
import PageHeader from "@/components/PageHeader";
import { div } from "framer-motion/client";

export const revalidate = 60;

// ---------- Metadata (simple fallback) ----------
export async function generateMetadata(): Promise<Metadata> {
  try {
    const groq = `*[_type == "aboutUs" && lower(title) == lower($title)][0]{
      "seoTitle": coalesce(seo.seoTitle, title),
      "metaDescription": seo.metaDescription,
      "keywords": seo.keywords,
      "hero": desktopHeroImage.asset->url
    }`;
    const seoDoc = await sanityClient.fetch(groq, { title: "About Us" });
    return {
      title: seoDoc?.seoTitle ?? "About Us",
      description: seoDoc?.metaDescription ?? undefined,
      keywords: Array.isArray(seoDoc?.keywords) ? seoDoc.keywords : undefined,
      openGraph: seoDoc?.hero ? { images: [{ url: seoDoc.hero }] } : undefined,
    } as Metadata;
  } catch (err) {
    console.error(err);
    return { title: "About Us" } as Metadata;
  }
}

// Types for Portable Text-like blocks (small subset used for rendering)
type Span = { _type?: string; text?: string; marks?: string[]; _key?: string };
type MarkDef = { _key?: string; href?: string; url?: string };
type Block = {
  _type?: string;
  style?: string;
  children?: Span[];
  markDefs?: MarkDef[];
  assetUrl?: string;
  alt?: string;
  listItem?: "bullet" | "number";
  _key?: string;
};

// Helper to render inline marks (strong, em, underline, code, links)
const renderSpan = (child: Span, markDefs?: MarkDef[], keyBase = "") => {
  const text = typeof child?.text === "string" ? child.text : "";
  const marks = Array.isArray(child?.marks) ? child.marks : [];
  let node: React.ReactNode = text;

  // Wrap marks in order (left-to-right)
  for (const mark of marks) {
    if (mark === "strong") node = <strong key={`${keyBase}-strong`}>{node}</strong>;
    else if (mark === "em") node = <em key={`${keyBase}-em`}>{node}</em>;
    else if (mark === "underline") node = <u key={`${keyBase}-underline`}>{node}</u>;
    else if (mark === "code") node = <code key={`${keyBase}-code`} className="rounded px-1 py-[0.08rem] text-sm font-mono bg-gray-100">{node}</code>;
    else {
      const md = Array.isArray(markDefs) ? markDefs.find((d) => d._key === mark) : undefined;
      if (md && (md.href || md.url)) {
        const href = (md.href ?? md.url) as string;
        // open external links in new tab
        const external = /^https?:\/\//.test(href);
        node = (
          <a key={`${keyBase}-a`} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="underline text-blue-600">
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

// Render a single block (non-list)
const renderBlock = (block: Block, i: number) => {
  if (!block || typeof block !== "object") return null;

  // image block
  if (block._type === "image" || typeof block.assetUrl === "string") {
    const src = typeof block.assetUrl === "string" ? block.assetUrl : undefined;
    if (!src) return null;
    return (
      <div key={`img-${i}`} className="mt-6">
        <img src={src} alt={block.alt ?? "image"} className="w-full h-auto rounded-sm object-cover" />
      </div>
    );
  }

  // text block
  if (block._type === "block" && Array.isArray(block.children)) {
    const style = block.style ?? "normal";
    const children = block.children.map((c, idx) => renderSpan(c, block.markDefs, `c-${i}-${idx}`));

    if (style === "h1") return <h1 key={`h1-${i}`} className="text-[30px] md:text-[48px] font-extrabold mt-6 leading-tight">{children}</h1>;
    if (style === "h2") return <h2 key={`h2-${i}`} className="text-[24px] md:text-[36px] font-semibold mt-6 leading-tight">{children}</h2>;
    if (style === "h3") return <h3 key={`h3-${i}`} className="text-[20px] md:text-[28px] font-semibold mt-6 leading-tight">{children}</h3>;

    return <p key={`p-${i}`} className="mt-4 text-base md:text-lg leading-relaxed">{children}</p>;
  }

  return null;
};

// New: renderBlocks supports lists (group consecutive listItem blocks)
const renderBlocks = (blocks?: Block[] | null) => {
  if (!Array.isArray(blocks)) return null;
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const blk = blocks[i];
    if (!blk) { i++; continue; }

    // handle list group
    if (blk._type === "block" && blk.listItem) {
      const listType = blk.listItem === "bullet" ? "ul" : "ol";
      const items: React.ReactNode[] = [];
      let j = i;
      while (j < blocks.length && (blocks[j]?._type === "block") && (blocks[j] as Block).listItem === blk.listItem) {
        const b = blocks[j] as Block;
        const children = Array.isArray(b.children) ? b.children.map((c, idx) => renderSpan(c, b.markDefs, `li-${j}-${idx}`)) : null;
        items.push(<li key={b._key ?? j} className="mb-1">{children}</li>);
        j++;
      }
      out.push(
        <div key={`list-${i}`} className="my-3">
          {listType === "ul" ? <ul className="list-disc pl-6">{items}</ul> : <ol className="list-decimal pl-6">{items}</ol>}
        </div>
      );
      i = j;
      continue;
    }

    // fallback to normal block rendering
    out.push(renderBlock(blk, i));
    i++;
  }

  return out;
};

// ---- Page component ----
export default async function AboutUsPage() {
  // GROQ: fetch aboutUs doc by title (case-insensitive)
  const pageQuery = `*[_type == "aboutUs" && lower(title) == lower($title)][0]{
    title,
    "desktopHero": desktopHeroImage.asset->url,
    "mobileHero": mobileHeroImage.asset->url,
    introTitle,
    "introBody": introBody[]{..., "assetUrl": asset->url},
    contentTitle,
    "contentBody": contentBody[]{..., "assetUrl": asset->url},
    topics[]{topicTitle, "topicBody": topicBody[]{..., "assetUrl": asset->url}},
    endTitle,
    "endBody": endBody[]{..., "assetUrl": asset->url},
    seo
  }`;

  const annualQuery = `*[_type == "annualReport"]{_id, title, "pdfUrl": pdf.asset->url}|order(_createdAt desc)`;
  const policyQuery = `*[_type == "policy"]{_id, title, "pdfUrl": pdf.asset->url}|order(_createdAt desc)`;

  let doc: any = null;
  let annuals: { _id: string; title?: string; pdfUrl?: string }[] = [];
  let policies: { _id: string; title?: string; pdfUrl?: string }[] = [];

  try {
    doc = await sanityClient.fetch(pageQuery, { title: "About Us" });
  } catch (err) {
    console.error("Failed to fetch aboutUs page:", err);
  }

  try {
    annuals = await sanityClient.fetch(annualQuery);
  } catch (err) {
    console.error("Failed to fetch annuals:", err);
  }

  try {
    policies = await sanityClient.fetch(policyQuery);
  } catch (err) {
    console.error("Failed to fetch policies:", err);
  }

  const title = doc?.title ?? "About Us";
  const desktopHero = doc?.desktopHero ?? null;
  const mobileHero = doc?.mobileHero ?? null;

  const introTitle = doc?.introTitle ?? "";
  const introBody = Array.isArray(doc?.introBody) ? (doc.introBody as Block[]) : [];

  const contentTitle = doc?.contentTitle ?? "";
  const contentBody = Array.isArray(doc?.contentBody) ? (doc.contentBody as Block[]) : [];

  const topics = Array.isArray(doc?.topics) ? doc.topics : [];

  const endTitle = doc?.endTitle ?? "";
  const endBody = Array.isArray(doc?.endBody) ? (doc.endBody as Block[]) : [];

  // Layout container sizes
  const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <section className="my-12 w-full mx-auto md:max-w-[1440px]">
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
        {children}
      </div>
    </section>
  );

  return (
    <main className="bg-white text-[#1A1A1A] font-rubik">
      {/* Use the shared PageHeader component */}
      <PageHeader
        title={""}
        subtitle={doc?.subtitle ?? undefined}
        desktopHero={desktopHero}
        mobileHero={mobileHero}
        // you can pass overlayColor, priority, containerMaxWidth props if needed
      />

      {/* INTRO */}
      <Container>
        {introTitle ? <h2 className="text-[45px] md:text-[60px] font-extrabold -mt-12">{introTitle}</h2> : null}
        <div className="prose max-w-none" style={{ textAlign: "justify" }}>
          {renderBlocks(introBody)}
        </div>
      </Container>

      {/* CONTENT */}
      <Container>
        {contentTitle ? <h2 className="text-[45px] md:text-[60px] font-extrabold -mt-20">{contentTitle}</h2> : null}
        <div className="prose max-w-none" style={{ textAlign: "justify" }}>
          {renderBlocks(contentBody)}
        </div>
      </Container>

      {/* TOPICS - card grid */}
      <section className="w-full mx-auto bg-[#E0E8EB] text-[#F5F5F5] py-12 font-rubik">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-20 mt-12">
            {topics.length === 0 ? (
              <div className="text-sm text-gray-600">No topics available.</div>
            ) : (
              topics
                .filter(Boolean)
                .map((t: any, idx: number) => {
                  const key = t?._id ?? idx;
                  const topicTitle = typeof t?.topicTitle === "string" ? t.topicTitle : "";
                  const topicBody = Array.isArray(t?.topicBody) ? t.topicBody : [];
                  return (
                    <article key={key} className="bg-[#02587B] shadow-lg p-12 hover:shadow-3xl transition-shadow duration-300">
                      {topicTitle ? <h3 className="text-[20px] md:text-[24px] font-bold mb-3">{topicTitle}</h3> : null}
                      <div className="prose max-w-none" style={{ textAlign: "justify" }}>
                        {renderBlocks(topicBody)}
                      </div>
                    </article>
                  );
                })
            )}
          </div>
        </div>
      </section>

      {/* END SECTION */}
      <Container>
        {endTitle ? <h2 className="text-[45px] md:text-[60px] font-extrabold -mt-12">{endTitle}</h2> : null}
        <div className="prose max-w-none" style={{ textAlign: "justify" }}>
          {renderBlocks(endBody)}
        </div>
      </Container>

      {/* DOWNLOADABLES: Annual Reports + Policies */}
      <section className="w-full mx-auto bg-[#02587B] py-12 font-rubik">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px]">
          <h2 className="text-[45px] md:text-[60px] font-extrabold mb-6 text-[#F5F5F5]">DOWNLOADABLES</h2>

          {/* Annual reports grid */}
          {annuals.length ===  0 ? (
            <span></span>
          ) : (
            <div className="mb-8">
            <h3 className="text-[22px] md:text-[28px] font-bold mb-4 text-[#F5F5F5]">ANNUAL REPORTS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {annuals.length === 0 ? (
                <div className="text-sm text-[#F5F5F5]">No annual reports available.</div>
              ) : (
                annuals.map((a) => {
                  const filename =
                    (a.title && String(a.title)) ??
                    (a.pdfUrl && String(a.pdfUrl).split("/").pop()) ??
                    "report.pdf";

                  return (
                    <div
                      key={a._id}
                      className="relative bg-white shadow-sm overflow-hidden p-4"
                      style={{ minHeight: 140 }}
                    >
                      <div className="text-[20px] md:text-[24px] font-bold truncate text-[#1A1A1A]">
                        {a.title ?? "Untitled Report"}
                      </div>

                      <div className="absolute left-4 bottom-4">
                        {a.pdfUrl ? (
                          <DownloadButton url={a.pdfUrl} filename={filename}>
                            <span className="px-4 font-bold">Download</span>
                          </DownloadButton>
                        ) : (
                          <div className="text-sm text-gray-500">No file</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          )}

          {/* Policies grid */}
          <div className="mt-12">
            <h3 className="text-[22px] md:text-[28px] font-bold mb-4 text-white">POLICIES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {policies.length === 0 ? (
                <div className="text-sm text-white">No policies available.</div>
              ) : (
                policies.map((p) => {
                  const filename =
                    (p.title && String(p.title)) ??
                    (p.pdfUrl && String(p.pdfUrl).split("/").pop()) ??
                    "policy.pdf";

                  return (
                    <div
                      key={p._id}
                      className="relative bg-white shadow-sm overflow-hidden p-4"
                      style={{ minHeight: 180 }}
                    >
                      <div className="font-bold text-[20px] md:text-[24px] leading-tight text-[#1A1A1A]">
                        {p.title ?? "Untitled Policy"}
                      </div>

                      <div className="absolute left-4 bottom-4">
                        {p.pdfUrl ? (
                          <DownloadButton url={p.pdfUrl} filename={filename}>
                            <span className="px-4 font-bold">Download</span>
                          </DownloadButton>
                        ) : (
                          <div className="text-sm text-gray-500">No file</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Simple footer CTA */}
      <section className="py-10 w-full max-w-[1440px] mx-auto bg-white">
        <div className="w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] mx-auto">
          <h2 className="mb-5 text-lg font-extrabold">FOR MORE INFORMATION</h2>
          <div className="flex gap-6">
            <a href="tel:0202925043" className="no-underline">
              <button className="font-extrabold text-[#1A1A1A] hover:opacity-95" style={{ backgroundColor: "#F4BA00", clipPath: "polygon(0 0, 100% 15%, 100% 100%, 0% 100%)", padding: "6px 30px", cursor: "pointer" }}>
                Call Us
              </button>
            </a>

            <a href="mailto:info@acc.gov.af" className="no-underline">
              <button className="font-extrabold text-[#1A1A1A] hover:opacity-95" style={{ backgroundColor: "#F4BA00", clipPath: "polygon(0 0, 100% 15%, 100% 100%, 0% 100%)", padding: "6px 30px", cursor: "pointer" }}>
                Email Us
              </button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}