// app/(admin)/manage/actions.ts
// Server actions for the admin dashboard: login, logout, reply, mark read/unread.
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, SESSION_HOURS, createSessionToken } from "@/lib/session";
import {
  SALES_EMAIL,
  emailLayout,
  esc,
  isAllowedAdmin,
  requireAdmin,
  sendMail,
  supabaseAdmin,
  supabaseAuth,
  type Inquiry,
} from "@/lib/admin";

export type FormState = { error?: string; ok?: string } | undefined;

/* ---------------- Login / logout ---------------- */

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password." };

  const auth = supabaseAuth();
  if (!auth) return { error: "Server is not configured (Supabase)." };

  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Incorrect email or password." };
  if (!isAllowedAdmin(email)) return { error: "This account does not have admin access." };

  const token = await createSessionToken(email);
  if (!token) return { error: "Server is not configured (ADMIN_SESSION_SECRET)." };

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/login");
}

/* ---------------- Inquiries ---------------- */

export async function setRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const read = String(formData.get("read") ?? "") === "true";
  const db = supabaseAdmin();
  if (!db || !id) return;
  await db.from("import_inquiry").update({ is_read: read }).eq("id", id);
  revalidatePath("/manage", "layout");
  // Opening an inquiry marks it read again, so go back to the inbox
  if (!read) redirect("/");
}

export async function sendReply(_prev: FormState, formData: FormData): Promise<FormState> {
  const adminEmail = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < 5) return { error: "Please write a reply (at least 5 characters)." };
  if (message.length > 5000) return { error: "Reply is too long (max 5000 characters)." };

  const db = supabaseAdmin();
  if (!db) return { error: "Server is not configured (Supabase)." };

  const { data: inquiry } = await db.from("import_inquiry").select("*").eq("id", id).single<Inquiry>();
  if (!inquiry) return { error: "Inquiry not found." };

  const product = inquiry.product_title ?? "your product inquiry";
  const html = emailLayout(
    `Re: ${product}`,
    `<div style="white-space:pre-wrap">${esc(message)}</div>
     <div style="margin-top:26px;padding-top:14px;border-top:1px solid #eee;color:#777;font-size:13px">
       <p style="margin:0 0 6px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:11px">Your inquiry</p>
       ${inquiry.product_url ? `<p style="margin:0 0 6px"><a href="${esc(inquiry.product_url)}" style="color:#02587B">${esc(product)}</a></p>` : ""}
       <div style="white-space:pre-wrap;border-left:3px solid #F4BA00;padding-left:10px">${esc(inquiry.message)}</div>
     </div>`
  );

  const sent = await sendMail({
    to: inquiry.email,
    replyTo: SALES_EMAIL,
    subject: `Re: Your inquiry about ${product}`,
    text: `${message}\n\n---\nYour inquiry about ${product}:\n${inquiry.message}`,
    html,
  });

  const { error } = await db.from("import_inquiry_reply").insert([
    { inquiry_id: id, message, sent_by: adminEmail, email_sent: sent },
  ]);
  if (error) return { error: `Could not save the reply: ${error.message}` };

  await db.from("import_inquiry").update({ replied_at: new Date().toISOString(), is_read: true }).eq("id", id);
  revalidatePath("/manage", "layout");

  return sent
    ? { ok: `Reply sent to ${inquiry.email}.` }
    : { error: "The reply was saved, but the email could not be sent. Check the SMTP settings." };
}
