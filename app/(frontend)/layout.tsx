// app/layout.tsx
"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Rubik } from "next/font/google";
import "../../styles/index.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      {/* Apply rubik.className so the whole site uses Rubik (served from Next.js) */}
      <body className={`bg-[#FFF] text-[#1A1A1A] text-[18px] ${rubik.className}`}>
        {/* Fonts & small global styles */}
      <style >{`
        /* Rubik (for subtitles/fallback) from Google Fonts */
        @import url("https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap");

        /* GETRONDE via cdnfonts (most common external source) */
        @import url("https://fonts.cdnfonts.com/css/getronde");

        /* Rubik Dirt via jsDelivr (fontsource) - if not available, fallbacks apply */
        @font-face {
          font-family: "RubikDirt";
          src: url("https://cdn.jsdelivr.net/npm/@fontsource/rubik-dirt@5.2.7/files/rubik-dirt-latin-400-normal.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        /* Utility classes */
        .font-getronde {
          font-family: "GETRONDE", "RubikDirt", "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, Arial !important;
        }
        .font-rubik-dirt {
          font-family: "RubikDirt", "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, Arial !important;
        }
        .font-rubik {
          font-family: "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, Arial !important;
        }

        /* ensure no radius inside our page card area */
        .no-radius * {
          border-radius: 0 !important;
        }
      `}</style>
        <Providers>
          <div className="isolate">
            <Header />
            {children}
            <Footer />
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
