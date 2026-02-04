"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import GoogleTranslate from "@/components/GoogleTranslate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
      <LanguageProvider>
        {/* 
            Pass showWidget={true} while debugging to see Google's dropdown.
            For production, keep it hidden (default false) because you use a custom dropdown.
        */}
        <GoogleTranslate showWidget={false} />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
