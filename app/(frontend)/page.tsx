// app/page.tsx
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Slider from "@/components/Slider";
import ProductsGrid from "@/components/ProductsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Afghan Cart State-owned Corportion",
  description: "We are serving to import, export and sale",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      {/* Slider (your existing Slider expects apiPath "/api/slider") */}
      <Slider apiPath="/api/slider" />
      {/* PRODUCTS SECTION (under Slider) */}
      {/* ProductsGrid is a server component that fetches from Sanity */}
      <ProductsGrid />
    </>
  );
}
