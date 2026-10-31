// app/(admin)/manage/page.tsx  →  admin.acc.gov.af/
// Inquiry inbox: counters, filters, search, paginated list.

import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Inbox,
  MailOpen,
  MailWarning,
  MessageSquareReply,
  Package,
  Search,
  type LucideIcon,
} from "lucide-react";
import { requireAdmin, supabaseAdmin, type Inquiry } from "@/lib/admin";
import { EYEBROW, Shell, StatusBadge, formatDate } from "./ui";

export const metadata: Metadata = { title: "Inquiries" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Search = { status?: string; q?: string; page?: string };

const FILTERS = [
  { key: "all", label: "All", icon: Inbox },
  { key: "unread", label: "New", icon: MailWarning },
  { key: "pending", label: "Awaiting reply", icon: Clock },
  { key: "replied", label: "Replied", icon: MessageSquareReply },
] as const;

function href(params: Search) {
  const sp = new URLSearchParams();
  if (params.status && params.status !== "all") sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page !== "1") sp.set("page", params.page);
  const s = sp.toString();
  return s ? `/?${s}` : "/";
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const sp = await searchParams;
  const status = FILTERS.some((f) => f.key === sp.status) ? sp.status! : "all";
  const q = (sp.q ?? "").replace(/[,()%*\\]/g, " ").trim().slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);

  const db = supabaseAdmin();
  if (!db) {
    return (
      <Shell email={email}>
        <p className="border-l-4 border-[#B60000] bg-white p-4 text-[#B60000]">
          Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
        </p>
      </Shell>
    );
  }

  const head = () => db.from("import_inquiry").select("id", { count: "exact", head: true });
  const [all, unreadQ, pendingQ, repliedQ] = await Promise.all([
    head(),
    head().eq("is_read", false),
    head().is("replied_at", null),
    head().not("replied_at", "is", null),
  ]);
  const total = all.count ?? 0;
  const unread = unreadQ.count ?? 0;
  const pending = pendingQ.count ?? 0;
  const replied = repliedQ.count ?? 0;

  let list = db
    .from("import_inquiry")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status === "unread") list = list.eq("is_read", false);
  if (status === "pending") list = list.is("replied_at", null);
  if (status === "replied") list = list.not("replied_at", "is", null);
  if (q) list = list.or(`email.ilike.%${q}%,product_title.ilike.%${q}%,message.ilike.%${q}%`);

  const { data, count, error } = await list;
  const rows = (data ?? []) as Inquiry[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const stats: { label: string; value: number; icon: LucideIcon; accent?: boolean }[] = [
    { label: "Total inquiries", value: total, icon: Inbox },
    { label: "New", value: unread, icon: MailWarning, accent: true },
    { label: "Awaiting reply", value: pending, icon: Clock },
    { label: "Replied", value: replied, icon: MessageSquareReply },
  ];

  return (
    <Shell email={email}>
      <div className="adm-in mb-6 flex flex-col gap-1">
        <span className={EYEBROW}>Dashboard</span>
        <h1 className="text-[30px] font-bold">Product Inquiries</h1>
      </div>

      {/* Counters */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }, i) => (
          <div
            key={label}
            className="adm-in group flex items-center gap-4 border border-[#02587B]/10 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(2,88,123,0.12)]"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center transition duration-300 ${
                accent ? "bg-[#F4BA00] text-[#1A1A1A]" : "bg-[#02587B] text-[#F4BA00]"
              }`}
            >
              <Icon size={22} />
            </span>
            <div>
              <div className="text-[26px] font-bold leading-none text-[#02587B]">{value}</div>
              <div className={`mt-1 ${EYEBROW}`}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="adm-in mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between" style={{ animationDelay: "200ms" }}>
        <nav className="flex flex-wrap gap-1.5" aria-label="Filter inquiries">
          {FILTERS.map(({ key, label, icon: Icon }) => {
            const on = status === key;
            return (
              <Link
                key={key}
                href={href({ status: key, q })}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[14px] transition ${
                  on
                    ? "border-[#02587B] bg-[#02587B] text-white"
                    : "border-[#02587B]/15 bg-white text-[#1A1A1A]/70 hover:border-[#02587B]/40 hover:text-[#02587B]"
                }`}
              >
                <Icon size={15} /> {label}
              </Link>
            );
          })}
        </nav>
        <form action="/" method="get" className="flex w-full md:w-auto">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1 md:w-80">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/35" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search email, product or message"
              className="h-10 w-full border border-[#1A1A1A]/15 bg-white pl-9 pr-3 text-[14px] outline-none transition focus:border-[#02587B] focus:ring-2 focus:ring-[#02587B]/15"
            />
          </div>
          <button type="submit" className="h-10 bg-[#02587B] px-4 text-[14px] font-medium text-white hover:bg-[#014663]">
            Search
          </button>
        </form>
      </div>

      {error && (
        <p className="mb-4 border-l-4 border-[#B60000] bg-white p-3 text-[14px] text-[#B60000]">
          Could not load inquiries: {error.message}
        </p>
      )}

      {/* List */}
      <div className="border border-[#02587B]/10 bg-white">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-[#1A1A1A]/55">
            <MailOpen size={44} strokeWidth={1.3} className="text-[#02587B]/40" />
            No inquiries {q ? `match “${q}”` : "here yet"}.
          </div>
        ) : (
          <ul className="divide-y divide-[#02587B]/8">
            {rows.map((r, i) => {
              const unreadRow = !r.is_read;
              return (
                <li key={r.id} className="adm-in" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                  <Link
                    href={`/inquiry/${r.id}`}
                    className={`group relative grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-[#F5F9FA] md:grid-cols-[1fr_auto] md:items-center ${
                      unreadRow ? "bg-[#FFFBEB]" : ""
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 h-full w-1 transition-colors ${
                        unreadRow ? "bg-[#F4BA00]" : "bg-transparent group-hover:bg-[#02587B]/40"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge read={!!r.is_read} replied={!!r.replied_at} />
                        <span className={`truncate text-[15px] ${unreadRow ? "font-bold" : "font-medium"}`}>{r.email}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-[#02587B]">
                        <Package size={14} className="shrink-0" />
                        <span className="truncate">{r.product_title ?? "Product"}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[14px] text-[#1A1A1A]/60">{r.message}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-[#1A1A1A]/50 md:flex-col md:items-end md:gap-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} /> {formatDate(r.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#02587B] opacity-0 transition group-hover:opacity-100">
                        Open <ChevronRight size={14} />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-[14px]">
          <span className={EYEBROW}>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={href({ status, q, page: String(page - 1) })}
                className="inline-flex items-center gap-1 border border-[#02587B]/20 bg-white px-3 py-1.5 hover:border-[#02587B]"
              >
                <ChevronLeft size={15} /> Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={href({ status, q, page: String(page + 1) })}
                className="inline-flex items-center gap-1 border border-[#02587B]/20 bg-white px-3 py-1.5 hover:border-[#02587B]"
              >
                Next <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
