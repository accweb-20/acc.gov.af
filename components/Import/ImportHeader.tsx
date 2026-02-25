"use client";

import Image from "next/image";
import React from "react";
import { urlFor } from "@/lib/sanity"; // use the same helper as your Projects page

type Props = {
  title?: string | null;
  subtitle?: string | null;
  /**
   * Accept either:
   *  - a string URL (heroImageUrl)
   *  - or a Sanity image object (heroImage)
   *
   * The component prefers heroImageUrl if provided; otherwise it will
   * try to build a URL from heroImage using urlFor().
   */
  heroImageUrl?: string | null;
  heroImage?: unknown;
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
      // fall back to checking common shapes
    }
    const rec = val as Record<string, unknown>;
    if (rec && typeof rec.url === "string") return rec.url;
  }
  return null;
}

export default function ImportHeader({ title, subtitle, heroImageUrl, heroImage }: Props) {
  // prefer explicit URL, otherwise try to build from a Sanity object
  const resolved =
    (typeof heroImageUrl === "string" && heroImageUrl.length > 0
      ? heroImageUrl
      : makeImageUrlFromSanity(heroImage ?? heroImageUrl, 1600)) ?? null;

  return (
    <header className="relative w-full" style={{marginTop:64}}>
      {/* Hero image starts at the top */}
      <div className="overflow-hidden mx-auto w-[90%] md:w-[93%] lg:w-[70%] max-w-[493px] md:max-w-[924px] lg:max-w-[924px]">
        <div className="relative w-full h-[230px] md:h-[360px] lg:h-[320px]">
          {resolved ? (
            <Image
              src={resolved}
              fill
              alt={title ?? "Hero image"}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              // keep quality reasonably high
              quality={90}
              priority
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </div>

      {/* Header panel
          min-height = image-height + 100px via Tailwind arbitrary classes:
            base: 260 + 100 = 360
            md:   360 + 100 = 460
            lg:   520 + 100 = 620
      */}
      <div
        style={{  backgroundColor: "#02587B" }}
        className="w-full mx-auto text-center flex flex-col justify-end px-4 min-h-[280px] md:min-h-[420px] lg:min-h-[420px] -mt-[120px] md:-mt-[240px] lg:-mt-[240px]"
      >
        <div className="my-6 mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1440px] py-7 md:py-8">
          
              <div className="text-[#F5F5F5] ">
                <h1 className="font-rubik-dirt text-[45px] md:text-[72px] lg:text-[48px] leading-tight opacity-90">
                  {title ?? "Import Page"}
                </h1>
                {subtitle && <p className="mt-2 text-[14px] md:text-[18px] opacity-90">{subtitle}</p>}
              </div>
        </div>
      </div>{" "}
      {/* end header panel */}
    </header>
  );
}