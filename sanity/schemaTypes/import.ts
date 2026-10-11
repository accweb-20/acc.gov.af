// sanity/schemaTypes/import.ts

import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "import",
  title: "Import",
  type: "document",

  fields: [
    // ---------- PAGE TITLE ----------

    defineField({
      name: "title",
      title: "Import Page Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      description: "Optional supporting text displayed below the page title.",
      type: "string",
    }),

    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),

    // ---------- BREADCRUMB / PAGINATION TRAIL ----------

    defineField({
      name: "breadcrumbLinks",
      title: "Breadcrumb Parent Links",
      description:
        'Add clickable parent pages. For example, a link titled "Home" with the path "/". Links appear before the current page title.',
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          title: "Breadcrumb Link",
          fields: [
            defineField({
              name: "label",
              title: "Link Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "href",
              title: "Page Path",
              type: "string",
              description:
                'The internal page route, such as "/" or "/about".',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (
                    typeof value !== "string" ||
                    !value.startsWith("/") ||
                    value.startsWith("//")
                  ) {
                    return "Enter an internal page path starting with /.";
                  }

                  return true;
                }),
            }),
          ],

          preview: {
            select: {
              title: "label",
              subtitle: "href",
            },
            prepare({ title, subtitle }) {
              return {
                title: title || "Untitled breadcrumb",
                subtitle: subtitle || "No page path configured",
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "breadcrumbLabel",
      title: "Current Breadcrumb Label",
      description:
        'The current page label shown after the parent links. For example, "Contact Us". Defaults to the page title.',
      type: "string",
    }),

    // ---------- SHORT HEADER MESSAGE ----------

    defineField({
      name: "headerMessage",
      title: "Short Header Message",
      description:
        "A short paragraph displayed below the page title in the purple header.",
      type: "text",
      rows: 3,
    }),

    /* ---------- INTRO SECTION ---------- */

    defineField({
      name: "introTitle",
      title: "Intro Title",
      type: "string",
    }),

    defineField({
      name: "introMessage",
      title: "Intro Message",
      description: "Rich text (detailed story style) for the intro message.",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image" }),
      ],
    }),

    // ---------- IMPORT ITEMS ----------

    defineField({
      name: "imports",
      title: "Import Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          title: "Import Item",

          fields: [
            defineField({
              name: "title",
              title: "Import Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Import Description",
              description: "Rich text description for this import item.",
              type: "array",
              of: [
                defineArrayMember({ type: "block" }),
                defineArrayMember({ type: "image" }),
              ],
            }),

            defineField({
              name: "image",
              title: "Import Image",
              type: "image",
              options: { hotspot: true },
            }),

            defineField({
              name: "order",
              title: "Order Number",
              type: "number",
              description:
                "Integer that controls ordering; lower numbers appear first.",
              validation: (Rule) => Rule.integer().min(0),
            }),
          ],

          preview: {
            select: {
              title: "title",
              media: "image",
              order: "order",
            },

            prepare(selection) {
              const { title, media, order } = selection;

              return {
                title: title || "Untitled import",
                subtitle:
                  typeof order === "number"
                    ? `Order: ${order}`
                    : "No order",
                media,
              };
            },
          },
        }),
      ],
    }),

    /* ---------- BODY SECTION ---------- */

    defineField({
      name: "bodyTitle",
      title: "Body Title",
      type: "string",
    }),

    defineField({
      name: "bodyMessage",
      title: "Body Message",
      description: "Rich text (detailed story style) for the body message.",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image" }),
      ],
    }),

    // ---------- BODY BACKGROUND COLOR ----------

    defineField({
      name: "bodyBackground",
      title: "Body Purple Background Color",
      description: "Enable purple background color for the body section.",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "Enable purple background color",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),

    /* ---------- SEO ---------- */

    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      fields: [
        defineField({
          name: "seoTitle",
          title: "SEO Title",
          type: "string",
        }),

        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
        }),

        defineField({
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
      ],
    }),
  ],
});