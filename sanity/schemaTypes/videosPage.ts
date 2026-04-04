// sanity/schemaTypes/videosPage.ts
export default {
  name: "videosPage",
  title: "Videos Page",
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
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    },
    {
      name: "mobileHero",
      title: "Mobile Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    },

    // intro
    { name: "introTitle", title: "Intro Title", type: "string" },
    { name: "introMessage", title: "Intro Message", type: "array", of: [{ type: "block" }, { type: "image" }] },
    {
      name: "introBackground",
      title: "Intro Background",
      type: "object",
      fields: [{ name: "enabled", title: "Enabled", type: "boolean", initialValue: false }],
    },

    // videos array (video stored as file asset)
    {
      name: "videos",
      title: "Videos",
      type: "array",
      of: [
        {
          type: "object",
          name: "videoItem",
          title: "Video Item",
          fields: [
            { name: "title", title: "Title", type: "string" },
            {
              name: "video",
              title: "Video File",
              type: "file",
              options: { accept: "video/*" },
            },
            { name: "poster", title: "Poster Image (optional)", type: "image", options: { hotspot: true }, fields: [{ name: "alt", title: "Alt text", type: "string" }] },
            { name: "order", title: "Order", type: "number" },
            { name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 } },
          ],
        },
      ],
    },

    // body
    { name: "bodyTitle", title: "Body Title", type: "string" },
    { name: "bodyMessage", title: "Body Message", type: "array", of: [{ type: "block" }, { type: "image" }] },
    {
      name: "bodyBackground",
      title: "Body Background",
      type: "object",
      fields: [{ name: "enabled", title: "Enabled", type: "boolean", initialValue: false }],
    },

    // SEO
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
      media: "desktopHero",
    },
  },
};