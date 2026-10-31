// sanity/schemaTypes/import.ts
//
// The Imports, Exports and Sales sections share the same three document types,
// created by the factories below:
//   - import / export / sales                          → the section page settings (header, intro, body, SEO)
//   - importCategory / exportCategory / salesCategory  → a group of products (title, description, order)
//   - importProduct / exportProduct / salesProduct     → one product with gallery, description, highlights, specs

import { defineType, defineField, defineArrayMember } from "sanity";
import { PackageIcon, TagIcon, DocumentsIcon } from "@sanity/icons";
import { richTextField, shortRichTextField, headerMessageFields } from "./objects/richText";

const seoField = defineField({
  name: "seo",
  title: "SEO Settings",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
  ],
});

const orderField = defineField({
  name: "order",
  title: "Order Number",
  type: "number",
  description: "Lower numbers appear first. Leave empty to show after numbered items.",
  validation: (Rule) => Rule.integer().min(0),
});


/* ---------------- Breadcrumbs (shared) ---------------- */

type Crumb = { _key: string; label: string; href: string };
const crumb = (key: string, label: string, href: string): Crumb => ({ _key: key, label, href });

export const DEFAULT_CRUMBS = {
  servicesPage: [crumb("home", "Home", "/")],
  importsPage: [crumb("home", "Home", "/"), crumb("services", "Services", "/services")],
  category: [crumb("home", "Home", "/"), crumb("services", "Services", "/services"), crumb("imports", "Imports", "/services/imports")],
  product: [crumb("home", "Home", "/"), crumb("services", "Services", "/services"), crumb("imports", "Imports", "/services/imports")],
};

/* ---------------- The three sections ---------------- */

export type ServiceDef = {
  key: "imports" | "exports" | "sales";
  label: string; // "Imports"
  singular: string; // "Import"
  page: string; // document type of the section page
  category: string;
  product: string;
};

export const SERVICE_DEFS: Record<ServiceDef["key"], ServiceDef> = {
  imports: { key: "imports", label: "Imports", singular: "Import", page: "import", category: "importCategory", product: "importProduct" },
  exports: { key: "exports", label: "Exports", singular: "Export", page: "export", category: "exportCategory", product: "exportProduct" },
  sales: { key: "sales", label: "Sales", singular: "Sales", page: "sales", category: "salesCategory", product: "salesProduct" },
};

const sectionCrumbs = (d: ServiceDef) => [
  crumb("home", "Home", "/"),
  crumb("services", "Services", "/services"),
  crumb(d.key, d.label, `/services/${d.key}`),
];

/** Reusable "Breadcrumb Parent Links" field. */
export function breadcrumbField(opts: {
  name?: string;
  title?: string;
  description?: string;
  group?: string;
  initial?: Crumb[];
}) {
  return defineField({
    name: opts.name ?? "breadcrumbLinks",
    title: opts.title ?? "Breadcrumb Parent Links",
    description: opts.description,
    type: "array",
    group: opts.group,
    initialValue: opts.initial,
    of: [
      defineArrayMember({
        type: "object",
        title: "Breadcrumb Link",
        fields: [
          defineField({ name: "label", title: "Link Title", type: "string", validation: (Rule) => Rule.required() }),
          defineField({
            name: "href",
            title: "Page Path",
            type: "string",
            description: 'Internal route such as "/", "/services" or "/services/imports".',
            validation: (Rule) =>
              Rule.required().custom((value) =>
                typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
                  ? true
                  : "Enter an internal page path starting with /."
              ),
          }),
        ],
        preview: { select: { title: "label", subtitle: "href" } },
      }),
    ],
  });
}

/* =====================================================================
   1. IMPORT PAGE (settings for /services/imports)
   ===================================================================== */

export function servicePageType(d: ServiceDef) {
  return defineType({
  name: d.page,
  title: `${d.label} Page`,
  type: "document",
  icon: DocumentsIcon,
  groups: [
    { name: "header", title: "Header", default: true },
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],

  fields: [
    defineField({
      name: "title",
      title: `${d.label} Page Title`,
      type: "string",
      group: "header",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      description: "Optional supporting text displayed below the page title.",
      type: "string",
      group: "header",
    }),

    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "header",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),

    breadcrumbField({
      group: "header",
      initial: DEFAULT_CRUMBS.importsPage,
      description: "Parent pages shown before this page's title. Default: Home / Services.",
    }),

    breadcrumbField({
      name: "categoryBreadcrumbLinks",
      title: "Default Breadcrumbs for Category Pages",
      group: "header",
      initial: sectionCrumbs(d),
      description:
        `Used on every category page (e.g. Home / Services / ${d.label} / Category). A category can override this in its own document.`,
    }),

    breadcrumbField({
      name: "productBreadcrumbLinks",
      title: "Default Breadcrumbs for Product Pages",
      group: "header",
      initial: sectionCrumbs(d),
      description:
        "Used on every product page. The product's category is added automatically after these links. A product can override this in its own document.",
    }),

    defineField({
      name: "breadcrumbLabel",
      title: "Current Breadcrumb Label",
      description: "Defaults to the page title.",
      type: "string",
      group: "header",
    }),

    ...headerMessageFields("header"),

    /* ---------- INTRO ---------- */

    defineField({ name: "introTitle", title: "Intro Title", type: "string", group: "content" }),

    richTextField({ name: "introMessage", title: "Intro Message", group: "content" }),

    defineField({
      name: "introBackground",
      title: "Intro Background",
      type: "object",
      group: "content",
      fields: [
        defineField({
          name: "enabled",
          title: "Use blue background for the intro",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),

    /* ---------- CATEGORIES SECTION ---------- */

    defineField({
      name: "categoriesTitle",
      title: "Categories Section Title",
      description: `Heading above the product categories. Example: "Our ${d.singular} Products".`,
      type: "string",
      group: "content",
    }),

    shortRichTextField({ name: "categoriesMessage", title: "Categories Section Message", group: "content", max: 400 }),

    defineField({
      name: "itemsPerCategory",
      title: "Products shown per category",
      description:
        `How many products each category shows on the main ${d.label} page. The rest are reached with "Show All". Default: 4.`,
      type: "number",
      group: "content",
      initialValue: 4,
      validation: (Rule) => Rule.integer().min(1).max(12),
    }),

    /* ---------- BODY ---------- */

    defineField({ name: "bodyTitle", title: "Body Title", type: "string", group: "content" }),

    richTextField({ name: "bodyMessage", title: "Body Message", group: "content" }),

    defineField({
      name: "bodyBackground",
      title: "Body Background",
      type: "object",
      group: "content",
      fields: [
        defineField({
          name: "enabled",
          title: "Use light blue background for the body",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),

    /* ---------- LEGACY (old single list of items) ---------- */

    defineField({
      name: d.key,
      title: `Legacy ${d.singular} Items (no longer displayed)`,
      description:
        `Old items from the previous page design. They are re-created as ${d.singular} Products; you can delete them here.`,
      type: "array",
      group: "content",
      readOnly: true,
      hidden: ({ value }) => !Array.isArray(value) || value.length === 0,
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({ name: "description", type: "array", of: [{ type: "block" }, { type: "image" }] }),
            defineField({ name: "image", type: "image" }),
            defineField({ name: "order", type: "number" }),
            defineField({ name: "slug", type: "slug" }),
          ],
          preview: { select: { title: "title", media: "image" } },
        }),
      ],
    }),

    { ...seoField, group: "seo" },
  ],

  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || `${d.label} Page`, subtitle: `/services/${d.key}` }),
  },
  });
}


/* =====================================================================
   2. IMPORT CATEGORY
   ===================================================================== */

export function serviceCategoryType(d: ServiceDef) {
  return defineType({
  name: d.category,
  title: `${d.singular} Category`,
  type: "document",
  icon: TagIcon,

  fields: [
    defineField({
      name: "title",
      title: "Category Title",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    }),

    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: `Used in the address: /services/${d.key}/<slug>`,
      options: { source: "title", maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),

    shortRichTextField({
      name: "description",
      title: "Category Description",
      description: "One or two sentences shown under the category title. Bold, highlight, color and links are supported.",
      max: 400,
    }),

    defineField({
      name: "image",
      title: "Category Image (optional)",
      description: "Square image, 400 × 400 px (JPG, under 150 KB). Shown on the category cards. If empty, a 2×2 mosaic of the category's product photos is shown instead.",
      type: "image",
      options: { hotspot: true },
    }),

    orderField,
    breadcrumbField({
      title: "Breadcrumb Parent Links",
      description: `Links shown before this category (Home / Services / ${d.label}). Filled in automatically for new categories.`,
      initial: sectionCrumbs(d),
    }),
    seoField,
  ],

  orderings: [
    {
      title: "Order Number",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }, { field: "title", direction: "asc" }],
    },
  ],

  preview: {
    select: { title: "title", order: "order", media: "image" },
    prepare: ({ title, order, media }) => ({
      title: title || "Untitled category",
      subtitle: typeof order === "number" ? `Order: ${order}` : "No order",
      media,
    }),
  },
});
}

/* =====================================================================
   3. IMPORT PRODUCT
   ===================================================================== */

export function serviceProductType(d: ServiceDef) {
  return defineType({
  name: d.product,
  title: `${d.singular} Product`,
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "details", title: "Details" },
    { name: "seo", title: "SEO" },
  ],

  fields: [
    defineField({
      name: "title",
      title: "Product Name",
      type: "string",
      group: "main",
      validation: (Rule) => Rule.required().min(2),
    }),

    defineField({
      name: "status",
      title: "Status",
      description:
        "Active: shown on the website. Draft: hidden everywhere (not ready yet). Archived: removed from the lists, but its page still opens with a note that it is no longer available.",
      type: "string",
      group: "main",
      initialValue: "active",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Draft", value: "draft" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "main",
      to: [{ type: d.category }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "images",
      title: "Product Images (Gallery)",
      description:
        "Square images: 400 × 400 px (JPG, under 150 KB). Every image is shown square on cards and on the product page, so keep the product in the center (use the hotspot/crop tool if needed). The first image is the main image shown on cards.",
      type: "array",
      group: "main",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description: "Short description of the image for accessibility and SEO.",
            }),
          ],
        }),
      ],
      validation: (Rule) => [
        Rule.max(12),
        Rule.min(1).warning("Add at least one image for a better product page."),
      ],
    }),

    shortRichTextField({
      name: "shortDescription",
      title: "Short Description (optional)",
      description:
        "One or two sentences used on product cards and at the top of the product page. If empty, the start of the full description is used. (Links are not clickable on cards.)",
      group: "main",
      max: 300,
    }),

    defineField({
      name: "featured",
      title: "Featured",
      description: "Featured products are shown first in their category and on the home page hero.",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),

    { ...orderField, group: "main" },

    breadcrumbField({
      group: "main",
      title: "Breadcrumb Parent Links",
      description:
        `Links shown before this product (Home / Services / ${d.label}); the category is always added automatically after them. Filled in automatically for new products.`,
      initial: sectionCrumbs(d),
    }),

    richTextField({
      name: "description",
      title: "Full Description (optional)",
      group: "details",
      description: `Use bold, italic, highlight, color and links (e.g. link a word to /services/${d.key}/<category>).`,
    }),

    defineField({
      name: "highlights",
      title: "Product Highlights (optional)",
      description: 'Short key points, e.g. "Certified quality", "Bulk orders available".',
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.max(12),
    }),

    defineField({
      name: "specifications",
      title: "Properties / Specifications (optional)",
      description: 'Label & value pairs, e.g. "Origin" → "Turkey", "Packaging" → "50 kg bags".',
      type: "array",
      group: "details",
      of: [
        defineArrayMember({
          type: "object",
          name: "spec",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "value", title: "Value", type: "string", validation: (Rule) => Rule.required() }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
    }),

    { ...seoField, group: "seo" },
  ],

  orderings: [
    {
      title: "Order Number",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }, { field: "title", direction: "asc" }],
    },
  ],

  preview: {
    select: { title: "title", category: "category.title", media: "images.0", featured: "featured", status: "status" },
    prepare: ({ title, category, media, featured, status }) => ({
      title: `${featured ? "★ " : ""}${title || "Untitled product"}`,
      // the status is shown in the list when it is not "Active"
      subtitle: [status === "draft" ? "DRAFT" : status === "archived" ? "ARCHIVED" : "", category || "No category"].filter(Boolean).join(" · "),
      media,
    }),
  },
});
}

/* ---------------- the document types ---------------- */

const importPage = servicePageType(SERVICE_DEFS.imports);
export const importCategory = serviceCategoryType(SERVICE_DEFS.imports);
export const importProduct = serviceProductType(SERVICE_DEFS.imports);

export const exportPage = servicePageType(SERVICE_DEFS.exports);
export const exportCategory = serviceCategoryType(SERVICE_DEFS.exports);
export const exportProduct = serviceProductType(SERVICE_DEFS.exports);

export const salesPage = servicePageType(SERVICE_DEFS.sales);
export const salesCategory = serviceCategoryType(SERVICE_DEFS.sales);
export const salesProduct = serviceProductType(SERVICE_DEFS.sales);

export default importPage;
