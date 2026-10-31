// components/Import/ImportIntro.tsx
// Intro section of the Imports page (title + rich text message).

import RichText from "./RichText";
import { Reveal } from "./Motion";
import { hasRich } from "@/lib/imports";

type Props = {
  introTitle?: string | null;
  introMessage?: unknown;
  introBackgroundEnabled?: boolean | null;
};

export default function ImportIntro({ introTitle, introMessage, introBackgroundEnabled }: Props) {
  if (!introTitle && !hasRich(introMessage)) return null;
  const dark = !!introBackgroundEnabled;

  return (
    <section className={`w-full ${dark ? "bg-brand text-[#F5F5F5]" : "bg-paper text-ink"}`}>
      <Reveal className="mx-auto w-[90%] max-w-[493px] py-12 md:w-[93%] md:max-w-[924px] md:py-16 lg:w-[90%] lg:max-w-[1140px]">
        {introTitle && <h2 className="mb-5 text-[38px] font-extrabold leading-tight md:text-[56px]">{introTitle}</h2>}
        {hasRich(introMessage) && (
          <div className={`max-w-[960px] text-[17px] md:text-[18px] ${dark ? "text-[#F5F5F5]/90" : "text-ink/80"}`}>
            <RichText value={introMessage} />
          </div>
        )}
      </Reveal>
    </section>
  );
}
