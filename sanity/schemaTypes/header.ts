// schemaTypes/header.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "header",
  title: "Header",
  type: "document",
  description:
    "Site-wide header / navbar configuration. Add nav items, optional submenu, and logo.",
  fields: [
    defineField({
      name: "title",
      title: "Admin title",
      type: "string",
      initialValue: "Main Header",
    }),

    /* ---------------- Logo ---------------- */

    defineField({
      name: "logo",
      title: "Logo image",
      type: "image",
      options: { hotspot: true },
    }),

    defineField({
      name: "logoAlt",
      title: "Logo alt text",
      type: "string",
    }),

    defineField({
      name: "logoLink",
      title: "Logo link",
      type: "string",
      description: "URL the logo should link to (defaults to /). Use internal link if you prefer references.",
      initialValue: "/",
    }),

    /* ---------------- Nav Items ---------------- */

    defineField({
      name: "navItems",
      title: "Navigation items",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          title: "Nav item",
          fields: [
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),

            defineField({
              name: "title",
              title: "Link title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            /* -------- Nav Link -------- */

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
                    { type: "aboutUs" },
                  ],
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

            /* -------- Submenu Toggle -------- */

            defineField({
              name: "showSubmenu",
              title: "Has submenu?",
              type: "boolean",
              initialValue: false,
            }),

            /* -------- Submenu (NO COLUMNS) -------- */

            defineField({
              name: "submenu",
              title: "Submenu",
              type: "object",
              fields: [
                defineField({
                  name: "introText",
                  title: "Intro text",
                  type: "string",
                }),

                defineField({
                  name: "items",
                  title: "Submenu items",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      name: "submenuItem",
                      title: "Submenu item",
                      fields: [
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
                              { type: "aboutUs" },
                              ],
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
              hidden: ({ parent }) => !parent?.showSubmenu,
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    /* ---------------- Admin Notes ---------------- */

    defineField({
      name: "adminNotes",
      title: "Admin notes",
      type: "text",
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "logo",
      topItem: "navItems[0].title",
    },
    prepare({ title, media, topItem }) {
      return {
        title: title || "Site Header",
        subtitle: topItem ? `First nav: ${topItem}` : "No nav items",
        media,
      };
    },
  },
});
