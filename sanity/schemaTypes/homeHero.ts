// sanity/schemaTypes/homeHero.ts
// "Home Hero" – the big first section of the home page (replaces the old image slider).
// All six hero designs live in this ONE document. "Active hero" decides which one is shown.
// Most content is filled in automatically from the rest of the website (products,
// categories, services, slider images); the fields here only add or override texts.

import { defineArrayMember, defineField, defineType } from "sanity";
import { PresentationIcon } from "@sanity/icons";

export const HERO_OPTIONS = [
  { title: "Product Showcase – headline with a collage of product photos", value: "productShowcase" },
  { title: "Service Banner – large photo with Imports / Exports / Sales cards", value: "serviceBanner" },
  { title: "Story Slider – text panel with changing slides and previews", value: "storySlider" },
  { title: "Trade Routes – world map with routes from Kabul", value: "tradeRoutes" },
  { title: "Bold Statement – big headline with a moving product strip", value: "boldStatement" },
  { title: "Featured Product – one product at a time in a spotlight", value: "featuredProduct" },
];

export const TRADE_REGIONS = [
  { title: "Europe", value: "europe" },
  { title: "Turkey", value: "turkey" },
  { title: "Iran", value: "iran" },
  { title: "Gulf (UAE, Saudi Arabia …)", value: "gulf" },
  { title: "Pakistan", value: "pakistan" },
  { title: "India", value: "india" },
  { title: "Central Asia", value: "centralAsia" },
  { title: "Russia", value: "russia" },
  { title: "China", value: "china" },
];

const productRefs = (description: string, max: number) =>
  defineField({
    name: "products",
    title: "Products (optional)",
    description,
    type: "array",
    of: [defineArrayMember({ type: "reference", to: [{ type: "importProduct" }, { type: "exportProduct" }, { type: "salesProduct" }] })],
    validation: (Rule) => Rule.max(max).unique(),
  });

const button = (name: string, title: string, label: string, link: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { columns: 2 },
    fields: [
      defineField({ name: "label", title: "Label", type: "string", initialValue: label }),
      defineField({
        name: "link",
        title: "Link",
        type: "string",
        initialValue: link,
        description: 'Page path such as "/services" or a full URL.',
      }),
    ],
  });

/** Texts every hero has. */
const texts = (d: { eyebrow: string; title: string; highlight: string; text: string }) => [
  defineField({ name: "eyebrow", title: "Small label above the title", type: "string", initialValue: d.eyebrow }),
  defineField({ name: "title", title: "Title", type: "string", initialValue: d.title, validation: (R) => R.max(90) }),
  defineField({
    name: "highlight",
    title: "Highlighted words",
    description: "Part of the title shown in colour (must be typed exactly as in the title).",
    type: "string",
    initialValue: d.highlight,
  }),
  defineField({ name: "text", title: "Text", type: "text", rows: 3, initialValue: d.text, validation: (R) => R.max(320) }),
];

const hero = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineField({ name, title, type: "object", group: name, options: { collapsible: false }, fields });

export default defineType({
  name: "homeHero",
  title: "Home Hero",
  type: "document",
  icon: PresentationIcon,
  groups: [
    { name: "main", title: "Active hero", default: true },
    ...HERO_OPTIONS.map((o) => ({ name: o.value, title: o.title.split(" – ")[0] })),
  ],
  fields: [
    defineField({
      name: "active",
      title: "Active hero",
      description: "Only this hero is shown on the home page. The others keep their settings, so you can switch back at any time.",
      type: "string",
      group: "main",
      initialValue: "productShowcase",
      options: { list: HERO_OPTIONS, layout: "radio" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "foundedYear",
      title: "Founded in (year)",
      description: 'Used for "since 1978" and "45+ years".',
      type: "number",
      group: "main",
      initialValue: 1978,
    }),

    hero("productShowcase", "Product Showcase", [
      ...texts({
        eyebrow: "Afghan Cart Corporation · Since 1978",
        title: "Your trusted partner in import, export & sales",
        highlight: "import, export",
        text: "Quality electrical equipment, home appliances, office supplies and the finest Afghan dry fruits — sourced, delivered and sold by a state-owned company you can rely on.",
      }),
      button("primary", "Main button", "Explore Our Services", "/services"),
      button("secondary", "Second button", "Contact Us", "/contact-us"),
      productRefs("Up to 4 products for the photo collage. Empty = random products (products marked “Featured” come first).", 4),
    ]),

    hero("serviceBanner", "Service Banner", [
      ...texts({
        eyebrow: "State-owned trading company",
        title: "Powering Afghanistan with quality goods",
        highlight: "quality goods",
        text: "From distribution transformers to everyday appliances, Afghan Cart imports, exports and sells products that keep the country moving.",
      }),
      button("primary", "Main button", "View Products", "/services"),
      button("secondary", "Second button", "About Afghan Cart", "/about-us"),
      defineField({
        name: "image",
        title: "Background photo (optional)",
        description: "Wide photo, at least 1920 × 900 px. Empty = the first image of the old home slider is used.",
        type: "image",
        options: { hotspot: true },
      }),
    ]),

    hero("storySlider", "Story Slider", [
      defineField({
        name: "slides",
        title: "Slides (optional)",
        description: "Empty = one slide per product category is made automatically (title, description, photo and link).",
        type: "array",
        validation: (R) => R.max(6),
        of: [
          defineArrayMember({
            type: "object",
            name: "slide",
            fields: [
              defineField({ name: "label", title: "Short label (preview card)", type: "string", validation: (R) => R.max(20) }),
              defineField({ name: "title", title: "Title", type: "string", validation: (R) => R.required().max(70) }),
              defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (R) => R.max(240) }),
              defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, validation: (R) => R.required() }),
              defineField({ name: "buttonLabel", title: "Button label", type: "string", initialValue: "Learn More" }),
              defineField({ name: "link", title: "Button link", type: "string", description: 'Page path such as "/services/exports".' }),
            ],
            preview: { select: { title: "title", subtitle: "label", media: "image" } },
          }),
        ],
      }),
      defineField({ name: "seconds", title: "Seconds per slide", type: "number", initialValue: 6, validation: (R) => R.min(3).max(20) }),
    ]),

    hero("tradeRoutes", "Trade Routes", [
      ...texts({
        eyebrow: "Connecting Afghanistan to the world",
        title: "Trade without borders, since 1978",
        highlight: "since 1978",
        text: "Afghan Cart Corporation imports the equipment Afghanistan needs and brings the finest Afghan products to regional and global markets.",
      }),
      button("primary", "Main button", "Our Services", "/services"),
      button("secondary", "Second button", "Send an Inquiry", "/contact-us"),
      defineField({
        name: "regions",
        title: "Trade regions on the map",
        type: "array",
        of: [defineArrayMember({ type: "string" })],
        options: { list: TRADE_REGIONS, layout: "grid" },
        initialValue: ["europe", "turkey", "gulf", "india", "china"],
      }),
      productRefs("Up to 2 products shown as small cards on the map. Empty = one random import and one random export product (Featured first).", 2),
    ]),

    hero("boldStatement", "Bold Statement", [
      defineField({ name: "eyebrow", title: "Small label above the title", type: "string", initialValue: "Afghan Cart Corporation · State-owned since 1978" }),
      defineField({ name: "line1", title: "Word 1 (outlined)", type: "string", initialValue: "Import." }),
      defineField({ name: "line2", title: "Word 2 (blue)", type: "string", initialValue: "Export." }),
      defineField({ name: "line3", title: "Word 3 (second line)", type: "string", initialValue: "Sales." }),
      defineField({ name: "text", title: "Text", type: "text", rows: 3, initialValue: "One trusted company for electrical equipment, home appliances, office supplies and the finest Afghan dry fruits." }),
      button("primary", "Main button", "Browse Products", "/services"),
      button("secondary", "Second button", "About Us", "/about-us"),
      productRefs("Products in the moving strip (up to 12). Empty = random products (products marked “Featured” come first).", 12),
    ]),

    hero("featuredProduct", "Featured Product", [
      ...texts({
        eyebrow: "Featured products",
        title: "Quality products for every need",
        highlight: "every need",
        text: "Electrical equipment, home appliances, office supplies and Afghan dry fruits — imported, exported and sold by Afghan Cart Corporation.",
      }),
      button("secondary", "Second button", "All Products", "/services"),
      defineField({
        name: "points",
        title: "Short trust points",
        type: "array",
        of: [defineArrayMember({ type: "string" })],
        initialValue: ["Trusted since 1978", "Quick inquiry response"],
        validation: (R) => R.max(3),
      }),
      productRefs("Products shown one after another (up to 6). Empty = random products (products marked “Featured” come first).", 6),
      defineField({ name: "seconds", title: "Seconds per product", type: "number", initialValue: 6, validation: (R) => R.min(3).max(20) }),
    ]),
  ],
  preview: {
    select: { active: "active" },
    prepare: ({ active }) => ({
      title: "Home Hero",
      subtitle: `Showing: ${HERO_OPTIONS.find((o) => o.value === active)?.title.split(" – ")[0] ?? "—"}`,
    }),
  },
});
