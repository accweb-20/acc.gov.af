
// app/import/page.tsx

import React from "react";
import { client, getImageUrl } from "@/sanity/lib/client";
import PageHeader from "@/components/PageHeader";
import ImportIntro from "@/components/Import/ImportIntro";
import ImportsGrid from "@/components/Import/ImportsGrid";
import { Metadata } from "next";

export const revalidate = 60;

type BreadcrumbLink = {
  _key?: string;
  label?: string;
  href?: string;
};

type ImportDoc = {
  title?: string;
  subtitle?: string;
  slug?: { current?: string };

  // Page header
  breadcrumbLinks?: BreadcrumbLink[] | null;
  breadcrumbLabel?: string;
  headerMessage?: string;

  // Intro
  introTitle?: string;
  introMessage?: unknown[];
  introBackground?: { enabled?: boolean };

  // Imports
  imports?: Array<Record<string, unknown>> | null;

  // Body
  bodyTitle?: string;
  bodyMessage?: unknown[];
  bodyBackground?: { enabled?: boolean };

  // SEO
  seo?: {
    seoTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
};

type Child = {
  _key?: string;
  text?: string;
  marks?: string[];
  [k: string]: any;
};

type Block = {
  _type?: string;
  style?: string;
  children?: Child[];
  _key?: string;
  markDefs?: any[];
  listItem?: "bullet" | "number";
  asset?: any;
  url?: string;
  alt?: string;
} | any;

function renderChildren(children?: Child[], markDefs?: any[]) {
  if (!Array.isArray(children)) return null;

  return children.map((c, idx) => {
    const text = typeof c.text === "string" ? c.text : "";
    const marks = Array.isArray(c.marks) ? c.marks : [];

    if (marks.length === 0) {
      return (
        <React.Fragment key={c._key ?? idx}>
          {text}
        </React.Fragment>
      );
    }

    return marks.reduce<React.ReactNode>((acc, mark) => {
      const def = Array.isArray(markDefs)
        ? markDefs.find((d) => d._key === mark)
        : null;

      if (def && (def.href || def.url)) {
        const href = def.href ?? def.url;
        const external = /^https?:\/\//.test(String(href));

        return (
          <a
            key={mark}
            href={String(href)}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="text-blue-600 underline"
          >
            {acc}
          </a>
        );
      }

      if (mark === "strong") {
        return (
          <strong key={mark} className="font-semibold">
            {acc}
          </strong>
        );
      }

      if (mark === "em") {
        return <em key={mark} className="italic">{acc}</em>;
      }

      if (mark === "underline") {
        return <u key={mark}>{acc}</u>;
      }

      if (mark === "code") {
        return (
          <code
            key={mark}
            className="rounded bg-gray-100 px-1 py-[0.08rem] font-mono text-sm"
          >
            {acc}
          </code>
        );
      }

      return <span key={mark}>{acc}</span>;
    }, text);
  });
}

function PortableTextServer({
  value,
}: {
  value?: Block[] | null;
}) {
  if (!Array.isArray(value) || value.length === 0) return null;

  const out: React.ReactNode[] = [];

  let i = 0;

  while (i < value.length) {
    const blk = value[i] as Block | undefined;

    if (!blk) {
      i++;
      continue;
    }

    // Lists
    if (blk._type === "block" && blk.listItem) {
      const listType = blk.listItem === "bullet" ? "ul" : "ol";
      const items: React.ReactNode[] = [];

      let j = i;

      while (
        j < value.length &&
        (value[j] as Block)._type === "block" &&
        (value[j] as Block).listItem === blk.listItem
      ) {
        const b = value[j] as Block;

        items.push(
          <li key={b._key ?? j} className="mb-1">
            {renderChildren(b.children, b.markDefs)}
          </li>
        );

        j++;
      }

      out.push(
        <div key={`list-${i}`} className="my-3">
          {listType === "ul" ? (
            <ul className="list-disc pl-6">{items}</ul>
          ) : (
            <ol className="list-decimal pl-6">{items}</ol>
          )}
        </div>
      );

      i = j;
      continue;
    }

    // Text blocks
    if (blk._type === "block") {
      const style = blk.style ?? "normal";
      const children = renderChildren(blk.children, blk.markDefs);

      if (style === "h1") {
        out.push(
          <h1 key={blk._key ?? i} className="my-4 text-3xl font-extrabold">
            {children}
          </h1>
        );
      } else if (style === "h2") {
        out.push(
          <h2 key={blk._key ?? i} className="my-3 text-2xl font-bold">
            {children}
          </h2>
        );
      } else if (style === "h3") {
        out.push(
          <h3 key={blk._key ?? i} className="my-2 text-xl font-semibold">
            {children}
          </h3>
        );
      } else if (style === "blockquote") {
        out.push(
          <blockquote
            key={blk._key ?? i}
            className="my-4 border-l-4 pl-4 italic text-gray-700"
          >
            {children}
          </blockquote>
        );
      } else {
        out.push(
          <p key={blk._key ?? i} className="my-2 leading-relaxed">
            {children}
          </p>
        );
      }

      i++;
      continue;
    }

    // Image blocks
    if (blk._type === "image" || blk.asset || blk.url) {
      const url =
        (typeof getImageUrl === "function" ? getImageUrl(blk) : null) ??
        blk.asset?.url ??
        blk.url ??
        null;

      const alt = blk.alt ?? "";

      if (url) {
        out.push(
          <div key={blk._key ?? i} className="my-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={String(url)}
              alt={String(alt)}
              className="max-w-full rounded-md"
            />
          </div>
        );
      }

      i++;
      continue;
    }

    i++;
  }

  return <>{out}</>;
}

/**
 * generateMetadata — retrieves SEO fields from Sanity.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const query = `*[_type == "import"][0]{
      title,
      subtitle,
      seo
    }`;

    const data = (await client.fetch(query)) as ImportDoc | null;

    if (!data) {
      return { title: "Import" };
    }

    const seoTitle = data.seo?.seoTitle ?? data.title ?? "Import";
    const description =
      data.seo?.metaDescription ?? data.subtitle ?? undefined;

    return {
      title: seoTitle,
      description,
      keywords: data.seo?.keywords,
      openGraph: {
        title: seoTitle,
        description,
      },
    };
  } catch {
    return { title: "Import" };
  }
}

export default async function Page() {
  const query = `*[_type == "import"][0]{
    title,
    subtitle,
    slug,

    // Page header fields
    breadcrumbLinks[]{
      _key,
      label,
      href
    },
    breadcrumbLabel,
    headerMessage,

    // Intro
    introTitle,
    introMessage,
    introBackground,

    // Import items
    imports[]{
      _key,
      title,
      description,
      image,
      order,
      "slug": slug.current
    },

    // Body
    bodyTitle,
    bodyMessage,
    bodyBackground,

    // SEO
    seo
  }`;

  const data = (await client.fetch(query)) as ImportDoc | null;

  if (!data) {
    return <div className="p-8">Import page not found.</div>;
  }

  const importsRaw: Record<string, unknown>[] = Array.isArray(data.imports)
    ? data.imports
    : [];

  return (
    <main>
      {/* Page header: breadcrumb, title, and short message only */}
      <PageHeader
        title={data.title}
        subtitle={data.subtitle}
        breadcrumbLinks={data.breadcrumbLinks}
        breadcrumbLabel={data.breadcrumbLabel}
        headerMessage={data.headerMessage}
      />

      {/* Existing intro section */}
      <ImportIntro
        introTitle={data.introTitle}
        introMessage={(data.introMessage as unknown[]) ?? []}
        introBackgroundEnabled={!!data.introBackground?.enabled}
      />

      {/* Existing import items */}
      <ImportsGrid importsArr={importsRaw} />

      {/* Existing body section */}
      <section
        className="mx-auto w-full"
        style={{
          background: data.bodyBackground?.enabled
            ? "linear-gradient(180deg,#f5f0ff,#f1e8ff)"
            : "transparent",
        }}
      >
        <div className="mx-auto w-[90%] max-w-[493px] py-12 md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]">
          <div className="max-w-[920px]">
            {data.bodyTitle && (
              <h2 className="mb-6 text-[45px] font-extrabold md:text-[60px]">
                {data.bodyTitle}
              </h2>
            )}

            {data.bodyMessage && (
              <div className="prose prose-sm max-w-none text-[#1A1A1A] sm:prose lg:prose-lg">
                <PortableTextServer
                  value={(data.bodyMessage as unknown[]) ?? []}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}