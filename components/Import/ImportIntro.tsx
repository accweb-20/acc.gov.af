// components/Import/ImportIntro.tsx
"use client";

import React from "react";
import { getImageUrl } from "@/sanity/lib/client";

type Block = { _type?: string; children?: Array<{ text?: string }>; _key?: string; asset?: any; url?: string } | any;

type Props = {
  introTitle?: string | null;
  introMessage?: Block[] | null;
  introBackgroundEnabled?: boolean | null;
};

export default function ImportIntro({ introTitle, introMessage, introBackgroundEnabled }: Props) {
  function renderPortableText(blocks?: Block[] | null) {
    if (!Array.isArray(blocks)) return null;
    return blocks.map((block, i) => {
      if (!block || typeof block !== "object") return null;
      if (block._type === "block") {
        const children = Array.isArray(block.children) ? block.children : [];
        const text = children.map((c: any) => (typeof c.text === "string" ? c.text : "")).join("");
        return (
          <p key={block._key ?? `p-${i}`} className="leading-relaxed mb-4">
            {text}
          </p>
        );
      }
      if (block._type === "image") {
        // use getImageUrl to build url if needed
        const url = getImageUrl(block) ?? block.asset?.url ?? block.url ?? null;
        if (url) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={block._key ?? `img-${i}`} src={url} alt={block.alt ?? ""} className="max-w-full rounded-md my-4" />;
        }
      }
      return null;
    });
  }

  const wrapperClasses = introBackgroundEnabled ? "py-12 md:py-16" : "py-8";

  return (
    <section className={`${wrapperClasses} w-full mx-auto text-[#1A1A1A] ${introBackgroundEnabled ? "bg-[#02587B] text-[#F5F5F5]" : ""}`}>
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
        <div>
          {introTitle && <h2 className="text-[26px] md:text-[36px] font-extrabold mb-4">{introTitle}</h2>}
          {introMessage && <div className="prose max-w-full" style={{ textAlign: "justify" }}>{renderPortableText(introMessage)}</div>}
        </div>
      </div>
    </section>
  );
}