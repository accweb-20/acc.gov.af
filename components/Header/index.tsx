// components/Header/index.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { sanityClient, getSanityImageUrl } from "../../sanity/lib/client";

type SanityLink = {
  linkType?: "internal" | "external";
  internalRef?: { _id?: string; _type?: string; title?: string; slug?: string } | null;
  externalUrl?: string | null;
  openInNewTab?: boolean;
};

type SubmenuItem = {
  label: string;
  link?: SanityLink | null;
};

type NavItem = {
  order?: number;
  title: string;
  link?: SanityLink | null;
  showSubmenu?: boolean;
  submenu?: { introText?: string | null; items?: SubmenuItem[] } | null;
};

type HeaderDoc = {
  title?: string;
  logo?: { asset?: { _ref?: string; _id?: string; url?: string } } | null;
  logoAlt?: string | null;
  logoLink?: string | null;
  navItems?: NavItem[] | null;
};

const LANGS = [
  { value: "en", label: "English" },
  { value: "ps", label: "Pashto" },
  { value: "fa", label: "Dari" },
];

export default function Header(): JSX.Element {
  const [data, setData] = useState<HeaderDoc | null>(null);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // IMPORTANT: initialize to a server-safe deterministic value
  const [lang, setLang] = useState<string>("en");

  // read saved language on client after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("site_lang");
    if (stored && stored !== lang) {
      setLang(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // persist lang to localStorage when it changes (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("site_lang", lang);
  }, [lang]);

  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const mobileRef = useRef<HTMLDivElement | null>(null);
  // Use separate refs for mobile and desktop language elements (avoid assigning same ref twice)
  const langRefMobile = useRef<HTMLDivElement | null>(null);
  const langRefDesktop = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNavbarOpen(false);
    setOpenIndex(null);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    async function fetchHeader() {
      try {
        const q = `*[_type == "header"][0]{
          title,
          logo{asset->{_id, url}},
          logoAlt,
          logoLink,
          navItems[]{
            order,
            title,
            showSubmenu,
            link{ linkType, internalRef-> { _id, _type, title, "slug": slug.current }, externalUrl, openInNewTab },
            submenu{ introText, items[]{ label, link{ linkType, internalRef->{ _id, _type, title, "slug": slug.current }, externalUrl, openInNewTab } } }
          }
        }`;
        const res = await sanityClient.fetch(q);
        if (!mounted) return;
        if (res?.navItems?.length) {
          res.navItems = res.navItems.slice().sort((a: NavItem, b: NavItem) => (a.order ?? 0) - (b.order ?? 0));
        }
        setData(res || null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch header:", err);
      }
    }
    fetchHeader();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = mobileRef.current;
      if (navbarOpen && el && !el.contains(e.target as Node)) {
        setNavbarOpen(false);
        setOpenIndex(null);
      }

      // check both language refs (desktop + mobile). If neither contains the click, close lang dropdown.
      const d = langRefDesktop.current;
      const m = langRefMobile.current;
      if (langOpen && !(d?.contains(e.target as Node) || m?.contains(e.target as Node))) {
        setLangOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [navbarOpen, langOpen]);

  const toggleSub = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  const resolveLink = (ln?: SanityLink | null) => {
    if (!ln) return { href: "/", external: false, target: "" };
    if (ln.linkType === "external") return { href: ln.externalUrl ?? "#", external: true, target: ln.openInNewTab ? "_blank" : "" };
    if (ln.internalRef && (ln.internalRef as any).slug) return { href: `/${(ln.internalRef as any).slug}`, external: false, target: "" };
    return { href: ln.externalUrl ?? "/", external: false, target: ln.openInNewTab ? "_blank" : "" };
  };

  const logoUrl = getSanityImageUrl(data?.logo ?? null, { width: 40, height: 40 });

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Use a fixed header height so nav items can occupy full height */}
        <div className="flex items-center justify-between h-16">
          {/* Logo + small-screen language area */}
          <div className="flex items-center gap-4 h-full">
            <Link href={data?.logoLink ?? "/"} className="inline-block flex items-center h-full mt-1">
              {data ? (
                logoUrl ? (
                  <Image src={logoUrl} alt={data?.logoAlt ?? data?.title ?? "logo"} width={47} height={40} unoptimized />
                ) : (
                  <span style={{ color: "#02587b", fontWeight: 700 }}>{data?.title ?? "Site"}</span>
                )
              ) : (
                <div className="w-12.5 h-14 mt-0.5  rounded bg-gray-200 animate-pulse" />
              )}
            </Link>

            {/* Small-screen language dropdown (styled options require custom UI) */}
            <div className="block lg:hidden" ref={langRefMobile}>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setLangOpen((s) => !s)}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  className="border rounded px-2 py-1 text-sm flex items-center"
                  style={{ borderColor: "#e5e7eb", color: "#02587b" }}
                >
                  {LANGS.find((l) => l.value === lang)?.label ?? "Language"}
                  <span className="ml-2" aria-hidden>
                    <svg width="25" height="24" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>
                {langOpen && (
                  <ul
                    role="listbox"
                    tabIndex={-1}
                    className="absolute left-0 mt-1 w-36 rounded shadow-lg bg-white z-50 overflow-hidden"
                    style={{ border: "1px solid #e5e7eb" }}
                  >
                    {LANGS.map((l) => (
                      <li
                        key={l.value}
                        role="option"
                        onClick={() => {
                          setLang(l.value);
                          setLangOpen(false);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && (setLang(l.value), setLangOpen(false))}
                        className="cursor-pointer px-3 py-2 text-sm"
                        style={{ color: "#02587b" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "#02587B";
                          (e.currentTarget as HTMLElement).style.color = "#F5F5F5";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "";
                          (e.currentTarget as HTMLElement).style.color = "#02587b";
                        }}
                      >
                        {l.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:block h-full">
            {data ? (
              <ul className="flex items-center space-x-6 h-full">
                {data.navItems?.map((item, i) => {
                  const ln = resolveLink(item.link);
                  return (
                    <li key={i} className="relative h-full">
                      {item.showSubmenu ? (
                        <div className="group h-full">
                          <button
                            onClick={() => toggleSub(i)}
                            className="flex items-center gap-2 text-base font-medium h-full px-1"
                            aria-expanded={openIndex === i}
                            style={{ background: "transparent" }}
                          >
                            <span className="nav-link inline-block" style={{ color: "#02587b" }}>
                              {item.title}
                            </span>
                            <span className="text-[#02587B]">
                              <svg width="25" height="24" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </button>

                          <div className="absolute left-0 mt-2 w-56 rounded shadow-lg bg-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                            <div className="p-4">
                              {item.submenu?.introText && <div className="mb-2 text-sm">{item.submenu.introText}</div>}
                              <ul>
                                {item.submenu?.items?.map((si, k) => {
                                  const s = resolveLink(si.link);
                                  return (
                                    <li key={k} className="py-1">
                                      {s.external ? (
                                        <a
                                          href={s.href}
                                          target={s.target}
                                          rel="noopener noreferrer"
                                          className=" text-sm py-2 inline-block"
                                          style={{ color: "#02587b" }}
                                        >
                                          {si.label}
                                        </a>
                                      ) : (
                                        <Link
                                          href={s.href}
                                          className={
                                            "relative text-sm py-2 inline-block text-[#02587b] " +
                                            "after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-2 " +
                                            "after:h-[2px] after:bg-[#02587b] after:rounded-none after:origin-center " +
                                            "after:scale-x-0 after:transition-transform after:duration-300 after:pointer-events-none " +
                                            "hover:after:scale-x-100"
                                          }
                                        >
                                          {si.label}
                                        </Link>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : ln.external ? (
                        <a
                          href={ln.href}
                          target={ln.target}
                          rel="noopener noreferrer"
                          className="text-base font-medium h-full flex items-center px-1"
                        >
                          <span className="nav-link inline-block" style={{ color: "#02587b" }}>
                            {item.title}
                          </span>
                        </a>
                      ) : (
                        <Link href={ln.href} className="text-base font-medium h-full flex items-center px-1">
                          <span className="nav-link inline-block" style={{ color: "#02587b" }}>
                            {item.title}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex items-center gap-4 mt-6">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            )}
          </nav>

          {/* Right side: desktop language select and mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block" ref={langRefDesktop}>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setLangOpen((s) => !s)}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  className="border rounded px-2 py-1 text-sm flex items-center"
                  style={{ borderColor: "#e5e7eb", color: "#02587b" }}
                >
                  {LANGS.find((l) => l.value === lang)?.label ?? "Language"}
                  <span className="ml-2" aria-hidden>
                    <svg width="15" height="14" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>

                {langOpen && (
                  <ul
                    role="listbox"
                    tabIndex={-1}
                    className="absolute right-0 mt-1 w-36 rounded shadow-lg bg-white z-50 overflow-hidden"
                    style={{ border: "1px solid #e5e7eb" }}
                  >
                    {LANGS.map((l) => (
                      <li
                        key={l.value}
                        role="option"
                        onClick={() => {
                          setLang(l.value);
                          setLangOpen(false);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && (setLang(l.value), setLangOpen(false))}
                        className="cursor-pointer px-3 py-2 text-sm"
                        style={{ color: "#02587b" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "#02587B";
                          (e.currentTarget as HTMLElement).style.color = "#F5F5F5";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "";
                          (e.currentTarget as HTMLElement).style.color = "#02587b";
                        }}
                      >
                        {l.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button aria-label="Toggle menu" onClick={() => setNavbarOpen((s) => !s)} className="lg:hidden p-2">
              <span className={`block w-7 h-5 relative`}>
                <span
                  className={`absolute left-0 top-0 block h-[2px] w-full transition-transform ${navbarOpen ? "translate-y-[10px] rotate-45" : ""}`}
                  style={{ background: "#02587b" }}
                />
                <span
                  className={`absolute left-0 top-[8px] block h-[2px] w-full transition-opacity ${navbarOpen ? "opacity-0" : ""}`}
                  style={{ background: "#02587b" }}
                />
                <span
                  className={`absolute left-0 top-[16px] block h-[2px] w-full transition-transform ${navbarOpen ? "-translate-y-[10px] -rotate-45" : ""}`}
                  style={{ background: "#02587b" }}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div ref={mobileRef} className={`fixed inset-0 z-40 transition-transform duration-300 ${navbarOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="w-full min-h-screen bg-white px-4 py-1.5 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              {data ? (
                logoUrl ? (
                  <Image src={logoUrl} alt={data?.logoAlt ?? "logo"} width={47} height={40} unoptimized />
                ) : (
                  <span style={{ color: "#02587b", fontWeight: 700 }}>{data?.title ?? "Site"}</span>
                )
              ) : (
                <div className="w-10 h-10 rounded bg-gray-200 animate-pulse" />
              )}
            </div>

            {/* mobile header right: language select + close icon */}
            <div className="flex items-center gap-3">
              <button onClick={() => setNavbarOpen(false)} aria-label="Close menu" className="p-2">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="#02587b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6L18 18" stroke="#02587b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <nav>
            {data ? (
              <ul className="flex flex-col">
                {data.navItems?.map((item, i) => {
                  const ln = resolveLink(item.link);
                  const isOpen = openIndex === i;
                  return (
                    <li key={i} className="border-b border-gray-100">
                      <div className="flex items-center justify-between py-4">
                        {item.showSubmenu ? (
                          <button onClick={() => toggleSub(i)} className="text-left flex-1" style={{ color: "#02587b" }}>
                            {item.title}
                          </button>
                        ) : ln.external ? (
                          <a href={ln.href} target={ln.target} rel="noopener noreferrer" className="flex-1" style={{ color: "#02587b" }}>
                            {item.title}
                          </a>
                        ) : (
                          <Link href={ln.href} className="flex-1" style={{ color: "#02587b" }}>
                            {item.title}
                          </Link>
                        )}

                        {item.showSubmenu && (
                          <button onClick={() => toggleSub(i)} aria-label="Toggle" className={`p-2 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: "#02587b" }}>
                            <svg width="20" height="20" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {item.showSubmenu && (
                        <div className={`overflow-hidden transition-[max-height] duration-300 ${isOpen ? "max-h-[1000px]" : "max-h-0"}`}>
                          <div className="pl-4 pr-6 pb-4">
                            {item.submenu?.introText && <div className="mb-2 text-sm">{item.submenu.introText}</div>}
                            <ul className="flex flex-col">
                              {item.submenu?.items?.map((si, k) => {
                                const s = resolveLink(si.link);
                                return (
                                  <li key={k} className="py-2">
                                    {s.external ? (
                                      <a href={s.href} target={s.target} rel="noopener noreferrer" className="block" style={{ color: "#02587b", paddingLeft: 8 }}>
                                        {si.label}
                                      </a>
                                    ) : (
                                      <Link href={s.href} className="block" style={{ color: "#02587b", paddingLeft: 8 }}>
                                        {si.label}
                                      </Link>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            )}
          </nav>
        </div>
      </div>

      <style jsx>{`
        /* base colors */
        a,
        button {
          color: #02587b;
        }
        a:hover,
        button:hover {
          color: #F4BA00;
        }

        /* Make nav link text inline-block so underline only covers text */
        .nav-link {
          position: relative;
          display: inline-block;
        }

        /*
          Top-level navigation underline:
          - 5px height
          - #02587B color
          - no border-radius
          - positioned below text (does not affect layout)
          - animate scaleX from center in 0.5s
        */
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px; /* sits under text, not overlapping */
          height: 4px;
          background: #02587b;
          border-radius: 0;
          transform-origin: center;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          pointer-events: none;
        }

        /* Expand from center on hover/focus; collapse on mouseout/blur */
        li:hover .nav-link::after,
        .nav-link:focus::after {
          transform: scaleX(1);
        }

        /* Ensure underline doesn't change layout height */
        header {
          /* nothing needed here - pseudo elements are absolutely positioned */
        }

        /* Remove rounding from underlines (force) */
        .nav-link::after {
          border-radius: 0 !important;
        }

        /*
          IMPORTANT:
          Native <select> options cannot be reliably styled across browsers.
          To meet the requirement "Language dropdown's hovered item background color should be #02587B with #F5F5F5 text"
          this component uses a custom dropdown (native <select> was replaced where visible).
        */

        /* Small screens: hide the pseudo underline animations to avoid layout quirks */
        @media (max-width: 1023px) {
          .nav-link::after {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
