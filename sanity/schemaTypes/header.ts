// schemaTypes/header.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "header",
  title: "Header",
  type: "document",
  description:
    "Site-wide header / navbar configuration. Add nav items, submenu (sheeter) columns and logo.",
  fields: [
    defineField({
      name: "title",
      title: "Admin title",
      type: "string",
      description: "Internal title for this header doc (not shown publicly).",
      initialValue: "Main Header",
    }),
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
      description: "Alt text for the logo (accessibility).",
    }),
    defineField({
      name: "logoLink",
      title: "Logo link",
      type: "string",
      description: "URL the logo should link to (defaults to /). Use internal link if you prefer references.",
      initialValue: "/",
    }),


    // NAV ITEMS
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
              title: "Order (numeric ID)",
              type: "number",
              description: "Numeric order (used for sorting). Lower numbers come first.",
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: "title",
              title: "Link title",
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
                  name: "externalUrl",
                  title: "External URL",
                  type: "url",
                  description: "Full external URL (https://...).",
                }),
                defineField({
                  name: "openInNewTab",
                  title: "Open in new tab",
                  type: "boolean",
                  initialValue: false,
                }),
              ],
            }),

           

            // has submenu
            defineField({
              name: "showSubmenu",
              title: "Has submenu (sheeter)?",
              type: "boolean",
              initialValue: false,
            }),

            // submenu object: columns -> items
            defineField({
              name: "submenu",
              title: "Submenu (sheeter)",
              type: "object",
              fields: [
                defineField({
                  name: "introText",
                  title: "Intro text / heading",
                  type: "string",
                  description: "Optional header text displayed above the submenu columns.",
                }),
                defineField({
                  name: "columns",
                  title: "Columns",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      name: "submenuColumn",
                      title: "Submenu column",
                      fields: [
                        defineField({
                          name: "title",
                          title: "Column title",
                          type: "string",
                        }),
                        defineField({
                            name: "columnOrder",
                            title: "ColumnOrder (numeric ID)",
                            type: "number",
                            description: "Numeric order (used for sorting). Lower numbers come first.",
                            validation: (Rule) => Rule.required().min(0),
                            }),
                        defineField({
                          name: "items",
                          title: "Column items",
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
                                // submenu item link (same safe reference list)
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
                }),
              ],
              hidden: ({ parent }) => !parent?.showSubmenu,
            }),
          ],
        },
      ],
      options: { sortable: false },
      validation: (Rule) => Rule.required(),
    }),

    // admin notes
    defineField({
      name: "adminNotes",
      title: "Admin notes",
      type: "text",
      description: "Notes for content editors (not shown on the site).",
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "logo",
      topItem: "navItems[0].title",
    },
    prepare(selection) {
      const { title, media, topItem } = selection;
      return {
        title: title || "Site Header",
        subtitle: topItem ? `First nav: ${topItem}` : "No nav items",
        media,
      };
    },
  },
});
