// components/Photos/PhotosIntro.tsx
// Intro section (title + rich text) for the Photos page.

import RichText from "@/components/Import/RichText";
import { hasRich } from "@/lib/imports";

type Props = {
  introTitle?: string | null;
  introMessage?: unknown;
  introBackgroundEnabled?: boolean | null;
};

export default function PhotosIntro({ introTitle, introMessage, introBackgroundEnabled }: Props) {
  if (!introTitle && !hasRich(introMessage)) return null;
  const dark = !!introBackgroundEnabled;

  return (
    <section className={`w-full mx-auto ${dark ? "bg-brand py-12 text-[#F5F5F5] md:py-16" : "py-8 text-ink"}`}>
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
        {introTitle && <h2 className="text-[40px] md:text-[56px] font-extrabold mb-4">{introTitle}</h2>}
        {hasRich(introMessage) && (
          <div className="max-w-full text-[17px] md:text-[18px]" style={{ textAlign: "left" }}>
            <RichText value={introMessage} onDark={dark} />
          </div>
        )}
      </div>
    </section>
  );
}
