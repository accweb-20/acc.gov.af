// app/(frontend)/contact-us/page.tsx
import React from "react";
import ContactHero from "./ContactHero"; // relative import (component placed next to page.tsx)
import ContactForm from "@/components/ContactForm";
import { sanityClient } from "@/sanity/lib/client";

export default function Page() {
  return (
    <main>
      {/* Hero */}
      <section className="my-12 w-full mx-auto md:max-w-[1440px] bg-[#02587B] h-[520px]">
        <ContactHero />
      </section>

      {/* Contact Form */}
      <section className="mx-auto w-full max-w-[1440px] py-10">
        <ContactForm />
      </section>
    </main>
  );
}
