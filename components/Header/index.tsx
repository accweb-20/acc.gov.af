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

  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("site_lang");
    if (stored && stored !== lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("site_lang", lang);
  }, [lang]);

  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const langRefMobile = useRef<HTMLDivElement | null>(null);
  const langRefDesktop = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNavbarOpen(false);
    setOpenIndex(null);
    setLangOpen(false);
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
          res.navItems = res.navItems
            .slice()
            .sort((a: NavItem, b: NavItem) => (a.order ?? 0) - (b.order ?? 0));
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
      const target = e.target as Node;

      const el = mobileRef.current;
      if (navbarOpen && el && !el.contains(target)) {
        setNavbarOpen(false);
        setOpenIndex(null);
      }

      const d = langRefDesktop.current;
      const m = langRefMobile.current;
      if (langOpen && !(d?.contains(target) || m?.contains(target))) {
        setLangOpen(false);
      }
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [navbarOpen, langOpen]);

  const toggleSub = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  const resolveLink = (ln?: SanityLink | null) => {
    if (!ln) return { href: "/", external: false, target: "" };

    if (ln.linkType === "external") {
      return {
        href: ln.externalUrl ?? "#",
        external: true,
        target: ln.openInNewTab ? "_blank" : "",
      };
    }

    if (ln.internalRef && (ln.internalRef as any).slug) {
      return {
        href: `/${(ln.internalRef as any).slug}`,
        external: false,
        target: "",
      };
    }

    return {
      href: ln.externalUrl ?? "/",
      external: false,
      target: ln.openInNewTab ? "_blank" : "",
    };
  };

  const logoUrl = getSanityImageUrl(data?.logo ?? null, { width: 40, height: 40 });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-sm">
        <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px]">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + mobile language area */}
            <div className="flex h-full items-center gap-4">
              <Link href={data?.logoLink ?? "/"} className="inline-flex h-full items-center">
                {data ? (
                  logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={data?.logoAlt ?? data?.title ?? "logo"}
                      width={47}
                      height={40}
                      unoptimized
                    />
                  ) : (
                    <span style={{ color: "#02587b", fontWeight: 700 }}>{data?.title ?? "Site"}</span>
                  )
                ) : (
                  <div className="h-14 w-12.5 animate-pulse rounded bg-gray-200 mt-0.5" />
                )}
              </Link>

              {/* Kept hidden on small screens unless you want to show it */}
              <div className="hidden" ref={langRefMobile}>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setLangOpen((s) => !s)}
                    aria-haspopup="listbox"
                    aria-expanded={langOpen}
                    className="flex items-center rounded border px-2 py-1 text-sm"
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
                      className="absolute left-0 z-50 mt-1 w-36 overflow-hidden rounded bg-white shadow-lg"
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
            <nav className="hidden h-full lg:block">
              {data ? (
                <ul className="flex h-full items-center space-x-6">
                  {data.navItems?.map((item, i) => {
                    const ln = resolveLink(item.link);

                    return (
                      <li key={i} className="relative h-full">
                        {item.showSubmenu ? (
                          <div className="group h-full">
                            <button
                              onClick={() => toggleSub(i)}
                              className="flex h-full items-center gap-2 px-1 text-base font-medium"
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

                            <div
                              className="absolute left-0 w-56 bg-white opacity-0 invisible shadow-lg transition-all group-hover:visible group-hover:opacity-100"
                              style={{
                                boxShadow:
                                  "0 6px 6px -4px rgba(0,0,0,0.25), 4px 0 6px -4px rgba(0,0,0,0.25), -4px 0 6px -4px rgba(0,0,0,0.25)",
                              }}
                            >
                              <div className="px-4">
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
                                            className="inline-block py-2 text-sm"
                                            style={{ color: "#02587b" }}
                                          >
                                            {si.label}
                                          </a>
                                        ) : (
                                          <Link
                                            href={s.href}
                                            className={
                                              "relative inline-block py-2 text-sm text-[#02587b] " +
                                              "after:absolute after:bottom-2 after:left-0 after:right-0 " +
                                              "after:h-[2px] after:origin-center after:scale-x-0 after:transform after:bg-[#02587b] " +
                                              "after:transition-transform after:duration-300 after:content-[''] after:pointer-events-none " +
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
                            className="flex h-full items-center px-1 text-base font-medium"
                          >
                            <span className="nav-link inline-block" style={{ color: "#02587b" }}>
                              {item.title}
                            </span>
                          </a>
                        ) : (
                          <Link href={ln.href} className="flex h-full items-center px-1 text-base font-medium">
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
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              )}
            </nav>

            {/* Right side: desktop language select and mobile toggle */}
            <div className="flex items-center gap-3">
              <div className="hidden" ref={langRefDesktop}>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setLangOpen((s) => !s)}
                    aria-haspopup="listbox"
                    aria-expanded={langOpen}
                    className="flex items-center rounded border px-2 py-1 text-sm"
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
                      className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded bg-white shadow-lg"
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

              <button
                aria-label="Toggle menu"
                onClick={() => setNavbarOpen((s) => !s)}
                className="p-2 lg:hidden"
              >
                <span className="relative block h-5 w-7">
                  <span
                    className={`absolute left-0 top-0 block h-[2px] w-full transition-transform ${
                      navbarOpen ? "translate-y-[10px] rotate-45" : ""
                    }`}
                    style={{ background: "#02587b" }}
                  />
                  <span
                    className={`absolute left-0 top-[8px] block h-[2px] w-full transition-opacity ${
                      navbarOpen ? "opacity-0" : ""
                    }`}
                    style={{ background: "#02587b" }}
                  />
                  <span
                    className={`absolute left-0 top-[16px] block h-[2px] w-full transition-transform ${
                      navbarOpen ? "-translate-y-[10px] -rotate-45" : ""
                    }`}
                    style={{ background: "#02587b" }}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu: starts below the fixed header so the header stays visible */}
      <div
        ref={mobileRef}
        className={`fixed left-0 right-0 top-16 z-40 transition-transform duration-300 ${
          navbarOpen ? "translate-y-0" : "-translate-y-[calc(100vh-4rem)]"
        }`}
      >
        <div className="min-h-[calc(100vh-4rem)] w-full overflow-auto bg-white px-4 py-4">
          
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
                          <button onClick={() => toggleSub(i)} className="flex-1 text-left" style={{ color: "#02587b" }}>
                            {item.title}
                          </button>
                        ) : ln.external ? (
                          <a
                            href={ln.href}
                            target={ln.target}
                            rel="noopener noreferrer"
                            className="flex-1"
                            style={{ color: "#02587b" }}
                          >
                            {item.title}
                          </a>
                        ) : (
                          <Link href={ln.href} className="flex-1" style={{ color: "#02587b" }}>
                            {item.title}
                          </Link>
                        )}

                        {item.showSubmenu && (
                          <button
                            onClick={() => toggleSub(i)}
                            aria-label="Toggle"
                            className={`p-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            style={{ color: "#02587b" }}
                          >
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
                          <div className="pb-4 pl-4 pr-6">
                            {item.submenu?.introText && <div className="mb-2 text-sm">{item.submenu.introText}</div>}
                            <ul className="flex flex-col">
                              {item.submenu?.items?.map((si, k) => {
                                const s = resolveLink(si.link);

                                return (
                                  <li key={k} className="py-2">
                                    {s.external ? (
                                      <a
                                        href={s.href}
                                        target={s.target}
                                        rel="noopener noreferrer"
                                        className="block"
                                        style={{ color: "#02587b", paddingLeft: 8 }}
                                      >
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
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            )}
          </nav>
        </div>
      </div>

      <style jsx>{`
        a,
        button {
          color: #02587b;
        }

        a:hover,
        button:hover {
          color: #f4ba00;
        }

        .nav-link {
          position: relative;
          display: inline-block;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 4px;
          background: #02587b;
          border-radius: 0 !important;
          transform-origin: center;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          pointer-events: none;
        }

        li:hover .nav-link::after,
        .nav-link:focus::after {
          transform: scaleX(1);
        }

        @media (max-width: 1023px) {
          .nav-link::after {
            display: none;
          }
        }
      `}</style>
    </>
  );
}