// app/all-items/page.tsx
import React from "react";
import ProductsGrid, { ProductGridItem } from "@/components/ProductsGrid";
import { sanityClient } from "@/sanity/lib/client";
import { getImageUrl } from "@/sanity/lib/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SanityImage = {
  _type?: string;
  asset?: { _ref?: string; _type?: string; url?: string };
};

type SanityProduct = {
  _id: string;
  title?: string;
  name?: string;
  price?: string | number;
  image?: SanityImage;
  properties?: any[];
  order?: number;
};

export async function generateMetadata() {
  return {
    title: "All Items",
    description: "Browse all available items.",
  };
}

async function fetchProducts() {
  const query = `*[_type == "product"] | order(order asc) {
    _id,
    name,
    price,
    image,
    properties,
    order
  }`;

  const products: SanityProduct[] = await sanityClient.fetch(query);
  return products;
}

function blocksToPlainText(blocks: any[] | undefined) {
  if (!blocks || !Array.isArray(blocks)) return "";
  const texts: string[] = [];

  for (const block of blocks) {
    if (block?._type === "block" && Array.isArray(block.children)) {
      const line = block.children.map((child: any) => (child.text ? child.text : "")).join("");
      if (line.trim()) texts.push(line.trim());
    } else if (typeof block === "string") {
      texts.push(block);
    }
  }

  return texts.join("\n\n");
}

export default async function AllItemsPage() {
  const rawProducts = await fetchProducts();

  const productItems: ProductGridItem[] = rawProducts.map((p) => {
    const imageUrl = p.image ? getImageUrl(p.image as any, { w: 1400, q: 80, fit: "max" }) : null;
    const propertiesText = blocksToPlainText(p.properties).slice(0, 220);

    return {
      id: p._id,
      name: p.name ?? null,
      price: p.price ?? null,
      imageUrl,
      propertiesText,
    };
  });

  return (
    <main className="w-full">
      <ProductsGrid items={productItems} hasMore={false} />
    </main>
  );
}