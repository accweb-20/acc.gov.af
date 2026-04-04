// schemaTypes/contactUs.ts
import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "contactUs",
  title: "Contact Us",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Contact Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),

    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    // ---------------- NEW: Desktop hero image (with alt text) ----------------
    defineField({
      name: "desktopHero",
      title: "Desktop Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "High-resolution hero image used on desktop / large viewports.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text (alt)",
          type: "string",
          description: "Short, descriptive alt text for accessibility. Important for SEO and screen readers.",
          // optional: uncomment to require editors to provide alt text
          // validation: (Rule) => Rule.required().error("Provide alt text for accessibility"),
        }),
      ],
    }),

    // ---------------- NEW: Mobile hero image (with alt text) ----------------
    defineField({
      name: "mobileHero",
      title: "Mobile Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "Portrait/optimized hero image for mobile devices.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text (alt)",
          type: "string",
          description: "Alt text for the mobile hero image (can be same or slightly different if context differs).",
          // optional: uncomment to require editors to provide alt text
          // validation: (Rule) => Rule.required().error("Provide alt text for accessibility"),
        }),
      ],
    }),

    // (Optional) Legacy single hero (kept as fallback) — uncomment if you still want it
    // defineField({
    //   name: 'heroImage',
    //   title: 'Legacy Hero Image (fallback)',
    //   type: 'image',
    //   options: { hotspot: true },
    //   fields: [
    //     defineField({ name: 'alt', title: 'Alternative text (alt)', type: 'string' }),
    //   ],
    // }),

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
      of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "image" })],
    }),

    // ✅ Intro background color checkbox
    defineField({
      name: "introBackground",
      title: "Intro Deep Teal Blue Background Color",
      description: "Enable Deep Teal Blue background color for intro section",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "Enable Deep Teal Blue background color",
          type: "boolean",
          initialValue: false,
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
      of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "image" })],
    }),

    // ✅ Body background color checkbox
    defineField({
      name: "bodyBackground",
      title: "Body Purple Background Color",
      description: "Enable Purple background color for body section",
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
        defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
        defineField({ name: "metaDescription", title: "Meta Description", type: "text" }),
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