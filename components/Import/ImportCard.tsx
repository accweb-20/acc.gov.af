// components/Import/ImportCard.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity"; // <-- use your urlFor helper (same as Projects page)

/** Portable Text small types */
type PortableChild = { text?: string } | Record<string, unknown>;
type PortableBlock = { _type?: string; children?: PortableChild[]; _key?: string } | Record<string, unknown>;

/** Import item shape (image is string or object) */
export type ImportItem = {
  _key?: string;
  title?: string | null;
  description?: PortableBlock[] | null;
  image?: string | Record<string, unknown> | null;
  order?: number | null;
  slug?: string | null;
  category?: unknown;
};

/* ---------- helpers similar to your projects code ---------- */

type UrlForReturn = {
  width: (n: number) => {
    auto: (s: string) => {
      url: () => string;
    };
  };
};
type UrlForFn = (val: unknown) => UrlForReturn;

function makeImageUrlFromSanity(val: unknown, width?: number): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    try {
      const urlForFn = urlFor as unknown as UrlForFn;
      const w = typeof width === "number" && width > 0 ? width : 1200;
      const u = urlForFn(val).width(w).auto("format").url();
      if (typeof u === "string") return u;
    } catch {
      // fall back
    }
    const rec = val as Record<string, unknown>;
    if (rec && typeof rec.url === "string") return rec.url;
  }
  return null;
}

/* Small helper to extract a short text excerpt from portable text description */
function excerptFromDescription(desc?: PortableBlock[] | null, maxLength = 140): string {
  if (!Array.isArray(desc)) return "";
  // find first block with children text
  const first = desc.find((b) => !!b && typeof b === "object" && (b as any)._type === "block" && Array.isArray((b as any).children));
  if (!first) return "";
  const children = ((first as PortableBlock).children ?? []) as PortableChild[];
  const text = children.map((c) => (typeof (c as PortableChild).text === "string" ? (c as PortableChild).text : "")).join(" ");
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + "...";
}

/* Two line title helper */
function TwoLineTitle({ text }: { text?: string | null }) {
  if (!text) {
    return (
      <>
        &nbsp;
        <br />
        &nbsp;
      </>
    );
  }
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return (
      <>
        {words[0]}
        <br />
        <span aria-hidden="true">&nbsp;</span>
      </>
    );
  }
  const half = Math.ceil(words.length / 2);
  const first = words.slice(0, half).join(" ");
  const second = words.slice(half).join(" ");
  return (
    <>
      {first}
      <br />
      {second}
    </>
  );
}

/* ---------------- component ---------------- */

export default function ImportCard({ item }: { item: ImportItem }) {
  const CARD_MAX = 360;
  const OVERLAP = 26;
  const LABEL_COLOR = "#02587B";

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgBoxRef = useRef<HTMLDivElement | null>(null);

  // the src we pass to next/image
  const [imgSrc, setImgSrc] = useState<string | null>(() => {
    return makeImageUrlFromSanity(item.image, 1200);
  });

  // measure & request DPR-aware image URL (like Projects page)
  useEffect(() => {
    if (!imgBoxRef.current && wrapperRef.current) imgBoxRef.current = wrapperRef.current;

    let mounted = true;
    const HOVER_SCALE = 1.12; // match card hover scale margin

    function update() {
      const el = imgBoxRef.current;
      if (!el) return;
      const cssWidth = Math.max(1, Math.floor(el.clientWidth)); // CSS px width of container
      const dpr = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
      const targetPx = Math.round(cssWidth * dpr * HOVER_SCALE);
      const url = makeImageUrlFromSanity(item.image, targetPx);
      if (mounted && url && url !== imgSrc) {
        setImgSrc(url);
      }
    }

    update();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => update());
      if (imgBoxRef.current) ro.observe(imgBoxRef.current);
    } else {
      const onResize = () => update();
      window.addEventListener("resize", onResize);
      return () => {
        mounted = false;
        window.removeEventListener("resize", onResize);
        if (ro && imgBoxRef.current) ro.unobserve(imgBoxRef.current);
      };
    }

    return () => {
      mounted = false;
      try {
        if (ro && imgBoxRef.current) ro.unobserve(imgBoxRef.current);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.image]);

  const slug = item.slug ?? "";
  const href = slug ? `/imports/${slug}` : "#";

  const IMG_H = 220; // match your Projects card height

  // create excerpt once (small and safe)
  const descriptionExcerpt = excerptFromDescription(item.description, 140);

  return (
    <article aria-labelledby={`import-${item._key ?? slug}-title`} className="flex justify-center w-full text-[#1A1A1A]">
      <div
        ref={wrapperRef}
        className="group w-full max-w-[360px] relative flex flex-col items-start no-radius"
        style={{ maxWidth: `${CARD_MAX}px`, borderRadius: 0, overflow: "visible", boxSizing: "border-box" }}
      >
        {/* image container (fixed height like your ProjectCard) */}
        <div
          ref={imgBoxRef}
          className="relative z-20 mx-auto overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02]"
          style={{
            width: "88%",
            height: IMG_H,
            transform: `translateY(${OVERLAP}px)`,
            background: "#f5f5f5",
            borderRadius: 0,
            boxShadow: "0 -1px 4px rgba(0,0,0,0.2), 1px 0 4px rgba(0,0,0,0.2), -1px 0 4px rgba(0,0,0,0.2)",
            position: "relative",
          }}
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={item.title ?? "Import image"}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              draggable={false}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-transparent">No image</div>
          )}
        </div>

        {/* label box */}
        <div
          className="relative z-10 pt-6 text-[#F5F5F5] w-full"
          style={{
            height: "auto",
            marginTop: -OVERLAP,
            padding: "60px 18px 14px 18px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
            background: LABEL_COLOR,
            borderRadius: 0,
          }}
        >
          <div>
            <h3
              id={`import-${item._key ?? slug}-title`}
              className="font-getronde"
              style={{
                fontSize: 36,
                lineHeight: 1.02,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: 36 * 2 * 1.02,
              }}
            >
              <TwoLineTitle text={item.title ?? "Untitled"} />
            </h3>

            {/* replaced subtitle with description excerpt */}
            <div
              className="font-rubik pb-2"
              style={{
                fontSize: 13,
                lineHeight: 1.2,
                marginTop: 8,
                opacity: 0.95,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {descriptionExcerpt || "\u00A0"}
            </div>
          </div>

          <div className="w-full flex items-center justify-between" style={{ gap: 12 }}>
            <button
              className="inline-flex items-center justify-center no-underline"
              aria-label={`Read more about ${item.title ?? "import item"}`}
              style={{
                padding: "8px 14px",
                backgroundColor: "#F4BA00",
                clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
                color: "#1A1A1A",
                fontWeight: 800,
                fontFamily: "Rubik, system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
                textDecoration: "none",
                borderRadius: 0,
                fontSize: 14,
              }}
            >
              YOU CAN SUGGEST
            </button>

            <span className="text-xs text-white/90" style={{ opacity: 0.95 }}>
              
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}