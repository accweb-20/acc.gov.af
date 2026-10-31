// lib/admin.ts
// Server-only helpers shared by /api/inquiry and the admin dashboard:
// Supabase service client, SMTP mailer, branded email layout, admin guard.

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";

/* ---------------- Supabase ---------------- */

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

/** Service-role client: bypasses RLS. Only ever used on the server. */
export function supabaseAdmin(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
}

/** Client used only to check an admin's email + password with Supabase Auth. */
export function supabaseAuth(): SupabaseClient | null {
  const key = SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Optional allow-list: ADMIN_EMAILS="a@acc.gov.af,b@acc.gov.af". Empty = any Supabase Auth user. */
export function isAllowedAdmin(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.length === 0 || list.includes(email.toLowerCase());
}

/* ---------------- Admin guard ---------------- */

export async function requireAdmin(): Promise<string> {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
  if (!session) redirect("/login");
  return session.email;
}

/* ---------------- Email ---------------- */

export const SALES_EMAIL = process.env.INQUIRY_NOTIFY_EMAIL ?? "sales@acc.gov.af";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acc.gov.af").replace(/\/$/, "");
export const ADMIN_URL = (process.env.ADMIN_URL ?? "https://admin.acc.gov.af").replace(/\/$/, "");

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);

/** Simple branded HTML email wrapper. `body` must already be escaped HTML. */
export function emailLayout(heading: string, body: string): string {
  return `
  <div style="background:#F5F5F5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:620px;margin:auto;background:#ffffff;border:1px solid #e3e3e3">
      <div style="background:#02587B;color:#F5F5F5;padding:16px 22px;font-size:18px;font-weight:bold">
        ${esc(heading)}
      </div>
      <div style="height:3px;background:#F4BA00"></div>
      <div style="padding:22px;color:#1A1A1A;font-size:15px;line-height:1.55">${body}</div>
      <div style="padding:14px 22px;border-top:1px solid #eee;color:#888;font-size:12px">
        Afghan Cart Company · <a href="${SITE_URL}" style="color:#02587B">${SITE_URL.replace(/^https?:\/\//, "")}</a>
      </div>
    </div>
  </div>`;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Email not sent: SMTP_HOST / SMTP_USER / SMTP_PASS are not set.");
    return false;
  }
  const port = Number(SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  try {
    await transporter.sendMail({
      from: SMTP_FROM ?? `"Afghan Cart Company" <${SMTP_USER}>`,
      to: opts.to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error("sendMail error:", err);
    return false;
  }
}

/* ---------------- Types ---------------- */

export type Inquiry = {
  id: string;
  created_at: string;
  product_id: string;
  product_title: string | null;
  product_url: string | null;
  email: string;
  message: string;
  email_sent: boolean | null;
  is_read: boolean | null;
  replied_at: string | null;
};

export type InquiryReply = {
  id: string;
  created_at: string;
  inquiry_id: string;
  message: string;
  sent_by: string | null;
  email_sent: boolean | null;
};
