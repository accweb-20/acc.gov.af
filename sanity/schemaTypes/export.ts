import { defineType, defineField, defineArrayMember } from "sanity";
import { headerMessageFields, richTextField } from "./objects/richText";


const breadcrumbLink = defineArrayMember({
  name: "breadcrumbLink", title: "Breadcrumb Link", type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "href", title: "Internal Path", type: "string", validation: (Rule) => Rule.required().custom((value) => typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? true : "Enter an internal path beginning with / (not //).") }),
  ], preview: { select: { title: "label", subtitle: "href" } },
});

export default defineType({
  name: "export", title: "Export Page", type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "subtitle", title: "Subtitle (fallback header message)", type: "string" }),
    defineField({ name: "breadcrumbLinks", title: "Breadcrumb Links", type: "array", of: [breadcrumbLink] }),
    defineField({ name: "breadcrumbLabel", title: "Current Breadcrumb Label", type: "string", description: "Defaults to the page title." }),
    ...headerMessageFields(),
    defineField({ name: "introTitle", title: "Intro Title", type: "string" }),
    richTextField({ name: "introMessage", title: "Intro Message" }),
    defineField({ name: "introBackground", title: "Intro Background", type: "object", fields: [defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: false })] }),
    defineField({ name: "exports", title: "Export Items", type: "array", of: [defineArrayMember({ name: "exportItem", title: "Export Item", type: "object", fields: [
      defineField({ name: "title", title: "Title", type: "string" }),
      richTextField({ name: "description", title: "Description" }),
      defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
      defineField({ name: "order", title: "Order", type: "number" }),
      defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 } }),
    ], preview: { select: { title: "title", media: "image" } } })] }),
    defineField({ name: "bodyTitle", title: "Body Title", type: "string" }),
    richTextField({ name: "bodyMessage", title: "Body Message" }),
    defineField({ name: "bodyBackground", title: "Body Background", type: "object", fields: [defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: false })] }),
    defineField({ name: "seo", title: "SEO", type: "object", fields: [
      defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
      defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
      defineField({ name: "keywords", title: "Keywords", type: "array", of: [defineArrayMember({ type: "string" })] }),
    ] }),
  ],
  preview: { select: { title: "title", subtitle: "subtitle" } },
});
