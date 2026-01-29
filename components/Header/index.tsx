"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { client } from "../../sanity/lib/client"; // adjust if your client lives elsewhere

/* -----------------------------
   Types
   -----------------------------*/

type InternalRef = { _id?: string; _type?: string; title?: string; slug?: string } | null;

type LinkObj = {
  linkType?: "internal" | "external";
  externalUrl?: string | null;
  openInNewTab?: boolean;
  internalRef?: InternalRef;
} | null;

type SubmenuItem = {
  label: string;
  link?: LinkObj;
};

type Submenu = {
  introText?: string;
  items?: SubmenuItem[];
} | null;

type NavItem = {
  order?: number;
  title: string;
  link?: LinkObj;
  showSubmenu?: boolean;
  submenu?: Submenu;
};

type HeaderDoc = {
  title?: string;
  logo?: any;
  logoAlt?: string;
  logoLink?: string;
  navItems?: NavItem[];
  adminNotes?: string;
} | null;

/* -----------------------------
   GROQ query
   -----------------------------*/
const QUERY = `*[_type == "header"][0]{
  title,
  logo,
  logoAlt,
  logoLink,
  navItems[]{
    order,
    title,
    showSubmenu,
    link{
      linkType,
      externalUrl,
      openInNewTab,
      internalRef->{_id,_type,title,"slug":coalesce(slug.current,"")}
    },
    submenu{introText, items[]{label, link{linkType, externalUrl, openInNewTab, internalRef->{_id,_type,title,"slug":coalesce(slug.current,"")}}}}
  },
  adminNotes
}`;

/* -----------------------------
   Utilities
   -----------------------------*/

function resolveHref(link?: LinkObj) {
  if (!link) return { href: "#", target: undefined };
  if (link.linkType === "external") return { href: link.externalUrl ?? "#", target: link.openInNewTab ? "_blank" : undefined };
  const ir = link.internalRef as InternalRef | undefined;
  if (!ir) return { href: "/", target: undefined };
  if (ir.slug) return { href: `/${ir.slug}`, target: undefined };
  if (ir._type && ir._id) return { href: `/${ir._type}/${ir._id}`, target: undefined };
  return { href: "/", target: undefined };
}

function imageUrlFromSanity(image: any) {
  // If Sanity image object has asset.url return it. This is the safest, no-extra-deps approach.
  return image?.asset?.url || image?.url || null;
}

/* -----------------------------
   Component
   -----------------------------*/

export default function Header() {
  const [header, setHeader] = useState<HeaderDoc>(null);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [sticky, setSticky] = useState(false);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    let mounted = true;
    client
      .fetch(QUERY)
      .then((res) => {
        if (!mounted) return;
        if (res?.navItems && Array.isArray(res.navItems)) {
          res.navItems = res.navItems.slice().sort((a: NavItem, b: NavItem) => (a?.order ?? 0) - (b?.order ?? 0));
        }
        setHeader(res || null);
      })
      .catch((err) => console.error("Failed to fetch header:", err));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleNavbar = () => setNavbarOpen((s) => !s);
  const toggleSub = (idx: number) => setOpenIndex((prev) => (prev === idx ? null : idx));

  return (
    <header
      className={`top-0 left-0 w-full z-40 ${sticky ? "fixed shadow-md" : "absolute"}`}
      style={{ background: "#02587b", color: "#F5F5F5" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href={header?.logoLink ?? "/"} className="flex items-center">
              {header?.logo ? (
                // Next/Image requires a remote domain allowed in next.config.js if Sanity CDN is used.
                // It will still render if the domain is allowed. Fallback to plain img when no allowed domain.
                imageUrlFromSanity(header.logo) ? (
                  <Image
                    src={imageUrlFromSanity(header.logo)!}
                    alt={header?.logoAlt ?? header?.title ?? "logo"}
                    width={160}
                    height={40}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <img src="/images/logo/logo.svg" alt={header?.logoAlt ?? "logo"} width={140} height={36} />
                )
              ) : (
                <div style={{ fontWeight: 700 }}>{header?.title ?? "Site"}</div>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex lg:items-center lg:gap-6">
            {(header?.navItems ?? []).map((item, i) => {
              const { href } = resolveHref(item?.link);
              const isActive = href && pathname === href;
              const hasSub = !!(item?.showSubmenu && item?.submenu?.items?.length);
              return (
                <div key={i} className="relative" style={{ marginRight: 6 }}>
                  {/* top-level link or button */}
                  {item?.link ? (
                    <Link
                      href={href}
                      className={`inline-block py-3 px-2 font-medium ${isActive ? "text-[#F4BA00]" : "text-[#F5F5F5]"}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="relative pb-3">
                        {item.title}
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -2,
                            height: 5,
                            borderRadius: 3,
                            background: isActive ? "#F4BA00" : "#F4C04A",
                            transform: `scaleX(${isActive ? 1 : 0})`,
                            transformOrigin: "left center",
                            transition: "transform 160ms",
                          }}
                        />
                      </span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleSub(i)}
                      className="inline-flex items-center gap-2 py-3 px-2 font-medium text-[#F5F5F5]"
                      aria-expanded={hasSub ? openIndex === i : undefined}
                    >
                      <span className="relative pb-3">
                        {item.title}
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -2,
                            height: 5,
                            borderRadius: 3,
                            background: "#F4C04A",
                            transform: "scaleX(0)",
                            transformOrigin: "left center",
                            transition: "transform 160ms",
                          }}
                        />
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}

                  {/* desktop submenu on hover */}
                  {hasSub && (
                    <div className="hidden group-hover:block absolute left-0 top-full mt-2 bg-white text-[#05212b] rounded-md shadow-lg min-w-[220px] p-3 lg:block">
                      {item.submenu?.introText && <div className="mb-2 text-sm">{item.submenu.introText}</div>}
                      {item.submenu?.items?.map((si, sidx) => {
                        const subHref = resolveHref(si.link).href;
                        return (
                          <Link key={sidx} href={subHref} className="block py-2 px-2 rounded hover:bg-gray-50">
                            {si.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile actions */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2"
              aria-label={navbarOpen ? "Close menu" : "Open menu"}
              onClick={toggleNavbar}
            >
              {/* Animated hamburger / X could be improved with CSS; keeping simple for clarity */}
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden>
                <rect y="1" width="22" height="2" rx="1" fill="#F5F5F5" />
                <rect y="8" width="22" height="2" rx="1" fill="#F5F5F5" />
                <rect y="15" width="22" height="2" rx="1" fill="#F5F5F5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile full width panel */}
        <div
          className={`lg:hidden transition-transform duration-220 origin-top ${navbarOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}
          style={{ background: "#02587b" }}
        >
          <div className="px-4 pb-6">
            {(header?.navItems ?? []).map((item, idx) => {
              const { href } = resolveHref(item?.link);
              const isActive = href && pathname === href;
              const hasSub = !!(item?.showSubmenu && item?.submenu?.items?.length);
              return (
                <div key={idx} className="border-b border-white/6 py-2">
                  {item?.link ? (
                    <Link
                      href={href}
                      className={`flex justify-between items-center py-3 px-2 ${isActive ? "text-[#F4BA00] font-semibold" : "text-[#F5F5F5]"}`}
                      onClick={() => setNavbarOpen(false)}
                    >
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleSub(idx)}
                        className="w-full flex items-center justify-between py-3 px-2 text-[#F5F5F5] font-medium"
                        aria-expanded={openIndex === idx}
                      >
                        <span>{item.title}</span>
                        <svg className={`${openIndex === idx ? "rotate-180" : ""} transition-transform`} width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Collapsible submenu */}
                      <div className={`overflow-hidden transition-max-height duration-300 ${openIndex === idx ? "max-h-[800px]" : "max-h-0"}`}>
                        <div className="pl-5">
                          {item.submenu?.items?.map((si, sidx) => {
                            const subHref = resolveHref(si.link).href;
                            const subActive = subHref && pathname === subHref;
                            return (
                              <Link
                                key={sidx}
                                href={subHref}
                                className={`block py-2 px-2 rounded ${subActive ? "text-[#F4BA00] font-semibold" : "text-[#F5F5F5]"}`}
                                onClick={() => setNavbarOpen(false)}
                              >
                                {si.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
