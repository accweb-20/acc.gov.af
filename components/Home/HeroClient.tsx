// components/Home/HeroClient.tsx
// The two heroes that change by themselves: Story Slider and Featured Product.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  key: string;
  label: string;
  title: string;
  text?: string;
  image: string;
  thumb: string;
  cover: boolean; // true = photo fills the area, false = product photo on white
  buttonLabel: string;
  link?: string;
};

/** Changes the index every `seconds`; pauses while the mouse is over the hero. */
function useAutoIndex(count: number, seconds: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (count < 2 || paused) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), Math.max(3, seconds) * 1000);
    return () => window.clearInterval(t);
  }, [count, seconds, paused]);
  return { index, setIndex, setPaused };
}

const FADE = `@keyframes heroFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes heroZoom{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:none}}
@keyframes heroBar{from{width:0}to{width:100%}}`;

/* ------------------------------------------------------------------ */
/* Story Slider                                                        */
/* ------------------------------------------------------------------ */

export function StorySlider({ slides, seconds }: { slides: Slide[]; seconds: number }) {
  const { index, setIndex, setPaused } = useAutoIndex(slides.length, seconds);
  const s = slides[index] ?? slides[0];
  if (!s) return null;
  const go = (d: number) => setIndex((index + d + slides.length) % slides.length);

  return (
    <section
      className="relative mt-16 grid grid-cols-1 bg-deep lg:min-h-[640px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <style>{FADE}</style>

      {/* Photo */}
      <div className="relative order-first aspect-[4/3] overflow-hidden bg-paper lg:order-last lg:aspect-auto">
        <div key={s.key} className="absolute inset-0" style={{ animation: "heroZoom .7s ease-out" }}>
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={index === 0}
            sizes="(max-width: 1023px) 100vw, 60vw"
            className={s.cover ? "object-cover" : "object-contain p-10 lg:p-16"}
          />
        </div>

        {/* Previews of the other slides */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 right-5 hidden gap-3 md:flex">
            {slides.map((t, i) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show slide: ${t.title}`}
                className={`w-[118px] border-t-[3px] bg-paper p-2 text-left shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 ${
                  i === index ? "border-[#F4BA00]" : "border-transparent"
                }`}
              >
                <span className="relative block h-[64px] w-full">
                  <Image src={t.thumb} alt="" fill sizes="110px" className={t.cover ? "object-cover" : "object-contain"} />
                </span>
                <span className="mt-1.5 block truncate text-[12px] font-semibold text-ink">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text panel */}
      <div className="relative flex flex-col justify-center overflow-hidden px-[5%] py-12 text-white lg:py-16 lg:pl-[max(5%,calc((100vw-1140px)/2))] lg:pr-12">
        <span className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 -rotate-12 border-[3px] border-[#F4BA00]/25" />
        <div className="relative">
          <div className="text-[14px] font-bold tracking-[0.16em] text-[#F4BA00]">
            {String(index + 1).padStart(2, "0")} <span className="text-white/45">/ {String(slides.length).padStart(2, "0")}</span>
          </div>
          <div key={s.key} style={{ animation: "heroFade .6s ease-out" }}>
            <h1 className="mt-4 text-[32px] font-extrabold leading-[1.08] md:text-[44px] xl:text-[50px]">{s.title}</h1>
            {s.text && <p className="mt-4 text-[16px] leading-relaxed text-[#8FB8C8] md:text-[17px]">{s.text}</p>}
            {s.link && (
              <Link
                href={s.link}
                className="mt-7 inline-flex items-center gap-2 bg-[#F4BA00] px-7 py-3.5 text-[16px] font-bold text-[#1A1A1A] transition hover:bg-white"
                style={{ clipPath: "polygon(0 0, 100% 14%, 100% 100%, 0 100%)" }}
              >
                {s.buttonLabel} <ArrowRight size={17} />
              </Link>
            )}
          </div>

          {slides.length > 1 && (
            <div className="mt-10 flex items-center gap-2.5">
              <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="flex h-12 w-12 items-center justify-center border border-white/35 transition hover:border-[#F4BA00] hover:text-[#F4BA00]">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next slide" className="flex h-12 w-12 items-center justify-center bg-[#F4BA00] text-[#1A1A1A] transition hover:bg-white">
                <ChevronRight size={20} />
              </button>
              <span className="relative ml-4 h-[3px] w-36 bg-white/20">
                <span key={`bar-${index}`} className="absolute inset-y-0 left-0 bg-[#F4BA00]" style={{ animation: `heroBar ${Math.max(3, seconds)}s linear` }} />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured Product (right side only; the texts are rendered on the server) */
/* ------------------------------------------------------------------ */

export type Featured = {
  key: string;
  title: string;
  category?: string;
  image: string;
  href: string;
  specs: { label: string; value: string }[];
};

export function FeaturedRotator({ items, seconds, since }: { items: Featured[]; seconds: number; since?: number }) {
  const { index, setIndex, setPaused } = useAutoIndex(items.length, seconds);
  const p = items[index] ?? items[0];
  if (!p) return null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{FADE}</style>
      {/* Circle with the product (top-left); the details card sits outside it (bottom-right) */}
      <span className="absolute left-0 top-0 aspect-square w-[76%] rounded-full border-2 border-dashed border-[#F4BA00]/70" />
      <Link
        href={p.href}
        className="absolute left-[4%] top-[4%] grid aspect-square w-[68%] place-items-center overflow-hidden rounded-full bg-paper shadow-[0_40px_80px_rgba(0,0,0,0.28)]"
        aria-label={p.title}
      >
        <span key={p.key} className="relative block h-[70%] w-[70%]" style={{ animation: "heroZoom .7s ease-out" }}>
          <Image src={p.image} alt={p.title} fill sizes="(max-width: 1023px) 60vw, 360px" className="object-contain" priority={index === 0} />
        </span>
      </Link>

      {since ? (
        <div className="absolute bottom-[16%] left-0 grid h-20 w-20 place-items-center rounded-full bg-[#F4BA00] text-center shadow-[0_16px_40px_rgba(0,0,0,0.2)] sm:h-24 sm:w-24">
          <div>
            <b className="block text-[20px] font-extrabold leading-none text-brand-fg sm:text-[24px]">{since}</b>
            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-ink sm:text-[9px]">Trusted since</span>
          </div>
        </div>
      ) : null}

      {/* Details card – small and outside the product photo */}
      <div
        key={`card-${p.key}`}
        className="absolute bottom-0 right-0 w-[46%] max-w-[240px] border-t-4 border-[#F4BA00] bg-paper p-3 text-ink shadow-[0_20px_44px_rgba(0,0,0,0.22)] sm:p-4"
        style={{ animation: "heroFade .6s ease-out" }}
      >
        {p.category && <small className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-brand-fg">{p.category}</small>}
        <b className="mt-1 line-clamp-2 block text-[13px] leading-snug sm:text-[15px]">{p.title}</b>
        {p.specs.length > 0 && (
          <ul className="mt-1.5 hidden text-[12px] text-ink/70 sm:block">
            {p.specs.slice(0, 2).map((s) => (
              <li key={s.label} className="flex justify-between gap-2 border-t border-brand-line/10 py-1">
                <span className="shrink-0 capitalize">{s.label.toLowerCase()}</span>
                <span className="truncate text-right font-medium text-ink">{s.value}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href={`${p.href}#inquiry`} className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-brand-fg hover:underline sm:text-[13px]">
          Send inquiry <ArrowRight size={13} />
        </Link>
      </div>

      {items.length > 1 && (
        <div className="absolute right-0 top-[4%] hidden flex-col gap-2.5 lg:flex">
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${it.title}`}
              className={`w-2.5 rounded-full transition-all ${i === index ? "h-7 bg-[#F4BA00]" : "h-2.5 bg-white/45 hover:bg-white"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
