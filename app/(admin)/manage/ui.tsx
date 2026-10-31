// app/(admin)/manage/ui.tsx
// Shared server components for the admin dashboard.

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Inbox, LogOut, UserRound } from "lucide-react";
import { logout } from "./actions";
import { SITE_URL } from "@/lib/admin";

export const EYEBROW = "text-[12px] font-bold uppercase tracking-[0.14em] text-[#1A1A1A]/45";

export function Shell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-[#02587B] text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex h-16 w-[94%] max-w-[1240px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-[19px] font-extrabold tracking-wide">
              AFGHAN <span className="text-[#F4BA00]">CART</span>
            </span>
            <span className="hidden items-center gap-1.5 border-l border-white/25 pl-3 text-[14px] text-white/80 sm:inline-flex">
              <Inbox size={16} /> Inquiries
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-[13px] text-white/75 transition hover:text-white md:inline-flex"
            >
              <ExternalLink size={14} /> Website
            </a>
            <span className="hidden items-center gap-1.5 text-[13px] text-white/75 sm:inline-flex">
              <UserRound size={15} /> {email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 border border-white/25 px-3 py-1.5 text-[13px] font-medium transition hover:border-[#F4BA00] hover:bg-[#F4BA00] hover:text-[#1A1A1A]"
              >
                <LogOut size={15} /> Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="h-[3px] bg-[#F4BA00]" />
      </header>
      <main className="mx-auto w-[94%] max-w-[1240px] py-8">{children}</main>
    </div>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kabul",
  });
}

export function StatusBadge({ read, replied }: { read: boolean; replied: boolean }) {
  if (replied)
    return <span className="inline-flex bg-[#E3EEF2] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#02587B]">Replied</span>;
  if (!read)
    return <span className="inline-flex bg-[#F4BA00] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">New</span>;
  return <span className="inline-flex bg-[#1A1A1A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/55">Pending</span>;
}
