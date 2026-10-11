// components/PageHeader/index.tsx

import Link from "next/link";
import React from "react";

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

  // Short paragraph below the title
  headerMessage?: string | null;

  // Optional styling
  className?: string;
  style?: React.CSSProperties;
  containerMaxWidth?: string;
  overlayColor?: string;

  // Optional content beneath the message
  children?: React.ReactNode;
};

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
  overlayColor = "#02587B",
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
  const supportingText =
    headerMessage?.trim() || subtitle?.trim() || "";

  return (
    <header
      className={`w-full ${className}`}
      style={style}
      aria-label={title ?? "Page header"}
    >
      <section
        className="flex min-h-[320px] w-full mt-15 items-center justify-center text-center md:min-h-[388px]"
        style={{ backgroundColor: overlayColor }}
      >
        <div
          className={`mx-auto flex w-full flex-col items-center px-5 py-14 sm:px-8 md:py-16 ${containerMaxWidth}`}
        >
          {/* Breadcrumb / pagination trail */}

          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-extrabold uppercase tracking-[0.12em] text-white sm:text-sm">
              {links.map((item) => (
                <li
                  key={item.key}
                  className="inline-flex items-center gap-2"
                >
                  <Link
                    href={item.href}
                    className="transition-opacity hover:opacity-75 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {item.label}
                  </Link>

                  <span aria-hidden="true">/</span>
                </li>
              ))}

              <li aria-current="page" className="opacity-95">
                {currentPageLabel}
              </li>
            </ol>
          </nav>

          {/* Main page title */}

          <h1 className="mt-3  font-bold  tracking-tight text-[#F1F1F1]  md:mt-2 text-[32px] md:text-[52px]">
            {title ?? ""}
          </h1>

          {/* Short message directly below the title */}

          {supportingText && (
            <p className="mx-auto mt-3 max-w-5xl whitespace-pre-line text-base leading-relaxed text-[#8FB8C8] sm:text-lg md:mt-5 md:text-[22px] md:leading-8">
              {supportingText}
            </p>
          )}

          {/* Optional additional content */}

          {children && <div className="mt-6">{children}</div>}
        </div>
      </section>
    </header>
  );
}