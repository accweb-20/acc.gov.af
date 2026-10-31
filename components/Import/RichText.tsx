// components/Import/RichText.tsx
// Renders rich text from Sanity (or a plain string — older content still works).
// Supports bold, italic, underline, strike, highlight, brand text colors and links.
//   <RichText value={...} />                 full rendering (paragraphs, headings, lists, images)
//   <RichText value={...} inline noLinks />  one flowing line of text for cards (no nested links)

import type { ReactNode } from "react";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { imgUrl, type SanityImg } from "@/lib/imports";

export const TEXT_COLORS: Record<string, string> = {
  primary: "var(--color-brand-fg)",
  secondary: "#C99A00",
  red: "var(--color-alert)",
  black: "var(--color-ink)",
  gray: "var(--color-gray-500)",
};

type P = { children?: ReactNode };
type LinkValue = { href?: string; blank?: boolean };

function marks(noLinks: boolean, onDark = false): PortableTextComponents["marks"] {
  return {
    strong: ({ children }: P) => <strong className={`font-semibold ${onDark ? "" : "text-ink"}`}>{children}</strong>,
    em: ({ children }: P) => <em className="italic">{children}</em>,
    underline: ({ children }: P) => <u className="underline-offset-2">{children}</u>,
    "strike-through": ({ children }: P) => <s>{children}</s>,
    highlight: ({ children }: P) => (
      <mark className="bg-[#F4BA00]/25 px-0.5 text-inherit [box-decoration-break:clone]">{children}</mark>
    ),
    textColor: ({ children, value }: P & { value?: { color?: string } }) => (
      <span style={{ color: onDark && value?.color !== "secondary" ? undefined : TEXT_COLORS[value?.color ?? ""] }}>{children}</span>
    ),
    link: ({ children, value }: P & { value?: LinkValue }) => {
      const href = value?.href ?? "";
      if (noLinks || !href) return <span className={`font-medium ${onDark ? "" : "text-brand-fg"}`}>{children}</span>;
      const cls = onDark
        ? "font-medium text-white underline decoration-[#F4BA00] decoration-2 underline-offset-[3px] transition-colors hover:text-[#F4BA00]"
        : "font-medium text-brand-fg underline decoration-[#F4BA00] decoration-2 underline-offset-[3px] transition-colors hover:text-brand-fg hover:decoration-brand-fg";
      if (href.startsWith("/")) {
        return (
          <Link href={href} className={cls} target={value?.blank ? "_blank" : undefined}>
            {children}
          </Link>
        );
      }
      if (href.startsWith("#")) {
        return (
          <a href={href} className={cls}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} className={cls} target={value?.blank ? "_blank" : undefined} rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  };
}

const fullComponents = (noLinks = false, onDark = false): PortableTextComponents => ({
  block: {
    h1: ({ children }: P) => <h2 className="mb-3 mt-6 text-3xl font-bold">{children}</h2>,
    h2: ({ children }: P) => <h2 className="mb-3 mt-6 text-2xl font-bold">{children}</h2>,
    h3: ({ children }: P) => (
      <h3 className={`mb-2 mt-5 text-xl font-semibold ${onDark ? "text-[#F4BA00]" : "text-brand-fg"}`}>{children}</h3>
    ),
    h4: ({ children }: P) => <h4 className="mb-2 mt-4 text-lg font-semibold">{children}</h4>,
    normal: ({ children }: P) => <p className="my-3 leading-[1.7] first:mt-0 last:mb-0">{children}</p>,
    blockquote: ({ children }: P) => (
      <blockquote className={`my-4 border-l-4 border-[#F4BA00] py-2 pl-4 italic ${onDark ? "bg-white/10" : "bg-smoke"}`}>
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: P) => (
      <ul className={`my-3 list-disc space-y-1 pl-6 ${onDark ? "marker:text-[#F4BA00]" : "marker:text-brand-fg"}`}>{children}</ul>
    ),
    number: ({ children }: P) => (
      <ol className={`my-3 list-decimal space-y-1.5 pl-6 marker:font-semibold ${onDark ? "marker:text-[#F4BA00]" : "marker:text-brand-fg"}`}>
        {children}
      </ol>
    ),
  },
  marks: marks(noLinks, onDark),
  types: {
    image: ({ value }: { value?: SanityImg }) => {
      const src = imgUrl(value ?? null, 1200);
      return src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={value?.alt ?? ""} className="my-5 h-auto max-w-full" loading="lazy" />
      ) : null;
    },
  },
});

const inlineComponents = (noLinks: boolean, onDark = false): PortableTextComponents => ({
  block: { normal: ({ children }: P) => <>{children} </> },
  list: { bullet: ({ children }: P) => <>{children}</>, number: ({ children }: P) => <>{children}</> },
  listItem: { bullet: ({ children }: P) => <>{children} </>, number: ({ children }: P) => <>{children} </> },
  marks: marks(noLinks, onDark),
  types: { image: () => null },
});

export default function RichText({
  value,
  inline = false,
  noLinks = false,
  onDark = false,
}: {
  value?: unknown;
  inline?: boolean;
  noLinks?: boolean;
  /** true when the text sits on the blue background (white links, yellow accents) */
  onDark?: boolean;
}) {
  if (!value) return null;
  if (typeof value === "string") {
    if (inline) return <>{value}</>;
    return (
      <>
        {value
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="my-3 whitespace-pre-line leading-[1.7] first:mt-0 last:mb-0">
              {para}
            </p>
          ))}
      </>
    );
  }
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <PortableText
      value={value as never}
      components={inline ? inlineComponents(noLinks, onDark) : fullComponents(noLinks, onDark)}
    />
  );
}

/** Same styles as RichText, for direct use with <PortableText>. */
export const ptComponents = fullComponents();
