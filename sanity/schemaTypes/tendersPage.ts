import { defineType, defineField, defineArrayMember } from "sanity";

const breadcrumbLink = defineArrayMember({
  name: "breadcrumbLink",
  title: "Breadcrumb Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Internal Path",
      type: "string",
      description: "For example / or /about-us.",
      validation: (Rule) =>
        Rule.required().custom((value) =>
          typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
            ? true
            : "Enter an internal path beginning with / (not //).",
        ),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export default defineType({
  name: "tendersPage",
  title: "Tenders Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "breadcrumbLinks",
      title: "Breadcrumb Links",
      type: "array",
      of: [breadcrumbLink],
      description: "Optional links displayed before the current page.",
    }),
    defineField({
      name: "breadcrumbLabel",
      title: "Current Breadcrumb Label",
      type: "string",
      description: "Defaults to the page title when blank.",
    }),
    defineField({
      name: "headerMessage",
      title: "Header Supporting Message",
      type: "text",
      rows: 3,
      description: "Short supporting message displayed below the page title.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
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
    }),
  ],
  preview: { select: { title: "title" } },
});
