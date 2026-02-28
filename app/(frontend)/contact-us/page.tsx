// app/contact-us/page.tsx
import React from "react";
import ContactHero from "./ContactHero"; // relative import (component placed next to page.tsx)
import ContactForm from "@/components/ContactForm";
import { sanityClient } from "@/sanity/lib/client";

// Generate page metadata (title, description, keywords) from the first contactUs document
export async function generateMetadata() {
  const data = await sanityClient.fetch(`*[_type == "contactUs"][0]{
    title,
    seo{seoTitle, metaDescription, keywords[]}
  }`);

  const title = data?.seo?.seoTitle || data?.title || "Contact Us";
  const description = data?.seo?.metaDescription || "";
  const keywords = data?.seo?.keywords ? data.seo.keywords.join(", ") : undefined;

  const metadata: any = { title, description };
  if (keywords) metadata.keywords = keywords;
  return metadata;
}

async function getContactData() {
  return sanityClient.fetch(`*[_type == "contactUs"][0]{
    title,
    subtitle,
    slug,
    heroImage,
    introTitle,
    introMessage,
    "introBackgroundEnabled": introBackground.enabled,
    bodyTitle,
    bodyMessage,
    "bodyBackgroundEnabled": bodyBackground.enabled,
    seo{seoTitle, metaDescription, keywords}
  }`);
}

// Types for blocks & spans
type Span = { _key?: string; _type?: string; text?: string; marks?: string[] };
type MarkDef = { _key?: string; href?: string; url?: string };
type Block = { _type?: string; style?: string; children?: Span[]; markDefs?: MarkDef[]; listItem?: "bullet" | "number"; _key?: string };

// Inline marks renderer
function renderChildren(children?: Span[], markDefs?: MarkDef[]) {
  if (!Array.isArray(children)) return null;
  return children.map((c, idx) => {
    const text = typeof c.text === "string" ? c.text : "";
    const marks = Array.isArray(c.marks) ? c.marks : [];
    if (marks.length === 0) return <React.Fragment key={c._key ?? idx}>{text}</React.Fragment>;

    return marks.reduce<React.ReactNode>((acc, mark) => {
      const def = Array.isArray(markDefs) ? markDefs.find((d) => d._key === mark) : null;
      if (def && (def.href || def.url)) {
        const href = def.href ?? def.url;
        const external = /^https?:\/\//.test(String(href));
        return (
          <a key={mark} href={String(href)} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="underline text-blue-600">
            {acc}
          </a>
        );
      }
      if (mark === "strong") return <strong key={mark}>{acc}</strong>;
      if (mark === "em") return <em key={mark}>{acc}</em>;
      if (mark === "underline") return <u key={mark}>{acc}</u>;
      if (mark === "code") return <code key={mark} className="rounded px-1 py-[0.08rem] text-sm font-mono bg-gray-100">{acc}</code>;

      return <span key={mark}>{acc}</span>;
    }, text);
  });
}

// Server-safe portable text renderer (handles headings, paragraphs, lists, links, marks, images)
function PortableTextRenderer({ value }: { value?: Block[] | null }) {
  if (!Array.isArray(value) || value.length === 0) return null;

  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < value.length) {
    const blk = value[i] as Block | undefined;
    if (!blk) { i++; continue; }

    if (blk._type === "block" && blk.listItem) {
      const listType = blk.listItem === "bullet" ? "ul" : "ol";
      const items: React.ReactNode[] = [];
      let j = i;
      while (j < value.length && (value[j] as Block)?._type === "block" && (value[j] as Block).listItem === blk.listItem) {
        const b = value[j] as Block;
        items.push(<li key={b._key ?? j} className="mb-1">{renderChildren(b.children, b.markDefs)}</li>);
        j++;
      }
      out.push(<div key={`list-${i}`} className="my-3">{listType === "ul" ? <ul className="list-disc pl-6">{items}</ul> : <ol className="list-decimal pl-6">{items}</ol>}</div>);
      i = j;
      continue;
    }

    if (blk._type === "block") {
      const style = blk.style ?? "normal";
      const children = renderChildren(blk.children, blk.markDefs);
      if (style === "h1") out.push(<h1 key={blk._key ?? i} className="text-[30px] md:text-[48px] font-extrabold mt-6 leading-tight">{children}</h1>);
      else if (style === "h2") out.push(<h2 key={blk._key ?? i} className="text-[24px] md:text-[36px] font-semibold mt-6 leading-tight">{children}</h2>);
      else if (style === "h3") out.push(<h3 key={blk._key ?? i} className="text-[20px] md:text-[28px] font-semibold mt-6 leading-tight">{children}</h3>);
      else out.push(<p key={blk._key ?? i} className="mt-4 text-base md:text-lg leading-relaxed">{children}</p>);
      i++;
      continue;
    }

    // image block fallback: Sanity image object may be shaped differently; try common props
    if (blk._type === "image" || (blk as any).asset?.url || (blk as any).url) {
      const src = (blk as any).asset?.url ?? (blk as any).url ?? undefined;
      const alt = (blk as any).alt ?? "";
      if (src) {
        out.push(
          <div key={blk._key ?? i} className="mt-6">
            <img src={src} alt={alt} className="w-full h-auto rounded-sm object-cover" />
          </div>
        );
      }
      i++;
      continue;
    }

    i++;
  }

  return <>{out}</>;
}

export default async function Page() {
  const contact = await getContactData();

  const hasIntroContent = Boolean(
    contact && (contact.introTitle || (Array.isArray(contact.introMessage) && contact.introMessage.length > 0))
  );

  const hasBodyContent = Boolean(
    contact && (contact.bodyTitle || (Array.isArray(contact.bodyMessage) && contact.bodyMessage.length > 0))
  );

  return (
    <main className="">
      {/* Hero */}
      <section className="my-12 w-full mx-auto md:max-w-[1440px] bg-[#02587B] h-[520px]">
        <ContactHero />
      </section>

      {/* Intro (render only when content exists in Sanity) */}
      {hasIntroContent && (
        <section className={`w-full mx-auto md:max-w-[1440px] ${contact?.introBackgroundEnabled ? 'bg-[#02587B] text-[#F5F5F5]' : ''}`}>
          <div className={`mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8 `}>
            {contact?.introTitle && <h2 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide mb-4">{contact.introTitle}</h2>}

            {Array.isArray(contact?.introMessage) && contact.introMessage.length > 0 && (
              <div className="prose mt-2 max-w-2xl">
                <PortableTextRenderer value={contact.introMessage} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Body (render under Intro only when there's body content) */}
      {hasBodyContent && (
        <section className={`w-full mx-auto md:max-w-[1440px] ${contact?.bodyBackgroundEnabled ? 'bg-[#02587B] text-[#F5F5F5]' : ''}`}>
          <div className={`mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-6 `}>
            {contact?.bodyTitle && <h3 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide mb-4">{contact.bodyTitle}</h3>}

            {Array.isArray(contact?.bodyMessage) && contact.bodyMessage.length > 0 && (
              <div className="prose mt-2 max-w-2xl">
                <PortableTextRenderer value={contact.bodyMessage} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className="mx-auto w-full max-w-[1440px] py-10">
        <ContactForm />
      </section>
    </main>
  );
}