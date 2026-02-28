// components/Import/ImportIntro.tsx
"use client";

import React from "react";
import { getImageUrl } from "@/sanity/lib/client";

type Child = { _key?: string; text?: string; marks?: string[]; [k: string]: any };
type Block = {
  _type?: string;
  style?: string;
  children?: Child[];
  _key?: string;
  markDefs?: any[];
  listItem?: "bullet" | "number";
  asset?: any;
  url?: string;
  alt?: string;
} | any;

type Props = {
  introTitle?: string | null;
  introMessage?: Block[] | null;
  introBackgroundEnabled?: boolean | null;
};

function renderChildren(children?: Child[], markDefs?: any[]) {
  if (!Array.isArray(children)) return null;
  return children.map((c, idx) => {
    const text = typeof c.text === "string" ? c.text : "";
    const marks = Array.isArray(c.marks) ? c.marks : [];

    if (marks.length === 0) return <React.Fragment key={c._key ?? idx}>{text}</React.Fragment>;

    // wrap marks in order (left-to-right)
    return marks.reduce<React.ReactNode>((acc, mark) => {
      // resolve markDefs (links etc.)
      const def = Array.isArray(markDefs) ? markDefs.find((d) => d._key === mark) : null;
      if (def && (def.href || def.url)) {
        const href = def.href ?? def.url;
        const external = /^https?:\/\//.test(String(href));
        return (
          <a
            key={mark}
            href={String(href)}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="text-blue-600 underline"
          >
            {acc}
          </a>
        );
      }

      if (mark === "strong") return <strong key={mark} className="font-semibold">{acc}</strong>;
      if (mark === "em") return <em key={mark} className="italic">{acc}</em>;
      if (mark === "underline") return <u key={mark}>{acc}</u>;
      if (mark === "code") return <code key={mark} className="rounded px-1 py-[0.08rem] text-sm font-mono bg-gray-100">{acc}</code>;

      // unknown mark: preserve text
      return <span key={mark}>{acc}</span>;
    }, text);
  });
}

function PortableTextRenderer({ value }: { value?: Block[] | null }) {
  if (!Array.isArray(value) || value.length === 0) return null;

  const out: React.ReactNode[] = [];

  let i = 0;
  while (i < value.length) {
    const blk = value[i] as Block | undefined;
    if (!blk) { i++; continue; }

    // handle lists (consecutive blocks with listItem)
    if (blk._type === "block" && blk.listItem) {
      const listType = blk.listItem === "bullet" ? "ul" : "ol";
      const items: React.ReactNode[] = [];

      let j = i;
      while (j < value.length && (value[j] as Block)._type === "block" && (value[j] as Block).listItem === blk.listItem) {
        const b = value[j] as Block;
        items.push(
          <li key={b._key ?? j} className="mb-1">
            {renderChildren(b.children, b.markDefs)}
          </li>
        );
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

    // block content (paragraphs, headings, blockquote)
    if (blk._type === "block") {
      const style = (blk as any).style ?? "normal";
      const children = renderChildren(blk.children, blk.markDefs);
      if (style === "h1") out.push(<h1 key={blk._key ?? i} className="text-3xl font-extrabold my-4">{children}</h1>);
      else if (style === "h2") out.push(<h2 key={blk._key ?? i} className="text-2xl font-bold my-3">{children}</h2>);
      else if (style === "h3") out.push(<h3 key={blk._key ?? i} className="text-xl font-semibold my-2">{children}</h3>);
      else if (style === "blockquote") out.push(<blockquote key={blk._key ?? i} className="border-l-4 pl-4 italic text-gray-700 my-4">{children}</blockquote>);
      else out.push(<p key={blk._key ?? i} className="my-2 leading-relaxed">{children}</p>);
      i++;
      continue;
    }

    // image block
    if (blk._type === "image" || blk.asset || blk.url) {
      const url = getImageUrl(blk) ?? blk.asset?.url ?? blk.url ?? null;
      const alt = blk.alt ?? "";
      if (url) {
        out.push(
          // eslint-disable-next-line @next/next/no-img-element
          <div key={blk._key ?? i} className="my-4">
            <img src={String(url)} alt={String(alt)} className="max-w-full rounded-md" />
          </div>
        );
      }
      i++;
      continue;
    }

    // fallback - skip unknown block
    i++;
  }

  return <>{out}</>;
}

export default function ImportIntro({ introTitle, introMessage, introBackgroundEnabled }: Props) {
  const wrapperClasses = introBackgroundEnabled ? "py-12 md:py-16" : "py-8";

  return (
    <section className={`${wrapperClasses} w-full mx-auto text-[#1A1A1A] ${introBackgroundEnabled ? "bg-[#02587B] text-[#F5F5F5]" : ""}`}>
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
        <div>
          {introTitle && <h2 className="text-[45px] md:text-[60px] font-extrabold mb-4">{introTitle}</h2>}

          {introMessage && (
            <div className="prose max-w-full" style={{ textAlign: "justify" }}>
              <PortableTextRenderer value={introMessage} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}