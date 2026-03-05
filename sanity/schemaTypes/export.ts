// sanity/schemaTypes/export.ts
export default {
  name: "export",
  title: "Export Page",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "subtitle", title: "Subtitle", type: "string" },

    // hero images
    {
      name: "desktopHero",
      title: "Desktop Hero Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "mobileHero",
      title: "Mobile Hero Image",
      type: "image",
      options: { hotspot: true },
    },
    // intro block
    { name: "introTitle", title: "Intro Title", type: "string" },
    { name: "introMessage", title: "Intro Message", type: "array", of: [{ type: "block" }, { type: "image" }] },
    {
      name: "introBackground",
      title: "Intro Background",
      type: "object",
      fields: [{ name: "enabled", title: "Enabled", type: "boolean", initialValue: false }],
    },

    // exports grid
    {
      name: "exports",
      title: "Export Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "exportItem",
          title: "Export Item",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "array", of: [{ type: "block" }, { type: "image" }] },
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "order", title: "Order", type: "number" },
          ],
        },
      ],
    },

    // body block
    { name: "bodyTitle", title: "Body Title", type: "string" },
    { name: "bodyMessage", title: "Body Message", type: "array", of: [{ type: "block" }, { type: "image" }] },
    {
      name: "bodyBackground",
      title: "Body Background",
      type: "object",
      fields: [{ name: "enabled", title: "Enabled", type: "boolean", initialValue: false }],
    },

    // seo
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "seoTitle", title: "SEO Title", type: "string" },
        { name: "metaDescription", title: "Meta Description", type: "text" },
        { name: "keywords", title: "Keywords", type: "array", of: [{ type: "string" }] },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "desktopHero",
    },
  },
};