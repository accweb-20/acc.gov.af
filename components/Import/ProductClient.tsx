// components/Import/ProductClient.tsx
// Interactive parts of the product page:
//   ProductGallery → main image, arrows, thumbnails, full-screen viewer
//   InquiryForm    → product + message + email, posts to /api/inquiry
"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AtSign,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  Loader2,
  Mail,
  MessageSquareText,
  Package,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

const KEYFRAMES = `
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes popIn { 0% { transform: scale(.4); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
@keyframes slideFromRight { from { transform: translateX(28%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes slideFromLeft { from { transform: translateX(-28%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
`;

export type GalleryImage = { src: string; thumb: string; full: string; alt: string };

/* =====================================================================
   GALLERY
   ===================================================================== */

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActiveRaw] = useState(0);
  const [dir, setDir] = useState(0); // 1 = slide in from the right, -1 = from the left
  const [open, setOpen] = useState(false);
  const setActive = (i: number) =>
    setActiveRaw((cur) => {
      if (i !== cur) setDir(i > cur ? 1 : -1);
      return i;
    });
  // Hover zoom (mouse only): the image enlarges and follows the cursor
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const count = images.length;

  // Thumbnail strip: no scrollbar, scrolled with the ‹ › buttons instead
  const strip = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });
  const updateStrip = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    setCanScroll({ prev: el.scrollLeft > 2, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    updateStrip();
    window.addEventListener("resize", updateStrip);
    return () => window.removeEventListener("resize", updateStrip);
  }, [updateStrip, count]);
  // Keep the active thumbnail in view
  useEffect(() => {
    const el = strip.current;
    const t = el?.children[active] as HTMLElement | undefined;
    if (!el || !t) return;
    if (t.offsetLeft < el.scrollLeft) el.scrollTo({ left: t.offsetLeft, behavior: "smooth" });
    else if (t.offsetLeft + t.offsetWidth > el.scrollLeft + el.clientWidth)
      el.scrollTo({ left: t.offsetLeft + t.offsetWidth - el.clientWidth, behavior: "smooth" });
  }, [active]);
  const scrollStrip = (dir: number) =>
    strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: "smooth" });

  const onZoomMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setActiveRaw((i) => (count ? (i + d + count) % count : 0));
    },
    [count]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (!count) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 border border-brand-line/10 bg-mist text-brand-fg/40">
        <Package size={64} strokeWidth={1.2} />
        <span className="text-sm font-medium uppercase tracking-wider">Image coming soon</span>
      </div>
    );
  }

  const current = images[active];
  const arrow =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-brand-fg shadow-md transition hover:scale-110 hover:bg-brand hover:text-white";

  return (
    <div>
      <style>{KEYFRAMES}</style>
      {/* Main image */}
      <div className="group relative aspect-square w-full overflow-hidden border border-brand-line/10 bg-paper">
        <div
          key={current.src + active}
          className="absolute inset-0 cursor-zoom-in"
          style={{
            animation: `${dir > 0 ? "slideFromRight" : dir < 0 ? "slideFromLeft" : "fadeIn"} .5s cubic-bezier(.22,.61,.36,1)`,
          }}
          onMouseMove={onZoomMove}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setOpen(true)}
        >
          <Image
            src={current.src}
            alt={current.alt || title}
            fill
            priority={active === 0}
            sizes="(max-width: 991px) 92vw, 560px"
            className="object-cover"
            style={{
              // Gentle zoom (1.6×) that eases in and follows the cursor smoothly
              transform: zoom ? "scale(1.6)" : "scale(1)",
              transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
              transition: "transform 700ms cubic-bezier(.22,.61,.36,1), transform-origin 450ms ease-out",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="View image full screen"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-[#1A1A1A]/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
        >
          <Expand size={16} />
        </button>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${arrow} left-3`}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${arrow} right-3`}>
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 left-3 bg-[#1A1A1A]/70 px-2.5 py-0.5 text-[12px] font-medium text-white">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => scrollStrip(-1)}
          aria-label="Previous thumbnails"
          disabled={!canScroll.prev}
          className={`shrink-0 p-1 text-ink transition ${canScroll.prev ? "opacity-30 hover:opacity-90" : "invisible"}`}
        >
          <ChevronLeft size={30} strokeWidth={1.75} />
        </button>
        <div
          ref={strip}
          onScroll={updateStrip}
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto"
        >
          {images.map((img, i) => (
            <button
              key={img.thumb + i}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden border-2 bg-paper transition ${
                i === active ? "border-brand-line" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.thumb} alt="" fill sizes="80px" className="object-cover transition-transform duration-300 hover:scale-110" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollStrip(1)}
          aria-label="Next thumbnails"
          disabled={!canScroll.next}
          className={`shrink-0 p-1 text-ink transition ${canScroll.next ? "opacity-30 hover:opacity-90" : "invisible"}`}
        >
          <ChevronRight size={30} strokeWidth={1.75} />
        </button>
        </div>
      )}

      {/* Full-screen viewer – rendered on <body> so the page header and animated
          parents can never cover it or trap it; Esc, ✕ or a click outside closes it. */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} images`}
          className="fixed inset-0 z-[10000] flex animate-[fadeIn_.25s_ease-out] items-center justify-center bg-[#1A1A1A]/95 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            autoFocus
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center bg-white/10 text-white hover:bg-alert focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={22} />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.full} alt={current.alt || title} fill sizes="(max-width: 1200px) 100vw, 1200px" className="object-contain" />
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${arrow} left-0`}>
                  <ChevronLeft size={20} />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${arrow} right-0`}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {active + 1} / {count}
          </span>
        </div>,
          document.body
        )}
    </div>
  );
}

/* =====================================================================
   INQUIRY FORM
   ===================================================================== */

const MIN_MSG = 20;
const MAX_MSG = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InquiryForm({
  productId,
  productTitle,
  productThumb,
}: {
  productId: string;
  productTitle: string;
  productThumb?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot – real users never see it
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");

  function validate() {
    const e: { email?: string; message?: string } = {};
    const len = message.trim().length;
    if (len < MIN_MSG) e.message = `Please write at least ${MIN_MSG} characters.`;
    else if (len > MAX_MSG) e.message = `Please keep your message under ${MAX_MSG} characters.`;
    if (!EMAIL_RE.test(email.trim())) e.email = "Please enter a valid email address.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email: email.trim(), message: message.trim(), website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Could not send your inquiry.");
      setStatus("sent");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex animate-[fadeIn_.5s_ease-out] flex-col items-center gap-3 border border-brand-line/15 bg-paper px-6 py-12 text-center">
        <style>{KEYFRAMES}</style>
        <span className="flex h-20 w-20 animate-[popIn_.5s_cubic-bezier(.34,1.56,.64,1)] items-center justify-center rounded-full bg-tint">
          <CheckCircle2 size={44} className="text-brand-fg" strokeWidth={1.6} />
        </span>
        <h3 className="text-[22px] font-bold text-ink">Inquiry sent successfully</h3>
        <p className="max-w-md text-[15px] text-ink/70">
          Thank you. Our sales team has received your inquiry about <strong>{productTitle}</strong> and will reply to{" "}
          <strong>{email}</strong> as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-[14px] font-semibold text-brand-fg underline-offset-4 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  const len = message.trim().length;
  const field =
    "w-full border bg-paper px-3 text-[15px] text-ink outline-none transition placeholder:text-ink/40 focus:border-brand-line focus:ring-2 focus:ring-brand-fg/15";

  return (
    <>
    <style>{KEYFRAMES}</style>
    <form onSubmit={onSubmit} noValidate className="relative border border-brand-line/15 bg-paper">
      {/* To */}
      <div className="flex items-center gap-3 border-b border-brand-line/10 bg-brand px-5 py-3 text-white">
        <Mail size={18} />
        <span className="text-[14px]">
          <span className="opacity-70">To:</span> <strong className="font-semibold">ACC Sales Department</strong>
        </span>
      </div>

      <div className="space-y-5 p-5 md:p-6">
        {/* Product */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">
            <Box size={14} /> Product
          </label>
          <div className="flex items-center gap-3 border border-ink/10 bg-smoke p-2">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-paper">
              {productThumb ? (
                <Image src={productThumb} alt="" fill sizes="56px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand-fg/40">
                  <Package size={22} />
                </div>
              )}
            </div>
            <span className="line-clamp-2 text-[15px] font-medium text-ink">{productTitle}</span>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="inq-message" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">
            <MessageSquareText size={14} /> Message <span className="text-alert">*</span>
          </label>
          <textarea
            id="inq-message"
            rows={6}
            value={message}
            maxLength={MAX_MSG}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
            }}
            placeholder="Enter details such as required quantity, specifications, packaging and delivery location."
            aria-invalid={!!errors.message}
            aria-describedby="inq-message-hint"
            className={`${field} resize-y py-2.5 ${errors.message ? "border-alert" : "border-ink/15"}`}
          />
          <div id="inq-message-hint" className="mt-1 flex justify-between text-[12px]">
            <span className="text-alert">{errors.message ?? ""}</span>
            <span className={len > 0 && len < MIN_MSG ? "text-alert" : "text-ink/45"}>
              {len} / {MAX_MSG}
            </span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="inq-email" className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">
            <AtSign size={14} /> Your Email Address <span className="text-alert">*</span>
          </label>
          <input
            id="inq-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="name@company.com"
            aria-invalid={!!errors.email}
            className={`${field} h-11 ${errors.email ? "border-alert" : "border-ink/15"}`}
          />
          {errors.email && <p className="mt-1 text-[12px] text-alert">{errors.email}</p>}
        </div>

        {/* Honeypot (hidden from people, bots fill it) */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        {status === "error" && (
          <p className="border-l-4 border-alert bg-alert/5 px-3 py-2 text-[14px] text-alert">{serverError}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex min-w-0 items-center gap-1.5 text-[12px] text-ink/50">
            <ShieldCheck size={14} className="text-brand-fg/60" /> We only use your email to reply to this inquiry.
          </p>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-[#F4BA00] px-8 py-2.5 text-[16px] font-bold text-[#1A1A1A] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)" }}
          >
            {status === "sending" ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} />}
            {status === "sending" ? "Sending..." : "Send Inquiry"}
          </button>
        </div>
      </div>
    </form>
    </>
  );
}
