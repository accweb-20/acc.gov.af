// components/ProductsGrid.tsx
import React from "react";
import ProductCard from "./ProductCard";

export type ProductGridItem = {
  id: string;
  name?: string | null;
  price?: string | number | null;
  imageUrl?: string | null;
  propertiesText?: string;
};

export default function ProductsGrid({
  items,
  hasMore = false,
  readMoreHref = "/all-items",
}: {
  items: ProductGridItem[];
  hasMore?: boolean;
  readMoreHref?: string;
}) {
  return (
    <section className="my-12 w-full mx-auto md:max-w-[1440px]">
      <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] py-7 md:py-8">
        <div className="text-[45px] md:text-[60px] font-bold mb-8">AVAILABLE ITEMS</div>

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
                @media (min-width: 640px) {
                  .products-grid-responsive { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                  .products-grid-responsive { grid-template-columns: repeat(3, 1fr); }
                }
              `,
            }}
          />
          <div className="products-grid-responsive" style={{ display: "grid", gap: "30px" }}>
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
              href={readMoreHref}
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