// lib/session.ts
// Signed admin session cookie (HMAC-SHA256 via Web Crypto).
// Works both in proxy.ts and in server components / server actions.

export const ADMIN_COOKIE = "acc_admin_session";
export const SESSION_HOURS = 12;

const enc = new TextEncoder();

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  return s.length >= 32 ? s : null; // fail closed when not configured
}

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(key: string) {
  return crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export type AdminSession = { email: string; exp: number };

export async function createSessionToken(email: string): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const payload: AdminSession = { email, exp: Date.now() + SESSION_HOURS * 3600 * 1000 };
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(key), enc.encode(body)));
  return `${body}.${toB64Url(sig)}`;
}

export async function verifySessionToken(token?: string | null): Promise<AdminSession | null> {
  const key = secret();
  if (!key || !token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(key),
      fromB64Url(sig) as BufferSource,
      enc.encode(body)
    );
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as AdminSession;
    if (!data?.email || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/** True for admin.acc.gov.af (or whatever ADMIN_HOST is) and admin.localhost in development. */
export function isAdminHost(host: string | null | undefined): boolean {
  const h = (host ?? "").split(":")[0].toLowerCase();
  const configured = (process.env.ADMIN_HOST ?? "admin.acc.gov.af").toLowerCase();
  return h === configured || h === "admin.localhost";
}
