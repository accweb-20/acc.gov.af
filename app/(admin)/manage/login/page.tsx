// app/(admin)/manage/login/page.tsx  →  admin.acc.gov.af/login

import type { Metadata } from "next";
import { Inbox, ShieldCheck } from "lucide-react";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-[#02587B] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="absolute -right-24 -top-24 h-80 w-80 rotate-12 bg-white/5" />
        <span className="absolute -bottom-20 -left-20 h-64 w-64 -rotate-12 bg-[#F4BA00]/15" />
        <div className="adm-in relative text-[24px] font-extrabold tracking-wide">
          AFGHAN <span className="text-[#F4BA00]">CART</span>
        </div>
        <div className="adm-in relative max-w-md" style={{ animationDelay: "120ms" }}>
          <Inbox size={44} strokeWidth={1.4} className="text-[#F4BA00]" />
          <h1 className="mt-5 text-[40px] font-bold leading-tight">Inquiries Dashboard</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-[#8FB8C8]">
            Read product inquiries from the website and reply to customers directly by email.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-[13px] text-white/60">
          <ShieldCheck size={16} /> Authorized staff only
        </p>
      </section>

      {/* Form */}
      <section className="flex items-center justify-center p-6">
        <div className="adm-in w-full max-w-[400px] border border-[#02587B]/10 bg-white p-8 shadow-[0_20px_50px_rgba(2,88,123,0.12)]">
          <div className="mb-1 text-[20px] font-extrabold tracking-wide text-[#02587B] lg:hidden">
            AFGHAN <span className="text-[#F4BA00]">CART</span>
          </div>
          <h2 className="text-[26px] font-bold">Sign in</h2>
          <span className="mt-2 block h-1 w-12 bg-[#F4BA00]" />
          <p className="mb-6 mt-3 text-[14px] text-[#1A1A1A]/60">Use your staff account to continue.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
