import { defineType, defineField, defineArrayMember } from "sanity";

const breadcrumbLink = defineArrayMember({
  name: "breadcrumbLink",
  title: "Breadcrumb Link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "href",
      title: "Internal Path",
      type: "string",
      description: "Use an internal path, for example / or /about-us.",
      validation: (Rule) => Rule.required().custom((value) =>
        typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
          ? true
          : "Enter an internal path beginning with / (not //).",
      ),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export default defineType({
  name: "aboutUs",
  title: "About Us Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "subtitle", title: "Subtitle (fallback header message)", type: "string" }),
    defineField({ name: "breadcrumbLinks", title: "Breadcrumb Links", type: "array", of: [breadcrumbLink], description: "Optional links shown before the current page in the breadcrumb trail." }),
    defineField({ name: "breadcrumbLabel", title: "Current Breadcrumb Label", type: "string", description: "Optional label for this page in the breadcrumb trail. Defaults to the page title." }),
    defineField({ name: "headerMessage", title: "Header Supporting Message", type: "text", rows: 3, description: "Short message displayed below the page title." }),
    defineField({ name: "introTitle", title: "Intro Title", type: "string" }),
    defineField({ name: "introBody", title: "Intro Body", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "contentTitle", title: "Content Title", type: "string" }),
    defineField({ name: "contentBody", title: "Content Body", type: "array", of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "image" })] }),
    defineField({
      name: "topics", title: "Topics", type: "array",
      of: [defineArrayMember({
        name: "topic", title: "Topic", type: "object",
        fields: [
          defineField({ name: "topicTitle", title: "Topic Title", type: "string" }),
          defineField({ name: "topicBody", title: "Topic Body", type: "array", of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "image" })] }),
        ],
        preview: { select: { title: "topicTitle" } },
      })],
    }),
    defineField({ name: "endTitle", title: "End Title", type: "string" }),
    defineField({ name: "endBody", title: "End Body", type: "array", of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "image" })] }),
    defineField({
      name: "seo", title: "SEO", type: "object",
      fields: [
        defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
        defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
        defineField({ name: "keywords", title: "Keywords", type: "array", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
      ],
    }),
  ],
  preview: { select: { title: "title" } },
});
