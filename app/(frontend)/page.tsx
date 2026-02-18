import React from "react";
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Slider from "@/components/Slider";
import ProductsGrid from "@/components/ProductsGrid";
import { sanityClient } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";

// Generate page metadata (title, description, keywords) from the first home document
export async function generateMetadata() {
  const data = await sanityClient.fetch(`*[_type == "home"][0]{
    title,
    seo{seoTitle, metaDescription, keywords[]}
  }`);

  const title = data?.seo?.seoTitle || data?.title || "Home";
  const description = data?.seo?.metaDescription || "";
  const keywords = data?.seo?.keywords ? data.seo.keywords.join(", ") : undefined;

  const metadata: any = { title, description };
  if (keywords) metadata.keywords = keywords;
  return metadata;
}

async function getHomeData() {
  return sanityClient.fetch(`*[_type == "home"][0]{
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

export default async function Home() {
  const home = await getHomeData();

  const hasIntroContent = Boolean(
    home && (home.introTitle || (Array.isArray(home.introMessage) && home.introMessage.length > 0))
  );

  const hasBodyContent = Boolean(
    home && (home.bodyTitle || (Array.isArray(home.bodyMessage) && home.bodyMessage.length > 0))
  );

  return (
    <>
      <ScrollUp />

      {/* Slider (unchanged) */}
      <Slider apiPath="/api/slider" />

      {/* Intro SECTION - placed before ProductsGrid */}
      {hasIntroContent && (
        <section className={`w-full mx-auto md:max-w-[1440px] ${home?.introBackgroundEnabled ? 'bg-[#02587B] text-[#F5F5F5]' : ''}`}>
          <div className={`mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8 `}>
            {/* Title styling taken from your contact-us page — large, condensed width */}
            {home?.introTitle && (
              <h2 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide mb-4">
                {home.introTitle}
              </h2>
            )}

            {Array.isArray(home?.introMessage) && home.introMessage.length > 0 && (
              <div className="prose mt-2 max-w-2xl">
                <PortableText value={home.introMessage} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* PRODUCTS SECTION (under Intro) */}
      <ProductsGrid />

      {/* Body SECTION - placed after ProductsGrid */}
      {hasBodyContent && (
        <section className={`w-full mx-auto md:max-w-[1440px] ${home?.bodyBackgroundEnabled ? 'bg-[#02587B] text-[#F5F5F5]' : ''}`}>
          <div className={`mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-6 `}>
            {home?.bodyTitle && (
              <h3 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide mb-4">
                {home.bodyTitle}
              </h3>
            )}

            {Array.isArray(home?.bodyMessage) && home.bodyMessage.length > 0 && (
              <div className="prose mt-2 max-w-2xl">
                <PortableText value={home.bodyMessage} />
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
