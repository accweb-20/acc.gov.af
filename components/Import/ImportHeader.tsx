"use client";

import Image from "next/image";
import React from "react";
import { urlFor } from "@/lib/sanity"; // keep using your existing helper

type Props = {
  title?: string | null;
  subtitle?: string | null;

  /**
   * Accept either explicit URL strings OR Sanity image objects for each variant.
   * The component prefers the explicit URL prop if provided; otherwise it will
   * try to build a URL from the Sanity image object using urlFor().
   */
  desktopHeroUrl?: string | null;
  desktopHero?: unknown;
  mobileHeroUrl?: string | null;
  mobileHero?: unknown;
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
      const urlForFn = urlFor as unknown as UrlForFn;
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

export default function ImportHeader({
  title,
  subtitle,
  desktopHeroUrl,
  desktopHero,
  mobileHeroUrl,
  mobileHero,
}: Props) {
  // prefer explicit URL, otherwise try to build from Sanity image object
  const resolvedDesktop =
    (typeof desktopHeroUrl === "string" && desktopHeroUrl.length > 0
      ? desktopHeroUrl
      : makeImageUrlFromSanity(desktopHero ?? desktopHeroUrl, 1600)) ?? null;

  // smaller width for mobile image to reduce bandwidth
  const resolvedMobile =
    (typeof mobileHeroUrl === "string" && mobileHeroUrl.length > 0
      ? mobileHeroUrl
      : makeImageUrlFromSanity(mobileHero ?? mobileHeroUrl, 800)) ?? null;

  return (
    <header className="relative w-full" style={{ marginTop: 64 }}>
      {/* Hero image container */}
      <div className="overflow-hidden mx-auto w-[90%] md:w-[93%] lg:w-[70%] max-w-[493px] md:max-w-[924px] lg:max-w-[924px]">
        {/* Use two images and tailwind responsive utilities to show one per breakpoint.
            - mobile image is shown on small screens (block md:hidden)
            - desktop image is shown on md+ screens (hidden md:block)
            This approach is simple and predictable; it also lets you control which source loads for which viewport.
        */}
        <div className="relative w-full h-[230px] md:h-[360px] lg:h-[320px]">
          {resolvedMobile ? (
            <div className="block md:hidden absolute inset-0">
              <Image
                src={resolvedMobile}
                fill
                alt={title ?? "Hero image (mobile)"}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
                quality={85}
                priority
                draggable={false}
              />
            </div>
          ) : (
            <div className="block md:hidden w-full h-full bg-gray-200" />
          )}

          {resolvedDesktop ? (
            <div className="hidden md:block absolute inset-0">
              <Image
                src={resolvedDesktop}
                fill
                alt={title ?? "Hero image (desktop)"}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
                quality={90}
                priority
                draggable={false}
              />
            </div>
          ) : (
            <div className="hidden md:block w-full h-full bg-gray-200" />
          )}
        </div>
      </div>

      {/* Header panel (text) */}
      <div
        style={{ backgroundColor: "#02587B" }}
        className="w-full mx-auto text-center flex flex-col justify-end px-4 min-h-[280px] md:min-h-[420px] lg:min-h-[420px] -mt-[120px] md:-mt-[240px] lg:-mt-[220px]"
      >
        <div className="my-6 mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1440px] py-7 md:py-8">
          <div className="text-[#F5F5F5] ">
            <h1 className="font-rubik-dirt text-[45px] md:text-[72px] lg:text-[90px] leading-tight opacity-90">
              {title ?? "Import Page"}
            </h1>
            {subtitle && <p className="mt-2 text-[14px] md:text-[18px] opacity-90">{subtitle}</p>}
          </div>
        </div>
      </div>
      {/* end header panel */}
    </header>
  );
}