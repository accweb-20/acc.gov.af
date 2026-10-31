import { defineType, defineField, defineArrayMember } from "sanity";
import { headerMessageFields, richTextField } from "./objects/richText";


const breadcrumbLink = defineArrayMember({
  name: "breadcrumbLink", title: "Breadcrumb Link", type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "href", title: "Internal Path", type: "string", description: "For example / or /about-us.", validation: (Rule) => Rule.required().custom((value) => typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? true : "Enter an internal path beginning with / (not //).") }),
  ], preview: { select: { title: "label", subtitle: "href" } },
});

export default defineType({
  name: "contactUs", title: "Contact Us", type: "document",
  fields: [
    defineField({ name: "title", title: "Contact Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "subtitle", title: "Subtitle (fallback header message)", type: "string" }),
    defineField({ name: "slug", title: "Slug (URL)", type: "slug", options: { source: "title", maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "breadcrumbLinks", title: "Breadcrumb Links", type: "array", of: [breadcrumbLink], description: "Optional links displayed before the current page." }),
    defineField({ name: "breadcrumbLabel", title: "Current Breadcrumb Label", type: "string", description: "Defaults to the page title when blank." }),
    ...headerMessageFields(),
    defineField({ name: "introTitle", title: "Intro Title", type: "string" }),
    richTextField({ name: "introMessage", title: "Intro Message" }),
    defineField({ name: "introBackground", title: "Intro Deep Teal Blue Background Color", description: "Enable the teal-blue background for the intro section.", type: "object", fields: [defineField({ name: "enabled", title: "Enable Deep Teal Blue Background", type: "boolean", initialValue: false })] }),
    defineField({ name: "bodyTitle", title: "Body Title", type: "string" }),
    richTextField({ name: "bodyMessage", title: "Body Message" }),
    defineField({ name: "bodyBackground", title: "Body Background Color", description: "Enable the teal-blue background for the body section.", type: "object", fields: [defineField({ name: "enabled", title: "Enable Background Color", type: "boolean", initialValue: false })] }),
    defineField({ name: "seo", title: "SEO Settings", type: "object", fields: [
      defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
      defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
      defineField({ name: "keywords", title: "Keywords", type: "array", of: [defineArrayMember({ type: "string" })] }),
    ] }),
  ],
  preview: { select: { title: "title" } },
});
