// components/ProductsGrid.tsx
import React from "react";
import ProductCard from "./ProductCard";
import { client } from "../sanity/lib/client"; // adapt path if needed
import { getImageUrl } from "../sanity/lib/image"; // IMPORT the helper

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
  properties?: any[]; // portable text
  order?: number;
};

export const revalidate = 60; // seconds

async function fetchProducts() {
  const query = `*[_type == "product"] | order(order asc) {
    _id,
    name,
    price,
    image,
    properties,
    order
  }[0...7]`;

  const products: SanityProduct[] = await client.fetch(query);
  return products;
}

function blocksToPlainText(blocks: any[] | undefined) {
  if (!blocks || !Array.isArray(blocks)) return "";
  const texts: string[] = [];

  for (const block of blocks) {
    if (block?._type === "block" && Array.isArray(block.children)) {
      const line = block.children
        .map((child: any) => (child.text ? child.text : ""))
        .join("");
      if (line.trim()) texts.push(line.trim());
    } else if (typeof block === "string") {
      texts.push(block);
    }
  }

  return texts.join("\n\n");
}

export default async function ProductsGrid() {
  const raw = await fetchProducts();
  const hasMore = raw.length > 6;
  const sliced = raw.slice(0, 6);

  const items = sliced.map((p) => {
    // Request a large-enough image from Sanity to avoid client-side upscaling.
    // 1200-1600px works well for cards in a 3-col layout; you can adjust.
    const imageUrl = p.image
      ? getImageUrl(p.image as any, { w: 1400, q: 80, fit: "max" })
      : null;

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
    <section className="my-12 w-full mx-auto md:max-w-[1440px]">
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
        <div className="text-[60px] font-bold mb-8">AVAILABLE PRODUCTS</div>

        <div
          className="grid"
          style={{
            gap: "30px",
            gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media (min-width: 640px) { /* tablet >=640px */
                  .products-grid-responsive { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) { /* desktop >=1024px */
                  .products-grid-responsive { grid-template-columns: repeat(3, 1fr); }
                }
              `,
            }}
          />
          <div
            className="products-grid-responsive"
            style={{ display: "grid", gap: "30px" }}
          >
            {items.map((it) => (
              <ProductCard
                key={it.id}
                id={it.id}
                name={it.name}
                price={it.price}
                imageUrl={it.imageUrl ?? undefined}
                propertiesText={it.propertiesText}
              />
            ))}
          </div>
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <a
              href="/products"
              className="inline-block px-6 py-3 bg-[#02587b] text-white font-semibold rounded shadow hover:brightness-95 transition"
            >
              Read More
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

