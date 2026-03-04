// components/PageHeader/index.tsx
"use client";

import Image from "next/image";
import React from "react";
import { urlFor as urlForRaw } from "@/lib/sanity"; // keep your helper

type Props = {
  title?: string | null;
  subtitle?: string | null;

  // explicit URLs OR Sanity image objects (object or string url)
  desktopHeroUrl?: string | null;
  desktopHero?: unknown;
  mobileHeroUrl?: string | null;
  mobileHero?: unknown;

  // optional visual / layout tweaks
  className?: string;
  style?: React.CSSProperties;
  containerMaxWidth?: string; // e.g. "max-w-[924px]"
  overlayColor?: string; // e.g. "#02587B" or "rgba(2,88,123,0.95)"
  priority?: boolean; // pass to next/image priority when important
  children?: React.ReactNode; // place for CTA buttons etc.
  alt?: string | null; // override alt text
};

type UrlForReturn = {
  width: (n: number) => {
    auto: (s: string) => {
      url: () => string;
    };
  };
};
type UrlForFn = (val: unknown) => UrlForReturn;

function makeImageUrlFromSanity(val: unknown, width = 1600): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    try {
      const urlForFn = urlForRaw as unknown as UrlForFn;
      const u = urlForFn(val).width(width).auto("format").url();
      if (typeof u === "string") return u;
    } catch {
      // fall through to fallback checks
    }
    const rec = val as Record<string, unknown>;
    if (rec && typeof rec.url === "string") return rec.url;
  }
  return null;
}

export default function PageHeader({
  title,
  subtitle,
  desktopHeroUrl,
  desktopHero,
  mobileHeroUrl,
  mobileHero,
  className = "",
  style,
  containerMaxWidth = "max-w-[924px]",
  overlayColor = "#02587B",
  priority = false,
  children,
  alt,
}: Props) {
  const resolvedDesktop =
    (typeof desktopHeroUrl === "string" && desktopHeroUrl.length > 0
      ? desktopHeroUrl
      : makeImageUrlFromSanity(desktopHero ?? desktopHeroUrl, 1600)) ?? null;

  const resolvedMobile =
    (typeof mobileHeroUrl === "string" && mobileHeroUrl.length > 0
      ? mobileHeroUrl
      : makeImageUrlFromSanity(mobileHero ?? mobileHeroUrl, 800)) ?? null;

  const altText = alt ?? title ?? "Hero image";

  return (
    <header
      className={`relative w-full ${className} mt-16`}
      style={style}
      aria-label={`${title ?? "Page header"}`}
    >
      <div className={`overflow-hidden mx-auto w-[90%] md:w-[93%] lg:w-[70%] ${containerMaxWidth}`}>
        <div className="relative w-full">
          {/* MOBILE: portrait / contain */}
          {resolvedMobile ? (
            <div className="block md:hidden w-full flex justify-center items-start">
              <img
                src={resolvedMobile}
                alt={`${altText} (mobile)`}
                className="max-w-full h-auto max-h-[70vh] rounded-md object-contain"
                style={{ display: "block" }}
                draggable={false}
              />
            </div>
          ) : (
            <div className="block md:hidden w-full h-[230px] bg-gray-200" />
          )}

          {/* DESKTOP: cover-style using next/image */}
          <div className="hidden md:block relative w-full h-[230px] md:h-[360px] lg:h-[320px]">
            {resolvedDesktop ? (
              <Image
                src={resolvedDesktop}
                fill
                alt={`${altText} (desktop)`}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
                quality={90}
                priority={priority}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
        </div>
      </div>

      {/* Text overlay / panel */}
      <div
        style={{ backgroundColor: overlayColor }}
        className="w-full mx-auto text-center flex flex-col justify-end px-4 min-h-[280px] md:min-h-[420px] lg:min-h-[420px] -mt-[120px] md:-mt-[240px] lg:-mt-[220px]"
      >
        <div className={`my-6 mx-auto w-[90%] md:w-[93%] lg:w-[90%] ${containerMaxWidth} py-7 md:py-8`}>
          <div className="text-[#F5F5F5] ">
            <h1 className="font-rubik-dirt text-[45px] md:text-[72px] lg:text-[90px] leading-tight opacity-90">
              {title ?? "Page title"}
            </h1>
            {subtitle && <p className="mt-2 text-[14px] md:text-[18px] opacity-90">{subtitle}</p>}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>
      </div>
    </header>
  );
}