// app/import/page.tsx
import React from "react";
import { client } from "@/sanity/lib/client"; // keep your client import
import ImportHeader from "@/components/Import/ImportHeader";
import ImportIntro from "@/components/Import/ImportIntro";
import ImportsGrid from "@/components/Import/ImportsGrid";

type ImportDoc = {
  title?: string;
  subtitle?: string;
  slug?: { current?: string };
  heroImage?: unknown; // pass whole object to header
  introTitle?: string;
  introMessage?: unknown[];
  introBackground?: { enabled?: boolean };
  imports?: Array<Record<string, unknown>> | null;
  bodyTitle?: string;
  bodyMessage?: unknown[];
  bodyBackground?: { enabled?: boolean };
};

export default async function Page() {
  const q = `*[_type == "import"][0]{
    title, subtitle, heroImage, introTitle, introMessage, introBackground, bodyTitle, bodyMessage, bodyBackground,
    imports[]{ _key, title, description, image, order, "slug": slug.current }
  }`;

  const data = (await client.fetch(q)) as ImportDoc | null;

  if (!data) return <div className="p-8">Import page not found.</div>;

  // Pass the raw heroImage object to ImportHeader so it can build the URL via urlFor()
  const importsRaw: Record<string, unknown>[] = Array.isArray(data.imports) ? data.imports : [];

  function renderBodyMessage(blocks?: unknown[]) {
    if (!Array.isArray(blocks)) return null;
    return blocks.map((blk, i) => {
      if (!blk || typeof blk !== "object") return null;
      const b = blk as Record<string, unknown>;
      if (b._type === "block") {
        const children = Array.isArray(b.children) ? (b.children as Array<Record<string, unknown>>) : [];
        const text = children
          .map((c) => (typeof (c as any).text === "string" ? (c as any).text : ""))
          .join("");
        return <p key={String(b._key ?? i)}>{text}</p>;
      }
      if (b._type === "image") {
        const url = (b as any).asset?.url ?? (b as any).url ?? null;
        if (typeof url === "string") {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={String(b._key ?? i)} src={url} alt={(b as any).alt ?? ""} className="rounded-md my-6 max-w-full" />;
        }
      }
      return null;
    });
  }

  return (
    <main>
      {/* pass the raw Sanity image object (heroImage) */}
      <ImportHeader title={data.title} subtitle={data.subtitle} heroImage={data.heroImage} />

      <ImportIntro
        introTitle={data.introTitle}
        introMessage={(data.introMessage as unknown[]) ?? []}
        introBackgroundEnabled={!!data.introBackground?.enabled}
      />

      <ImportsGrid importsArr={importsRaw} />

      <section
        className={`w-full mx-auto`}
        style={{ background: !!data.bodyBackground?.enabled ? "linear-gradient(180deg,#f5f0ff,#f1e8ff)" : "transparent" }}
      >
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-12">
          <div className="max-w-[920px]">
            {data.bodyTitle && <h2 className="text-[26px] md:text-[36px] font-extrabold mb-6">{data.bodyTitle}</h2>}
            {data.bodyMessage && (
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[#1A1A1A]">{renderBodyMessage(data.bodyMessage)}</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}