// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Important: don't log the secret itself. Log a clear warning instead.
  console.error("Missing Supabase server env vars for /api/contact. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type ContactRow = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  is_read?: boolean | null;
};

function isString(x: unknown): x is string {
  return typeof x === "string";
}

export async function POST(req: Request) {
  try {
    // quick guard: ensure envs are present
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE env missing when handling contact POST");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const first_name = isString(body.first_name) ? body.first_name.trim() : "";
    const last_name = isString(body.last_name) ? body.last_name.trim() : "";
    const email = isString(body.email) ? body.email.trim() : "";
    const subject = isString(body.subject) ? body.subject.trim() : "";
    const message = isString(body.message) ? body.message.trim() : "";

    // server-side validation
    if (!first_name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const row: ContactRow = {
      first_name,
      last_name: last_name || null,
      email,
      subject,
      message,
      is_read: false,
    };

    // NOTE: table name must match your database exactly. your SQL used `contact` (lowercase).
    const { data, error } = await supabase.from("contact").insert([row]).select().single();

    if (error) {
      // Log full error to server console for debugging (the client gets a generic message)
      console.error("Supabase insert error (contact):", { message: error.message, details: error.details, hint: error.hint });
      return NextResponse.json({ error: "Failed to save message", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
