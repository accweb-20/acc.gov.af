// sanity/schemaTypes/servicesPage.ts
// Settings for the /services page. It has three sections: Imports, Exports and Sales.
// The Imports section shows categories & products automatically from the
// "Import Category" / "Import Product" documents — only its texts live here.

import { defineType, defineField, defineArrayMember } from "sanity";
import { ComponentIcon } from "@sanity/icons";
import { DEFAULT_CRUMBS, breadcrumbField } from "./import";
import { headerMessageFields, legacyTextField, richTextField, shortRichTextField } from "./objects/richText";

const sectionFields = (name: "imports" | "exports" | "sales", defaults: { title: string; button: string }) =>
  defineField({
    name: `${name}Section`,
    title: `${name[0].toUpperCase()}${name.slice(1)} Section`,
    type: "object",
    group: "sections",
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({ name: "enabled", title: "Show this section", type: "boolean", initialValue: true }),
      defineField({ name: "eyebrow", title: "Small label above the title", type: "string", initialValue: name.toUpperCase() }),
      defineField({ name: "title", title: "Title", type: "string", initialValue: defaults.title }),
      shortRichTextField({ name: "description", title: "Description", max: 600 }),
      defineField({ name: "highlights", title: "Key points (optional)", type: "array", of: [defineArrayMember({ type: "string" })], validation: (R) => R.max(6) }),
      defineField({ name: "buttonLabel", title: "Button label", type: "string", initialValue: defaults.button }),
      ...(name === "imports"
        ? []
        : [
            defineField({
              name: "comingSoon",
              title: "Show “Coming soon” instead of the button",
              type: "boolean",
              initialValue: true,
            }),
            defineField({ name: "image", title: "Image (optional)", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alternative text" })] }),
          ]),
    ],
  });

export default defineType({
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  icon: ComponentIcon,
  groups: [
    { name: "header", title: "Header", default: true },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Page Title", type: "string", group: "header", validation: (R) => R.required() }),
    breadcrumbField({ group: "header", initial: DEFAULT_CRUMBS.servicesPage, description: "Parent pages shown before this page's title. Default: Home." }),
    defineField({ name: "breadcrumbLabel", title: "Current Breadcrumb Label", type: "string", group: "header" }),
    ...headerMessageFields("header"),
    defineField({ name: "introTitle", title: "Intro Title", type: "string", group: "header" }),
    richTextField({ name: "introMessage", title: "Intro Message", group: "header", images: false }),

    sectionFields("imports", { title: "What We Import", button: "Explore All Imports" }),
    sectionFields("exports", { title: "Exports", button: "View Exports" }),
    sectionFields("sales", { title: "Sales", button: "View Sales" }),

    defineField({ name: "ctaTitle", title: "Bottom call-to-action title", type: "string", group: "sections" }),
    shortRichTextField({ name: "ctaDescription", title: "Bottom call-to-action text", group: "sections", max: 300 }),
    legacyTextField("ctaText", "Bottom call-to-action text", "sections"),

    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      group: "seo",
      fields: [
        defineField({ name: "seoTitle", title: "SEO Title", type: "string", validation: (R) => R.max(60).warning("Keep under 60 characters") }),
        defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3, validation: (R) => R.max(160).warning("Keep under 160 characters") }),
        defineField({ name: "keywords", title: "Keywords", type: "array", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Services Page", subtitle: "/services" }) },
});
