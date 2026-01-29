// schemaTypes/footer.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  description: "Footer configuration: columns (ordered) and links (ordered).",
  fields: [
    defineField({
      name: "title",
      title: "Admin title",
      type: "string",
      description: "Internal title for this footer doc (not visible on site).",
      initialValue: "Site Footer",
      validation: (Rule) => Rule.required(),
    }),

    // Columns array (ordered)
    defineField({
      name: "columns",
      title: "Columns",
      type: "array",
      description: "Footer columns shown left-to-right. Sort by 'order'.",
      of: [
        {
          type: "object",
          name: "footerColumn",
          title: "Footer column",
          fields: [
            defineField({
              name: "order",
              title: "Order (numeric)",
              type: "number",
              description: "Numeric order used for sorting columns left-to-right. Lower numbers appear first.",
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: "title",
              title: "Column title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "items",
              title: "Items (links)",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "footerItem",
                  title: "Link item",
                  fields: [
                    defineField({
                      name: "order",
                      title: "Order (numeric)",
                      type: "number",
                      description: "Numeric order used for sorting items in this column. Lower numbers appear first.",
                      validation: (Rule) => Rule.required().min(0),
                    }),
                    defineField({
                      name: "label",
                      title: "Label",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "link",
                      title: "Link",
                      type: "object",
                      fields: [
                        defineField({
                          name: "linkType",
                          title: "Link type",
                          type: "string",
                          options: {
                            list: [
                              { title: "Internal (reference)", value: "internal" },
                              { title: "External (URL)", value: "external" },
                            ],
                          },
                          initialValue: "internal",
                        }),
                        
                          defineField({
                            name: "internalRef",
                            title: "Internal reference",
                            type: "reference",
                            to: [
                              { type: "policy" },
                              { type: "annualReport" },
                              { type: "slider" },
                              { type: "header" },
                              { type: "footer" },
                            ],
                            description:
                              "Reference to any document type in the Studio. The frontend can resolve the slug dynamically.",
                          }),
                        defineField({
                          name: "externalUrl",
                          title: "External URL",
                          type: "url",
                        }),
                        defineField({
                          name: "openInNewTab",
                          title: "Open in new tab",
                          type: "boolean",
                          initialValue: false,
                        }),
                      ],
                    }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    // social links (optional)
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          name: "socialLink",
          fields: [
            defineField({ name: "order", title: "Order", type: "number", validation: (Rule) => Rule.required().min(0) }),
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (Rule) => Rule.required() }),
            defineField({ name: "icon", title: "Icon image (optional)", type: "image", options: { hotspot: true } }),
            defineField({ name: "external", title: "Open in new tab", type: "boolean", initialValue: true }),
          ],
        },
      ],
    }),

    // Footer small text
    defineField({
      name: "copyrightText",
      title: "Copyright text",
      type: "string",
      description: "E.g. 'Copyright © 2026 Afghan Cart State-owned Corporation'",
      initialValue: "Copyright © 2026 Afghan Cart State-owned Corporation",
    }),
    
    // admin notes
    defineField({
      name: "adminNotes",
      title: "Admin notes",
      type: "text",
      description: "Notes for editors (not shown on site).",
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "hhtwImage",
    },
    prepare(selection) {
      const { title, media } = selection;
      return {
        title: title || "Footer",
        subtitle: "Footer configuration",
        media,
      };
    },
  },
});
