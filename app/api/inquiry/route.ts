// app/api/inquiry/route.ts
// Receives a product inquiry (Imports, Exports or Sales), saves it in Supabase (table: import_inquiry)
// and notifies the sales team by email (default: sales@acc.gov.af).

import { NextResponse } from "next/server";
import { client as sanity } from "@/sanity/lib/client";
import { ADMIN_URL, SALES_EMAIL, SITE_URL, emailLayout, esc, sendMail, supabaseAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Honeypot: bots fill the hidden "website" field. Pretend success.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!productId) return NextResponse.json({ error: "Product is missing." }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (message.length < 20 || message.length > 4000) {
      return NextResponse.json({ error: "Message must be between 20 and 4000 characters." }, { status: 400 });
    }

    // Read the product from Sanity so the title/link cannot be faked.
    // Works for Imports, Exports and Sales products.
    const product = (await sanity.fetch(
      `*[_type in ["importProduct", "exportProduct", "salesProduct"] && _id == $id][0]{ _type, title, "slug": slug.current, "cat": category->slug.current }`,
      { id: productId }
    )) as { _type?: string; title?: string; slug?: string; cat?: string } | null;

    if (!product?.title) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const section = product._type === "exportProduct" ? "exports" : product._type === "salesProduct" ? "sales" : "imports";
    const sectionLabel = section === "exports" ? "Export" : section === "sales" ? "Sales" : "Import";
    const productUrl = `${SITE_URL}/services/${section}/${product.cat ?? ""}/${product.slug ?? ""}`;

    // 1) Save in Supabase
    const supabase = supabaseAdmin();
    if (!supabase) {
      console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for /api/inquiry");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const { data: row, error } = await supabase
      .from("import_inquiry")
      .insert([{ product_id: productId, product_title: product.title, product_url: productUrl, email, message }])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error (import_inquiry):", error.message);
      return NextResponse.json({ error: "Could not save your inquiry. Please try again." }, { status: 500 });
    }

    // 2) Notify sales (already saved, so an email failure does not fail the request)
    const adminLink = row?.id ? `${ADMIN_URL}/inquiry/${row.id}` : ADMIN_URL;
    const html = emailLayout(
      `New ${sectionLabel} Inquiry`,
      `<p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Product</p>
       <p style="margin:0 0 16px"><a href="${esc(productUrl)}" style="color:#02587B;font-weight:bold">${esc(product.title)}</a></p>
       <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">From</p>
       <p style="margin:0 0 16px"><a href="mailto:${esc(email)}" style="color:#02587B">${esc(email)}</a></p>
       <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Message</p>
       <div style="white-space:pre-wrap;background:#F5F5F5;border-left:4px solid #F4BA00;padding:12px">${esc(message)}</div>
       <p style="margin:22px 0 0"><a href="${esc(adminLink)}" style="background:#F4BA00;color:#1A1A1A;padding:10px 18px;font-weight:bold;text-decoration:none;display:inline-block">Open in admin dashboard</a></p>`
    );

    const sent = await sendMail({
      to: SALES_EMAIL,
      replyTo: email,
      subject: `${sectionLabel} inquiry: ${product.title}`,
      text: `New product inquiry\n\nProduct: ${product.title}\n${productUrl}\n\nFrom: ${email}\n\nMessage:\n${message}\n\nOpen: ${adminLink}`,
      html,
    });

    if (sent && row?.id) {
      await supabase.from("import_inquiry").update({ email_sent: true }).eq("id", row.id);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Inquiry route error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
