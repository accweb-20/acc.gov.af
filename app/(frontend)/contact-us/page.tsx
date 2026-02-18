import React from "react";
import ContactHero from "./ContactHero"; // relative import (component placed next to page.tsx)
import ContactForm from "@/components/ContactForm";
import { sanityClient } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";

// Generate page metadata (title, description, keywords) from the first contactUs document
export async function generateMetadata() {
  const data = await sanityClient.fetch(`*[_type == "contactUs"][0]{
    title,
    seo{seoTitle, metaDescription, keywords[]}
  }`);

  const title = data?.seo?.seoTitle || data?.title || "Contact Us";
  const description = data?.seo?.metaDescription || "";
  const keywords = data?.seo?.keywords ? data.seo.keywords.join(", ") : undefined;

  const metadata: any = { title, description };
  if (keywords) metadata.keywords = keywords;
  return metadata;
}

async function getContactData() {
  return sanityClient.fetch(`*[_type == "contactUs"][0]{
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

export default async function Page() {
  const contact = await getContactData();

  const hasIntroContent = Boolean(
    contact && (contact.introTitle || (Array.isArray(contact.introMessage) && contact.introMessage.length > 0))
  );

  const hasBodyContent = Boolean(
    contact && (contact.bodyTitle || (Array.isArray(contact.bodyMessage) && contact.bodyMessage.length > 0))
  );

  return (
    <main className="">
      {/* Hero */}
      <section className="my-12 w-full mx-auto md:max-w-[1440px] bg-[#02587B] h-[520px]">
        <ContactHero />
      </section>

      {/* Intro (render only when content exists in Sanity) */}
      {hasIntroContent && (
        <section className={`w-full mx-auto md:max-w-[1440px] ${contact?.introBackgroundEnabled ? 'bg-[#02587B] text-[#F5F5F5]' : ''}`}>
          <div className={`mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8 `}>
            {contact?.introTitle && <h2 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide mb-4">{contact.introTitle}</h2>}

            {Array.isArray(contact?.introMessage) && contact.introMessage.length > 0 && (
              <div className="prose mt-2 max-w-2xl">
                <PortableText value={contact.introMessage} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Body (render under Intro only when there's body content) */}
      {hasBodyContent && (
        <section className={`w-full mx-auto md:max-w-[1440px] ${contact?.bodyBackgroundEnabled ? 'bg-[#02587B] text-[#F5F5F5]' : ''}`}>
          <div className={`mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-6 `}>
            {contact?.bodyTitle && <h3 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide mb-4">{contact.bodyTitle}</h3>}

            {Array.isArray(contact?.bodyMessage) && contact.bodyMessage.length > 0 && (
              <div className="prose mt-2 max-w-2xl">
                <PortableText value={contact.bodyMessage} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className="mx-auto w-full max-w-[1440px] py-10">
        <ContactForm />
      </section>
    </main>
  );
}
