// app/(admin)/manage/inquiry/[id]/page.tsx  →  admin.acc.gov.af/inquiry/<id>
// One inquiry: customer, product, message, reply history and reply form.

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  CheckCheck,
  Clock,
  ExternalLink,
  Mail,
  MailWarning,
  MessageSquareReply,
  MessageSquareText,
  Package,
  Send,
  UserRound,
} from "lucide-react";
import { requireAdmin, supabaseAdmin, type Inquiry, type InquiryReply } from "@/lib/admin";
import { setRead } from "../../actions";
import { ReplyForm } from "../../forms";
import { EYEBROW, Shell, StatusBadge, formatDate } from "../../ui";

export const metadata: Metadata = { title: "Inquiry" };
export const dynamic = "force-dynamic";

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const email = await requireAdmin();
  const { id } = await params;
  const db = supabaseAdmin();
  if (!db) notFound();

  const { data: inquiry } = await db.from("import_inquiry").select("*").eq("id", id).maybeSingle<Inquiry>();
  if (!inquiry) notFound();

  // Opening an inquiry marks it as read
  if (!inquiry.is_read) {
    await db.from("import_inquiry").update({ is_read: true }).eq("id", id);
    inquiry.is_read = true;
  }

  const { data: repliesData } = await db
    .from("import_inquiry_reply")
    .select("*")
    .eq("inquiry_id", id)
    .order("created_at", { ascending: true });
  const replies = (repliesData ?? []) as InquiryReply[];

  const product = inquiry.product_title ?? "your product";
  const template = `Dear customer,\n\nThank you for your interest in ${product}.\n\n\n\nBest regards,\nSales Department\nAfghan Cart Company`;

  return (
    <Shell email={email}>
      <Link
        href="/"
        className="adm-in group mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#02587B] hover:underline"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> All inquiries
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Conversation */}
        <div className="space-y-6">
          {/* Original inquiry */}
          <article className="adm-in border border-[#02587B]/10 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#02587B]/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center bg-[#E3EEF2] text-[#02587B]">
                  <UserRound size={20} />
                </span>
                <div>
                  <div className="text-[16px] font-semibold">{inquiry.email}</div>
                  <div className="flex items-center gap-1 text-[13px] text-[#1A1A1A]/50">
                    <Clock size={13} /> {formatDate(inquiry.created_at)}
                  </div>
                </div>
              </div>
              <StatusBadge read={!!inquiry.is_read} replied={!!inquiry.replied_at} />
            </div>
            <div className="px-5 py-5">
              <span className={`mb-2 flex items-center gap-1.5 ${EYEBROW}`}>
                <MessageSquareText size={14} /> Message
              </span>
              <p className="whitespace-pre-wrap border-l-4 border-[#F4BA00] bg-[#F5F5F5] px-4 py-3 text-[15px] leading-relaxed">
                {inquiry.message}
              </p>
            </div>
          </article>

          {/* Replies */}
          {replies.map((r, i) => (
            <article
              key={r.id}
              className="adm-in ml-0 border border-[#02587B]/15 bg-[#F5F9FA] md:ml-10"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#02587B]/10 px-5 py-3">
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#02587B]">
                  <MessageSquareReply size={16} /> {r.sent_by ?? "Sales"}
                </span>
                <span className="inline-flex items-center gap-3 text-[12px] text-[#1A1A1A]/50">
                  {r.email_sent ? (
                    <span className="inline-flex items-center gap-1 text-[#02587B]">
                      <CheckCheck size={14} /> Emailed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#B60000]">
                      <MailWarning size={14} /> Not emailed
                    </span>
                  )}
                  {formatDate(r.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap px-5 py-4 text-[15px] leading-relaxed">{r.message}</p>
            </article>
          ))}

          {/* Reply */}
          <section className="adm-in border border-[#02587B]/10 bg-white p-5" style={{ animationDelay: "160ms" }}>
            <h2 className={`mb-3 flex items-center gap-1.5 ${EYEBROW}`}>
              <Send size={14} /> Reply to {inquiry.email}
            </h2>
            <ReplyForm id={inquiry.id} defaultMessage={replies.length ? "" : template} />
          </section>
        </div>

        {/* Side panel */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="adm-in border border-[#02587B]/10 bg-white p-5" style={{ animationDelay: "80ms" }}>
            <span className={`mb-2 flex items-center gap-1.5 ${EYEBROW}`}>
              <Package size={14} /> Product
            </span>
            <p className="text-[16px] font-semibold">{inquiry.product_title ?? "—"}</p>
            {inquiry.product_url && (
              <a
                href={inquiry.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#02587B] hover:underline"
              >
                View on website <ExternalLink size={13} />
              </a>
            )}
          </div>

          <div className="adm-in border border-[#02587B]/10 bg-white p-5" style={{ animationDelay: "140ms" }}>
            <span className={`mb-2 flex items-center gap-1.5 ${EYEBROW}`}>
              <AtSign size={14} /> Customer email
            </span>
            <a href={`mailto:${inquiry.email}`} className="break-all text-[15px] font-medium text-[#02587B] hover:underline">
              {inquiry.email}
            </a>
            <div className={`mt-4 mb-1 flex items-center gap-1.5 ${EYEBROW}`}>
              <Mail size={14} /> Sales notified
            </div>
            <p className="text-[14px]">{inquiry.email_sent ? "Yes, by email" : "No (check SMTP settings)"}</p>
          </div>

          <form action={setRead} className="adm-in" style={{ animationDelay: "200ms" }}>
            <input type="hidden" name="id" value={inquiry.id} />
            <input type="hidden" name="read" value="false" />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 border border-[#02587B]/20 bg-white px-4 py-2.5 text-[14px] font-medium text-[#02587B] transition hover:border-[#02587B] hover:bg-[#E3EEF2]"
            >
              <MailWarning size={16} /> Mark as unread
            </button>
          </form>
        </aside>
      </div>
    </Shell>
  );
}
