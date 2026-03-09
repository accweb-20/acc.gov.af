// components/Videos/VideosIntro.tsx
"use client";
import React from "react";

export default function VideosIntro({ introTitle, introMessage, introBackgroundEnabled }: { introTitle?: string | null; introMessage?: any[] | null; introBackgroundEnabled?: boolean | null }) {
  const wrapper = introBackgroundEnabled ? "bg-[#02587B] text-[#F5F5F5] py-12" : "py-8";
  return (
    <section className={`${wrapper} w-full mx-auto`}>
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[1140px] py-7 md:py-8">
        {introTitle && <h2 className="text-[40px] md:text-[56px] font-extrabold mb-4">{introTitle}</h2>}
        {Array.isArray(introMessage) && introMessage.length > 0 && (
          <div className="prose max-w-none">
            {introMessage.map((b: any, i: number) => <p key={i}>{typeof b === "string" ? b : (b.children ? b.children.map((c:any)=>c.text).join(" ") : "")}</p>)}
          </div>
        )}
      </div>
    </section>
  );
}