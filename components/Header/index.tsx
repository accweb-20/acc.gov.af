// components/Header/index.tsx
// Site header: logo + name, main menu with drop-down sub menus, "Contact Us" button,
// and a full-screen menu on phones. All menu items come from the Sanity "header" document.
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Mail, Menu, Moon, Phone, Sun, X } from "lucide-react";

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

export type HeaderDoc = {
  title?: string;
  logo?: { asset?: { _ref?: string; _id?: string; url?: string } } | null;
  logoAlt?: string | null;
  logoLink?: string | null;
  navItems?: NavItem[] | null;
};

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

const CONTAINER = "mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]"; // same width as the pages

/** "ABOUT US" → "About Us" */
const nice = (t?: string) => (t ?? "").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

function resolveLink(ln?: SanityLink | null) {
  if (!ln) return { href: "", external: false, target: undefined as string | undefined };
  const target = ln.openInNewTab ? "_blank" : undefined;
  if (ln.linkType === "external") return { href: ln.externalUrl ?? "", external: true, target };
  const ref = ln.internalRef;
  const path = ref?.slug ? `/${String(ref.slug).replace(/^\/+/, "")}` : ref?._type ? TYPE_PATHS[ref._type] : undefined;
  return { href: path ?? "", external: false, target };
}

/** A link that works for both internal pages and external websites. */
function NavLink({ ln, className, children, onClick }: { ln: ReturnType<typeof resolveLink>; className?: string; children: React.ReactNode; onClick?: () => void }) {
  if (ln.external)
    return (
      <a href={ln.href} target={ln.target} rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  return (
    <Link href={ln.href || "/"} target={ln.target} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/** Light / dark mode: the choice is saved in the browser (see the script in app/(frontend)/layout.tsx). */
function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

function ThemeButton() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch between light and dark mode"
      title="Light / dark mode"
      className="grid h-11 w-11 place-items-center text-white/85 transition hover:bg-white/10 hover:text-[#F4BA00]"
    >
      <Moon size={20} className="dark:hidden" />
      <Sun size={20} className="hidden dark:block" />
    </button>
  );
}

export default function Header({ data: raw, contact: info }: { data?: HeaderDoc | null; contact?: { email?: string | null; phones?: string[] | null } | null }) {
  const email = info?.email || "info@acc.gov.af";
  const phone = info?.phones?.[0] || "0093 74 5700 015";
  const items = (raw?.navItems ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null); // opened by click / keyboard
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // opened by the mouse
  const [scrolled, setScrolled] = useState(false);

  // close menus when the page changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setOpenIndex(null);
    setHoverIndex(null);
  }

  // darker header with a shadow after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // no page scrolling behind the phone menu
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Escape closes any open menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenIndex(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => !!href && (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const itemActive = (item: NavItem) =>
    isActive(resolveLink(item.link).href) || (item.submenu?.items ?? []).some((s) => isActive(resolveLink(s.link).href));
  const isContact = (item: NavItem) => item.link?.internalRef?._type === "contactUs";

  const logoUrl = raw?.logo?.asset?.url ?? null;
  const name = raw?.logoAlt || "Afghan Cart";
  const menu = items.filter((i) => !isContact(i));
  const contact = items.find(isContact);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-16 border-b border-black/20 text-white transition-[background-color,box-shadow] duration-300 ${
          scrolled || mobileOpen ? "bg-deep shadow-[0_10px_30px_rgba(0,0,0,0.3)]" : "bg-deep shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
        }`}
      >
        <div className={`${CONTAINER} flex h-full items-center justify-between gap-6`}>
          {/* Logo + name */}
          <Link href={raw?.logoLink ?? "/"} className="flex shrink-0 items-center gap-3" aria-label={`${name} – home`}>
            {raw ? (
              logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={name} className="h-11 w-auto" />
              ) : null
            ) : (
              <span className="h-11 w-10 animate-pulse bg-white/20" />
            )}
            <span className="leading-none lg:hidden xl:block">
              <b className="block text-[17px] font-extrabold tracking-wide">{name.toUpperCase()}</b>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F4BA00]">Corporation</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <nav aria-label="Main menu" className="hidden h-full lg:block">
            {raw ? (
              <ul className="flex h-full items-center">
                {menu.map((item, i) => {
                  const ln = resolveLink(item.link);
                  const active = itemActive(item);
                  const hasSub = !!item.showSubmenu && !!item.submenu?.items?.length;
                  const label = (
                    <span className={`relative py-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:bg-[#F4BA00] after:transition-transform after:duration-300 ${active ? "after:scale-x-100" : "after:scale-x-0 group-hover:after:scale-x-100"}`}>
                      {nice(item.title)}
                    </span>
                  );
                  const linkCls = `flex h-full items-center whitespace-nowrap px-2.5 text-[15px] font-medium transition xl:px-3.5 ${active ? "text-white" : "text-white/85 hover:text-white"}`;

                  return (
                    <li
                      key={i}
                      className="group relative h-full"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => {
                        // cursor left the menu item and its sub menu: close it
                        setHoverIndex(null);
                        setOpenIndex(null);
                      }}
                    >
                      <div className="flex h-full items-center">
                        {ln.href ? (
                          <NavLink ln={ln} className={linkCls}>
                            {label}
                          </NavLink>
                        ) : (
                          <button type="button" onClick={() => setOpenIndex(openIndex === i ? null : i)} className={linkCls} aria-expanded={openIndex === i}>
                            {label}
                          </button>
                        )}
                        {hasSub && (
                          <button
                            type="button"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            aria-label={`Show ${nice(item.title)} menu`}
                            aria-expanded={openIndex === i}
                            className={`-ml-2 flex h-full items-center pr-2 text-white/70 transition hover:text-white ${ln.href ? "" : "hidden"}`}
                          >
                            <ChevronDown size={15} className={`transition ${hoverIndex === i || openIndex === i ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {hasSub && (
                        <div
                          className={`absolute left-0 top-full w-64 pt-0 transition duration-200 group-has-[:focus-visible]:visible group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100 ${
                            hoverIndex === i || openIndex === i ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
                          }`}
                        >
                          <div className="border-t-[3px] border-[#F4BA00] bg-paper py-2 text-ink shadow-[0_24px_50px_rgba(1,52,74,0.22)]">
                            {item.submenu?.introText && <p className="px-5 pb-2 pt-1 text-[13px] text-ink/60">{item.submenu.introText}</p>}
                            <ul>
                              {item.submenu?.items?.map((si, k) => {
                                const s = resolveLink(si.link);
                                const on = isActive(s.href);
                                return (
                                  <li key={k}>
                                    <NavLink
                                      ln={s}
                                      onClick={() => {
                                        // close the sub menu after choosing a page
                                        setHoverIndex(null);
                                        setOpenIndex(null);
                                        (document.activeElement as HTMLElement | null)?.blur();
                                      }}
                                      className={`group/s flex items-center justify-between gap-3 px-5 py-2.5 text-[14px] font-medium transition ${
                                        on ? "bg-brand/[0.07] text-brand-fg" : "hover:bg-mist hover:text-brand-fg"
                                      }`}
                                    >
                                      {nice(si.label)}
                                      <ArrowRight size={15} className={`text-[#F4BA00] transition ${on ? "" : "-translate-x-1 opacity-0 group-hover/s:translate-x-0 group-hover/s:opacity-100"}`} />
                                    </NavLink>
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
              <div className="flex h-full items-center gap-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="h-3.5 w-20 animate-pulse bg-white/20" />
                ))}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeButton />
            {/* Contact button (the "Contact Us" menu item) */}
            {contact && (
              <NavLink
                ln={resolveLink(contact.link)}
                className="hidden items-center gap-2 whitespace-nowrap bg-[#F4BA00] px-5 py-2.5 text-[15px] font-bold text-[#1A1A1A] transition hover:bg-white lg:inline-flex"
              >
                {nice(contact.title)} <ArrowRight size={15} />
              </NavLink>
            )}

            {/* Phone menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="grid h-11 w-11 place-items-center transition hover:bg-white/10 lg:hidden"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Phone menu (below the header) */}
      <div
        className={`fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-deep text-white transition duration-300 lg:hidden ${
          mobileOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0"
        }`}
      >
        <nav aria-label="Main menu" className={`${CONTAINER} flex-1 py-4`}>
          <ul>
            {items.map((item, i) => {
              const ln = resolveLink(item.link);
              const hasSub = !!item.showSubmenu && !!item.submenu?.items?.length;
              const open = openIndex === i;
              const active = itemActive(item);
              return (
                <li key={i} className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    {ln.href ? (
                      <NavLink ln={ln} className={`flex-1 py-4 text-[16px] font-semibold ${active ? "text-[#F4BA00]" : ""}`}>
                        {nice(item.title)}
                      </NavLink>
                    ) : (
                      <button type="button" onClick={() => setOpenIndex(open ? null : i)} className={`flex-1 py-4 text-left text-[16px] font-semibold ${active ? "text-[#F4BA00]" : ""}`}>
                        {nice(item.title)}
                      </button>
                    )}
                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => setOpenIndex(open ? null : i)}
                        aria-label={`Show ${nice(item.title)} menu`}
                        aria-expanded={open}
                        className="grid h-11 w-11 place-items-center bg-white/5"
                      >
                        <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  {hasSub && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <ul className="overflow-hidden">
                        {item.submenu?.items?.map((si, k) => {
                          const s = resolveLink(si.link);
                          return (
                            <li key={k}>
                              <NavLink ln={s} className={`flex items-center gap-3 py-2.5 pl-4 text-[15px] ${isActive(s.href) ? "text-[#F4BA00]" : "text-white/80"}`}>
                                <span className="h-1.5 w-1.5 bg-[#F4BA00]" />
                                {nice(si.label)}
                              </NavLink>
                            </li>
                          );
                        })}
                        <li className="h-3" />
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="bg-deep py-6">
          <div className={`${CONTAINER} flex flex-col gap-3 text-[15px]`}>
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-white/85">
              <Mail size={17} className="text-[#F4BA00]" /> {email}
            </a>
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3 text-white/85">
              <Phone size={17} className="text-[#F4BA00]" /> {phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
