// components/Footer/index.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { client, getImageUrl } from "../../sanity/lib/client";

/* ---------- Types ---------- */

type InternalRefDoc = {
  _id?: string;
  _type?: string;
  slug?: string | null;
  title?: string | null;
};

type LinkObject = {
  linkType?: "internal" | "external";
  externalUrl?: string | null;
  openInNewTab?: boolean | null;
  internalRef?: InternalRefDoc | null;
};

type FooterItem = {
  order?: number | null;
  label?: string | null;
  link?: LinkObject | null;
};

type FooterColumn = {
  order?: number | null;
  title?: string | null;
  items?: FooterItem[] | null;
};

type SocialIconAsset = {
  asset?: {
    _ref?: string;
    _id?: string;
  };
};

type SocialLink = {
  order?: number | null;
  label?: string | null;
  url?: string | null;
  icon?: SocialIconAsset | null;
  external?: boolean | null;
};

type FooterDocument = {
  columns?: FooterColumn[] | null;
  copyrightText?: string | null;
  socialLinks?: SocialLink[] | null;
};

/* ---------- GROQ ---------- */
const FOOTER_QUERY = `*[_type == "footer"][0]{
  "columns": columns[] {
    order,
    title,
    "items": items[] {
      order,
      label,
      "link": link { linkType, externalUrl, openInNewTab, "internalRef": internalRef->{_id,_type,"slug":slug.current,title} }
    }
  },
  copyrightText,
  "socialLinks": socialLinks[] { order, label, url, "icon": icon{ asset->{_ref,_id} }, external }
}`;

/* ---------- Helper: Detect Platform ---------- */
function getHostFromUrl(urlString: string | null | undefined): string | null {
  if (!urlString) return null;
  try {
    return new URL(urlString).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function detectPlatform(label: string | null | undefined, url?: string | null): string {
  const l = (label ?? "").trim().toLowerCase();
  const host = getHostFromUrl(url) ?? "";
  const test = (subs: string | string[]) => {
    const arr = Array.isArray(subs) ? subs : [subs];
    return arr.some((s) => l.includes(s) || host.includes(s));
  };

  if (test(["facebook", "fb.com", "facebook.com"])) return "facebook";
  if (test(["instagram", "insta", "instagram.com"])) return "instagram";
  if (test(["x", "twitter", "t.co", "twitter.com"])) return "twitter";
  if (test(["linkedin", "linkedin.com"])) return "linkedin";
  if (test(["youtube", "youtu.be", "youtube.com"])) return "youtube";
  if (test(["tiktok", "tiktok.com"])) return "tiktok";
  if (test(["pinterest", "pinterest.com"])) return "pinterest";
  if (test(["github", "github.com"])) return "github";
  if (test(["telegram", "t.me", "telegram.me"])) return "telegram";
  if (test(["whatsapp", "wa.me", "whatsapp.com"])) return "whatsapp";
  if (test(["medium", "medium.com"])) return "medium";
  if (test(["reddit", "reddit.com"])) return "reddit";

  return "other";
}

/* ---------- Small component: Inline an SVG from a URL ---------- */
/**
 * Fetches the raw SVG text, removes inline fills/strokes, ensures svg uses `fill="currentColor"`,
 * then dangerously inlines it so the SVG inherits `color` from the parent element.
 *
 * NOTE: We only fetch and inline when we detect the asset is an SVG (by assetRef containing '-svg' or url ending with '.svg').
 * This allows exact coloring via CSS (hover:text-[#F4BA00]).
 */
function SvgInline(props: { src: string; className?: string; alt?: string }) {
  const { src, className } = props;
  const [svgText, setSvgText] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSvg() {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error("SVG fetch failed");
        const raw = await res.text();

        // Remove hard-coded fill/stroke attributes to let currentColor control them.
        // This is a simple heuristic — works on most authored SVGs. You can extend if needed.
        let cleaned = raw.replace(/\sfill="[^"]*"/gi, ""); // remove fill="..."
        cleaned = cleaned.replace(/\sstroke="[^"]*"/gi, ""); // remove stroke="..."
        // Ensure svg tag has fill="currentColor" (if not present)
        cleaned = cleaned.replace(/<svg([^>]*)>/i, (match, group1) => {
          // if already has fill or style, leave, otherwise inject fill=currentColor
          if (/fill=/.test(group1) || /style=/.test(group1)) {
            return `<svg${group1}>`;
          }
          return `<svg${group1} fill="currentColor">`;
        });

        if (mounted) setSvgText(cleaned);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to fetch/inline SVG", src, err);
        if (mounted) setSvgText(null);
      }
    }

    fetchSvg();
    return () => {
      mounted = false;
    };
  }, [src]);

  if (!svgText) {
    // fallback small invisible box so layout doesn't jump
    return <span className={className} style={{ display: "inline-block", width: 24, height: 24 }} />;
  }

  return (
    <span
      className={className}
      // svgText comes from your Sanity CDN; we assume it's trusted content created by you.
      dangerouslySetInnerHTML={{ __html: svgText }}
      aria-hidden
    />
  );
}

/* ---------- Component ---------- */

export default function Footer() {
  const [doc, setDoc] = useState<FooterDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    client
      .fetch<FooterDocument>(FOOTER_QUERY)
      .then((res) => {
        if (!mounted) return;
        setDoc(res ?? null);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error fetching footer:", err);
        setDoc(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Skeleton while loading (keeps same layout)
  if (loading) {
    return (
      <footer className="relative z-10 bg-[#02587B] text-[#F5F5F5] pt-16 md:pt-20 lg:pt-24">
        <div className="container mx-auto px-4">
          <div className="-mx-4 flex flex-wrap">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-full sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12 px-4 mb-8">
                <div className="mb-6 h-6 bg-[#0d6b83] animate-pulse rounded" />
                <ul>
                  <li className="h-4 mb-3 bg-[#0d6b83] w-3/4 animate-pulse rounded" />
                  <li className="h-4 mb-3 bg-[#0d6b83] w-2/3 animate-pulse rounded" />
                  <li className="h-4 mb-3 bg-[#0d6b83] w-1/2 animate-pulse rounded" />
                </ul>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-linear-to-r from-transparent via-[#D2D8E183] to-transparent dark:via-[#959CB183]" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-8">
            <div className="text-left text-base">
              <div className="h-4 w-48 bg-[#0d6b83] animate-pulse rounded" />
            </div>

            <div className="flex items-center mt-4 md:mt-0 lg:mr-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="mr-6 w-6 h-6 bg-[#0d6b83] animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const columns = (doc?.columns ?? []).slice().sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

  function resolveHref(link?: LinkObject | null): string {
    if (!link) return "#";
    if (link.linkType === "external" && link.externalUrl) return link.externalUrl;
    const ref = link.internalRef;
    if (ref?.slug) return `/${ref.slug}`;
    if (ref?._type && ref?._id) return `/${ref._type}/${ref._id}`;
    return "#";
  }

  function renderSocialIcon(s: SocialLink, index: number) {
    const label = s.label ?? "";
    const url = s.url ?? "";
    const platform = detectPlatform(label, url);

    // Safely extract an assetRef string if present
    const assetRef = s.icon?.asset?._ref ?? s.icon?.asset?._id ?? undefined;
    const src = assetRef ? getImageUrl(assetRef, { width: 200, height: 200 }) : null;

    // If we have an SVG assetRef (Sanity asset refs include "-svg" for SVGs), inline it for exact coloring.
    const looksLikeSvg = typeof assetRef === "string" && assetRef.toLowerCase().includes("-svg");

    if (src && looksLikeSvg) {
      // Inline the SVG so it gets exact color from parent text (currentColor)
      return <SvgInline src={src} className="w-6 h-6" alt={label || platform} />;
    }

    if (src) {
      // non-SVG image: use <img> with filter approximation on hover
      const hovered = hoverIndex === index;
      const style: React.CSSProperties = {
        width: 24,
        height: 24,
        objectFit: "contain",
        transition: "filter 160ms ease, transform 160ms ease",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        filter: hovered ? "sepia(1) saturate(6) hue-rotate(10deg) brightness(1)" : "none",
      };
      return <img src={src} alt={label || platform} style={style} />;
    }

    // Fallback inline SVG (these use currentColor and will match hover color exactly)
    switch (platform) {
      case "facebook":
        return (
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M12.1 10.4939V7.42705C12.1 6.23984 13.085 5.27741 14.3 5.27741H16.5V2.05296L13.5135 1.84452C10.9664 1.66676 8.8 3.63781 8.8 6.13287V10.4939H5.5V13.7183H8.8V20.1667H12.1V13.7183H15.4L16.5 10.4939H12.1Z"
              fill="currentColor"
            />
          </svg>
        );
      case "instagram":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
          </svg>
        );
      case "twitter":
      case "x":
        return (
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M13.9831 19.25L9.82094 13.3176L4.61058 19.25H2.40625L8.843 11.9233L2.40625 2.75H8.06572L11.9884 8.34127L16.9034 2.75H19.1077L12.9697 9.73737L19.6425 19.25H13.9831ZM16.4378 17.5775H14.9538L5.56249 4.42252H7.04674L10.808 9.6899L11.4584 10.6039L16.4378 17.5775Z"
              fill="currentColor"
            />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="10" cy="10" r="8" fill="currentColor" />
          </svg>
        );
    }
  }

  return (
    <footer className="relative z-10 bg-[#02587B] text-[#F5F5F5] pt-16 md:pt-20 lg:pt-24">
      <div className=" mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px]">
        <div className=" flex flex-wrap">
          {columns.map((col, idx) => {
            const widthClass =
              idx === 0 || idx === 1 ? "w-full sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12" : "w-full md:w-1/2 lg:w-4/12 xl:w-3/12";

            return (
              <div key={String(idx)} className={`${widthClass} `}>
                <div className="mb-12 lg:mb-16">
                  <h2 className="mb-6 text-xl font-bold">{col.title}</h2>
                  <ul>
                    {(col.items ?? [])
                      .slice()
                      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                      .map((it, i) => {
                        const label = it?.label ?? it?.link?.internalRef?.title ?? "Untitled";
                        const href = resolveHref(it?.link ?? null);
                        const openNew = Boolean(it?.link?.openInNewTab);
                        const isExternal = it?.link?.linkType === "external";

                        return (
                          <li key={String(i)}>
                            {isExternal ? (
                              <a
                                href={href}
                                target={openNew ? "_blank" : undefined}
                                rel={openNew ? "noopener noreferrer" : undefined}
                                className="mb-4 inline-block text-base duration-300 hover:text-[#F4BA00]"
                              >
                                {label}
                              </a>
                            ) : (
                              <Link href={href} className="mb-4 inline-block text-base duration-300 hover:text-[#F4BA00]">
                                {label}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-[#D2D8E183] to-transparent dark:via-[#959CB183]"></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-8">
          <div className="text-left text-base">
            {doc?.copyrightText ? (
              <span>{doc.copyrightText}</span>
            ) : (
              <span>Copyright © {new Date().getFullYear()} – Afghan Cart State-Owned Corporation</span>
            )}
          </div>

          <div className="flex items-center mt-4 md:mt-0 lg:mr-6">
            {(doc?.socialLinks ?? [])
              .slice()
              .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
              .map((s, i) => {
                const href = s?.url ?? "#";
                const external = s?.external ?? true;
                return (
                  <a
                    key={String(i)}
                    href={href}
                    aria-label={s?.label ?? `social-${i}`}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="mr-6 duration-300 hover:text-[#F4BA00] inline-flex items-center"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 text-current">
                      {renderSocialIcon(s, i)}
                    </span>
                  </a>
                );
              })}
          </div>
        </div>
      </div>
    </footer>
  );
}
