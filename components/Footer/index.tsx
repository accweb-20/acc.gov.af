// components/Footer/index.tsx
"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Mail, MapPin, Phone } from "lucide-react";

/* ---------- Types ---------- */

type InternalRefDoc = {
  _id?: string;
  _type?: string;
  slug?: string | null;
  title?: string | null;
};

type LinkObject = {
  linkType?: "internal" | "external";
  externalUrl?: string | null;
  openInNewTab?: boolean | null;
  internalRef?: InternalRefDoc | null;
};

type FooterItem = {
  order?: number | null;
  label?: string | null;
  link?: LinkObject | null;
};

type FooterColumn = {
  order?: number | null;
  title?: string | null;
  titleLink?: InternalRefDoc | null;
  items?: FooterItem[] | null;
};

type SocialLink = {
  order?: number | null;
  label?: string | null;
  url?: string | null;
  iconUrl?: string | null; // icon uploaded in Sanity (Footer → Social links)
  external?: boolean | null;
};

export type FooterDocument = {
  columns?: FooterColumn[] | null;
  copyrightText?: string | null;
  socialLinks?: SocialLink[] | null;
  showProducts?: boolean | null;
  productCategories?: { title?: string | null; href?: string | null }[] | null;
  aboutText?: string | null;
  address?: string | null;
  email?: string | null;
  phones?: string[] | null;
};

// Used until the fields are filled in Sanity (Footer → contact details)
const DEFAULTS = {
  aboutText: "Afghan Cart Corporation supports Afghanistan’s trading sector through import, export and sales – trusted since 1978.",
  address: "Khwaja Rawash Street, 9th District, Kabul, Afghanistan",
  email: "info@acc.gov.af",
  phones: ["0202 109 420", "0093 74 5700 015"],
};


/* ---------- Helper: Detect Platform ---------- */
function getHostFromUrl(urlString: string | null | undefined): string | null {
  if (!urlString) return null;
  try {
    return new URL(urlString).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function detectPlatform(label: string | null | undefined, url?: string | null): string {
  const l = (label ?? "").trim().toLowerCase();
  const host = getHostFromUrl(url) ?? "";
  const test = (subs: string | string[]) => {
    const arr = Array.isArray(subs) ? subs : [subs];
    return arr.some((s) => l.includes(s) || host.includes(s));
  };

  if (test(["facebook", "fb.com", "facebook.com"])) return "facebook";
  if (test(["instagram", "insta", "instagram.com"])) return "instagram";
  if (test(["x", "twitter", "t.co", "twitter.com"])) return "twitter";
  if (test(["linkedin", "linkedin.com"])) return "linkedin";
  if (test(["youtube", "youtu.be", "youtube.com"])) return "youtube";
  if (test(["tiktok", "tiktok.com"])) return "tiktok";
  if (test(["pinterest", "pinterest.com"])) return "pinterest";
  if (test(["github", "github.com"])) return "github";
  if (test(["telegram", "t.me", "telegram.me"])) return "telegram";
  if (test(["whatsapp", "wa.me", "whatsapp.com"])) return "whatsapp";
  if (test(["medium", "medium.com"])) return "medium";
  if (test(["reddit", "reddit.com"])) return "reddit";

  return "other";
}

/* ---------- Component ---------- */

/** Pages that have no slug field get a fixed address. */
const TYPE_PATHS: Record<string, string> = {
  home: "/",
  servicesPage: "/services",
  import: "/services/imports",
  export: "/services/exports",
  sales: "/services/sales",
  tendersPage: "/tenders",
  jobsPage: "/jobs",
};

function refHref(ref?: InternalRefDoc | null): string | null {
  if (!ref) return null;
  if (ref.slug) return `/${String(ref.slug).replace(/^\/+/, "")}`;
  if (ref._type && TYPE_PATHS[ref._type]) return TYPE_PATHS[ref._type];
  return null;
}

export default function Footer({ doc, logo, name: logoName }: { doc?: FooterDocument | null; logo?: string | null; name?: string | null }) {
  const columns = (doc?.columns ?? []).slice().sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

  function resolveHref(link?: LinkObject | null): string {
    if (!link) return "#";
    if (link.linkType === "external" && link.externalUrl) return link.externalUrl;
    return refHref(link.internalRef) ?? "#";
  }

  function renderSocialIcon(s: SocialLink) {
    const label = s.label ?? "";
    const platform = detectPlatform(label, s.url);

    // Icon uploaded in Sanity: shown as it is
    if (s.iconUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={s.iconUrl} alt="" className="h-5 w-5 object-contain" />;
    }

    // Fallback inline SVG (these use currentColor and will match hover color exactly)
    switch (platform) {
      case "facebook":
        return (
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M12.1 10.4939V7.42705C12.1 6.23984 13.085 5.27741 14.3 5.27741H16.5V2.05296L13.5135 1.84452C10.9664 1.66676 8.8 3.63781 8.8 6.13287V10.4939H5.5V13.7183H8.8V20.1667H12.1V13.7183H15.4L16.5 10.4939H12.1Z"
              fill="currentColor"
            />
          </svg>
        );
      case "instagram":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
          </svg>
        );
      case "twitter":
      case "x":
        return (
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M13.9831 19.25L9.82094 13.3176L4.61058 19.25H2.40625L8.843 11.9233L2.40625 2.75H8.06572L11.9884 8.34127L16.9034 2.75H19.1077L12.9697 9.73737L19.6425 19.25H13.9831ZM16.4378 17.5775H14.9538L5.56249 4.42252H7.04674L10.808 9.6899L11.4584 10.6039L16.4378 17.5775Z"
              fill="currentColor"
            />
          </svg>
        );
      case "whatsapp":
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="10" cy="10" r="8" fill="currentColor" />
          </svg>
        );
    }
  }

  const name = (logoName || "Afghan Cart").toUpperCase();
  const about = doc?.aboutText || DEFAULTS.aboutText;
  const address = doc?.address || DEFAULTS.address;
  const email = doc?.email || DEFAULTS.email;
  const phones = doc?.phones?.length ? doc.phones : DEFAULTS.phones;
  // Products column: each category title once, at most 8
  const seen = new Set<string>();
  const products = (doc?.showProducts === false ? [] : doc?.productCategories ?? [])
    .filter((c) => c.title && c.href && !seen.has(c.title.toLowerCase()) && seen.add(c.title.toLowerCase()))
    .slice(0, 8);
  const socials = (doc?.socialLinks ?? []).slice().sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  const linkCls = "group inline-flex items-start gap-1.5 py-1.5 text-[15px] text-white/75 transition hover:text-white";

  return (
    <footer className="relative z-10 overflow-hidden bg-brand text-white">
      {/* yellow line + soft shape */}
      <span className="absolute inset-x-0 top-0 h-1 bg-[#F4BA00]" />
      <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rotate-12 border-[3px] border-white/[0.06]" />

      <div className="relative mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px] py-14 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(var(--cols),minmax(0,1fr))_minmax(0,1.4fr)] lg:gap-12" style={{ ["--cols" as string]: Math.max(columns.length + (products.length ? 1 : 0), 1) }}>
          {/* Company */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={`${name} – home`}>
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="h-14 w-auto" />
              )}
              <span className="leading-none">
                <b className="block text-[19px] font-extrabold tracking-wide">{name}</b>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F4BA00]">Corporation</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">{about}</p>
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {socials.map((s, i) => {
                  const external = s?.external ?? true;
                  return (
                    <a
                      key={String(i)}
                      href={s?.url ?? "#"}
                      aria-label={s?.label ?? `social-${i}`}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#02587B] shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-[#F4BA00]"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center">{renderSocialIcon(s)}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link columns from Sanity */}
          {columns.map((col, idx) => (
            <div key={String(idx)}>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-white">
                {refHref(col.titleLink) ? (
                  <Link href={refHref(col.titleLink)!} className="transition hover:text-[#F4BA00]">
                    {col.title}
                  </Link>
                ) : (
                  col.title
                )}
              </h2>
              <span className="mb-4 mt-3 block h-[3px] w-8 bg-[#F4BA00]" />
              <ul>
                {(col.items ?? [])
                  .slice()
                  .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                  .map((it, i) => {
                    const label = it?.label ?? it?.link?.internalRef?.title ?? "Untitled";
                    const href = resolveHref(it?.link ?? null);
                    const openNew = Boolean(it?.link?.openInNewTab);
                    const inner = (
                      <>
                        <ChevronRight size={14} className="mt-[5px] shrink-0 text-[#F4BA00] transition group-hover:translate-x-0.5" />
                        {label}
                      </>
                    );
                    return (
                      <li key={String(i)}>
                        {it?.link?.linkType === "external" ? (
                          <a href={href} target={openNew ? "_blank" : undefined} rel={openNew ? "noopener noreferrer" : undefined} className={linkCls}>
                            {inner}
                          </a>
                        ) : (
                          <Link href={href} className={linkCls}>
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}

          {/* Products: product categories (automatic) */}
          {products.length > 0 && (
            <div className="col-span-2 lg:col-span-1">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-white">
                <Link href="/services" className="transition hover:text-[#F4BA00]">
                  Products
                </Link>
              </h2>
              <span className="mb-4 mt-3 block h-[3px] w-8 bg-[#F4BA00]" />
              <ul className="grid grid-cols-2 gap-x-6 lg:block">
                {products.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href!} className={linkCls}>
                      <ChevronRight size={14} className="mt-[5px] shrink-0 text-[#F4BA00] transition group-hover:translate-x-0.5" />
                      {c.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/services" className="group mt-1 inline-flex items-center gap-1.5 py-1.5 text-[14px] font-semibold text-[#F4BA00] transition hover:text-white">
                    All products <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-white">Contact</h2>
            <span className="mb-4 mt-3 block h-[3px] w-8 bg-[#F4BA00]" />
            <ul className="space-y-4 text-[15px] text-white/75">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#F4BA00]" />
                <span>{address}</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-[#F4BA00]" />
                <a href={`mailto:${email}`} className="transition hover:text-white">
                  {email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-[#F4BA00]" />
                <span className="flex flex-col gap-1">
                  {phones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/[^\d+]/g, "")}`} className="transition hover:text-white">
                      {p}
                    </a>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative bg-deep">
        <div className="mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px] flex flex-col gap-3 py-5 text-[14px] text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <span>{doc?.copyrightText || `Copyright © ${new Date().getFullYear()} Afghan Cart Corporation`}</span>
        </div>
      </div>
    </footer>
  );
}
