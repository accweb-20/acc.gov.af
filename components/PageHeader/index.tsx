// components/PageHeader/index.tsx

import Link from "next/link";
import React from "react";
import { ChevronRight, Home, Tag } from "lucide-react";
import RichText from "@/components/Import/RichText";
import { hasRich, toPlain } from "@/lib/imports";

type BreadcrumbLink = {
  _key?: string;
  label?: string | null;
  href?: string | null;
};

type Props = {
  title?: string | null;
  subtitle?: string | null;

  // Breadcrumb trail: Home / About / Current Page
  breadcrumbLinks?: BreadcrumbLink[] | null;
  breadcrumbLabel?: string | null;

  // Short paragraph below the title: plain text or rich text (Portable Text) from Sanity
  headerMessage?: unknown;

  // Optional styling
  className?: string;
  style?: React.CSSProperties;
  containerMaxWidth?: string;
  overlayColor?: string;

  // Optional content beneath the message
  children?: React.ReactNode;
};

const CONTAINER =
  "mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]";

/** Breadcrumb text: "HOME" / "CONTACT US" → "Home" / "Contact Us"; mixed case (product names) stays as typed. */
export function crumbText(label: string): string {
  const t = label.trim();
  if (/[A-Z]/.test(t) && t === t.toUpperCase()) {
    return t.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, sp: string, ch: string) => sp + ch.toUpperCase());
  }
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Light breadcrumb bar under the site header.
 * Used by every page with a header part and by product pages, so they all look the same.
 */
export function BreadcrumbBar({
  links,
  current,
  tagHref,
}: {
  links: { key?: string; label: string; href: string }[];
  current: string;
  tagHref?: string; // link that gets the small category (tag) icon
}) {
  return (
    <div className="mt-15 border-b border-brand-line/10 bg-mist">
      <div className={`${CONTAINER} py-3`}>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-medium text-ink/60">
            {links.map(({ key, href, label }, i) => (
              <li key={key ?? `${href}-${i}`} className="inline-flex items-center gap-1.5">
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-brand-fg transition-colors hover:text-brand-fg hover:underline"
                >
                  {href === "/" ? <Home size={14} /> : href === tagHref ? <Tag size={13} /> : null} {crumbText(label)}
                </Link>
                <ChevronRight size={14} aria-hidden className="text-ink/30" />
              </li>
            ))}
            <li aria-current="page" className="line-clamp-1 font-semibold text-ink">
              {crumbText(current)}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

function isInternalPath(value?: string | null): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  );
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbLinks,
  breadcrumbLabel,
  headerMessage,
  className = "",
  style,
  containerMaxWidth = "max-w-[1252px]",
  overlayColor = "var(--color-brand)",
  children,
}: Props) {
  // Use configured breadcrumbs or fall back to Home.
  const configuredLinks = (breadcrumbLinks ?? []).flatMap(
    (item, index) => {
      const label = item.label?.trim();
      const href = item.href?.trim();

      if (!label || !isInternalPath(href)) {
        return [];
      }

      return [
        {
          key: item._key ?? `${href}-${index}`,
          label,
          href,
        },
      ];
    }
  );

  const links =
    configuredLinks.length > 0
      ? configuredLinks
      : [{ key: "home", label: "Home", href: "/" }];

  const currentPageLabel =
    breadcrumbLabel?.trim() || title?.trim() || "Page";

  // The dedicated header message takes priority over the subtitle.
  const richMessage = Array.isArray(headerMessage) && hasRich(headerMessage) ? headerMessage : null;
  const supportingText = richMessage ? "" : toPlain(headerMessage) || subtitle?.trim() || "";

  return (
    <header
      className={`w-full ${className}`}
      style={style}
      aria-label={title ?? "Page header"}
    >
      <section
        className="mt-15 flex min-h-[320px] w-full flex-col text-center md:min-h-[388px]"
        style={{ backgroundColor: overlayColor }}
      >
        {/* Breadcrumb – top left; same size, case and icons as on product pages, in white */}
        <div className={`${CONTAINER} pt-5 text-left`}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-medium text-white/70">
              {links.map((item) => (
                <li key={item.key} className="inline-flex items-center gap-1.5">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-white transition-colors hover:text-[#F4BA00] hover:underline"
                  >
                    {item.href === "/" ? <Home size={14} /> : null} {crumbText(item.label)}
                  </Link>
                  <ChevronRight size={14} aria-hidden className="text-white/50" />
                </li>
              ))}
              <li aria-current="page" className="line-clamp-1 font-semibold text-white">
                {crumbText(currentPageLabel)}
              </li>
            </ol>
          </nav>
        </div>

        <div
          className={`mx-auto flex w-full flex-1 flex-col items-center justify-center px-5 pb-14 pt-8 sm:px-8 md:pb-16 md:pt-6 ${containerMaxWidth}`}
        >
          {/* Main page title */}

          <h1 className="mt-3  font-bold  tracking-tight text-[#F1F1F1]  md:mt-2 text-[32px] md:text-[52px]">
            {title ? crumbText(title) : ""}
          </h1>

          {/* Short message directly below the title */}

          {supportingText && (
            <p className="mx-auto mt-3 max-w-5xl whitespace-pre-line text-base leading-relaxed text-[#8FB8C8] sm:text-lg md:mt-5 md:text-[22px] md:leading-8">
              {supportingText}
            </p>
          )}

          {richMessage && (
            <div className="mx-auto mt-3 max-w-5xl text-base leading-relaxed text-[#8FB8C8] sm:text-lg md:mt-5 md:text-[22px] md:leading-8 [&_p]:my-1">
              <RichText value={richMessage} onDark />
            </div>
          )}

          {/* Optional additional content */}

          {children && <div className="mt-6">{children}</div>}
        </div>
      </section>
    </header>
  );
}