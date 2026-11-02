// app/(admin)/layout.tsx
// Root layout for the admin dashboard served on admin.acc.gov.af

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../styles/index.css";
import "@fontsource-variable/rubik"; // self-hosted Rubik (no Google download during the build)

export const metadata: Metadata = {
  title: { default: "ACC Admin", template: "%s | ACC Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: `"Rubik Variable", system-ui, sans-serif` }} className={`min-h-screen bg-[#F5F5F5] text-[#1A1A1A] antialiased`}>
        <style>{`
          @keyframes admFade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
          .adm-in { animation: admFade .5s cubic-bezier(.22,1,.36,1) both }
        `}</style>
        {children}
      </body>
    </html>
  );
}
