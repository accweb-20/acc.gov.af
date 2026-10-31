import { defineType, defineField, defineArrayMember } from "sanity";
import { headerMessageFields } from "./objects/richText";

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
      name: "detailBreadcrumbLinks",
      title: "Breadcrumb Links for Each Tender Page",
      type: "array",
      of: [breadcrumbLink],
      description: "Links shown before the title on every single tender page. Default: Home / Tenders.",
      initialValue: [
        { _key: "home", label: "Home", href: "/" },
        { _key: "tenders", label: "Tenders", href: "/tenders" },
      ],
    }),
    defineField({
      name: "detailBreadcrumbLabel",
      title: "Current Breadcrumb Label on Each Tender Page",
      type: "string",
      description: 'Defaults to "Tender Details".',
    }),
    ...headerMessageFields(),
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
