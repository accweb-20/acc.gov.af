import { defineType, defineField, defineArrayMember } from "sanity";
import { headerMessageFields, richTextField } from "./objects/richText";


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

const seoField = defineField({
  name: "seo", title: "SEO", type: "object",
  fields: [
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
    defineField({ name: "keywords", title: "Keywords", type: "array", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
  ],
});

/** Icons an About item can show (names of lucide-react icons used on the website). */
export const ABOUT_ICONS = [
  "target", "eye", "briefcase", "shield", "star", "users", "globe", "truck",
  "handshake", "award", "check", "lightbulb", "package", "scale", "trending",
];

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
    ...headerMessageFields(),
    defineField({ name: "introTitle", title: "Intro Title", type: "string" }),
    richTextField({ name: "introBody", title: "Intro Body", images: false }),
    defineField({ name: "image", title: "Photo (optional)", type: "image", options: { hotspot: true }, description: "Shown next to the Who We Are text." }),
    defineField({ name: "contentTitle", title: "Content Title", type: "string" }),
    richTextField({ name: "contentBody", title: "Content Body" }),
    defineField({
      name: "topics", title: "Topics", type: "array",
      of: [defineArrayMember({
        name: "topic", title: "Topic", type: "object",
        fields: [
          defineField({ name: "topicTitle", title: "Topic Title", type: "string" }),
          richTextField({ name: "topicBody", title: "Topic Body" }),
        ],
        preview: { select: { title: "topicTitle" } },
      })],
    }),
    defineField({ name: "endTitle", title: "End Title", type: "string" }),
    richTextField({ name: "endBody", title: "End Body" }),
    seoField,
  ],
  preview: { select: { title: "title" } },
});

/**
 * About Us sub pages: Our Mission, Our Vision, What We Do, Our Values.
 * One document per page; the address is /about-us/<slug>.
 */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Us Sub Page",
  type: "document",
  groups: [
    { name: "header", title: "Header", default: true },
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "header", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug", title: "Slug", type: "slug", group: "header",
      description: "The page address is /about-us/<slug>, for example mission.",
      options: { source: "title", maxLength: 60 }, validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "menuOrder", title: "Order in the About Us menu", type: "number", group: "header" }),
    defineField({ name: "subtitle", title: "Subtitle (fallback header message)", type: "string", group: "header" }),
    defineField({ name: "breadcrumbLinks", title: "Breadcrumb Links", type: "array", of: [breadcrumbLink], group: "header" }),
    defineField({ name: "breadcrumbLabel", title: "Current Breadcrumb Label", type: "string", group: "header" }),
    ...headerMessageFields("header"),

    defineField({ name: "eyebrow", title: "Small label above the intro title", type: "string", group: "content" }),
    defineField({ name: "introTitle", title: "Intro Title", type: "string", group: "content" }),
    richTextField({ name: "introBody", title: "Intro Text", group: "content", images: false }),
    defineField({ name: "statement", title: "Highlighted statement", type: "text", rows: 3, group: "content", description: "One short sentence shown large, e.g. the mission statement." }),
    defineField({ name: "image", title: "Photo (optional)", type: "image", options: { hotspot: true }, group: "content" }),
    defineField({
      name: "facts", title: "Key facts (optional)", type: "array", group: "content",
      description: "Short numbers shown in a row, e.g. 3–7 / Board members.",
      of: [defineArrayMember({
        name: "fact", title: "Fact", type: "object",
        fields: [
          defineField({ name: "value", title: "Number or short value", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
        ],
        preview: { select: { title: "value", subtitle: "label" } },
      })],
    }),
    defineField({ name: "itemsTitle", title: "Cards Title", type: "string", group: "content" }),
    defineField({ name: "itemsIntro", title: "Cards Intro", type: "text", rows: 2, group: "content" }),
    defineField({
      name: "items", title: "Cards", type: "array", group: "content",
      of: [defineArrayMember({
        name: "aboutItem", title: "Card", type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ABOUT_ICONS } }),
        ],
        preview: { select: { title: "title", subtitle: "text" } },
      })],
    }),
    defineField({ name: "closingTitle", title: "Closing Title", type: "string", group: "content" }),
    defineField({
      name: "showPolicyFiles", title: "Show policy documents (PDF)", type: "boolean", group: "content", initialValue: false,
      description: "Shows the downloadable \"Policy\" documents on this page.",
    }),
    richTextField({ name: "closingBody", title: "Closing Text", group: "content", images: false }),
    { ...seoField, group: "seo" },
  ],
  orderings: [{ title: "Menu order", name: "menuOrder", by: [{ field: "menuOrder", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "slug.current" }, prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? `/about-us/${subtitle}` : "" }) },
});
