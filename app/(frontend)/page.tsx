// app/page.tsx
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Slider from "@/components/Slider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Next.js Template for Startup and SaaS",
  description: "This is Home for Startup Nextjs Template",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      {/* Slider (your existing Slider expects apiPath "/api/slider") */}
      <Slider apiPath="/api/slider" />
      <Hero />
    </>
  );
}
