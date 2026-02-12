// schemas/aboutUs.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'aboutUs',
  title: 'About Us Page',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'desktopHeroImage',
      title: 'Desktop Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'mobileHeroImage',
      title: 'Mobile Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'introTitle',
      title: 'Intro Title',
      type: 'string',
    }),

    defineField({
      name: 'introBody',
      title: 'Intro Body',
      type: "array",
      of: [{ type: "block" }], // Rich text (multi-line, formatted)
    }),

    defineField({
      name: 'contentTitle',
      title: 'Content Title',
      type: 'string',
    }),

    defineField({
      name: 'contentBody',
      title: 'Content Body',
      type: "array",
      of: [{ type: "block" }], // Rich text (multi-line, formatted)
    }),

    // ✅ Multiple topics support
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      of: [
        defineField({
          name: 'topic',
          title: 'Topic',
          type: 'object',
          fields: [
            defineField({
              name: 'topicTitle',
              title: 'Topic Title',
              type: 'string',
            }),
            defineField({
              name: 'topicBody',
              title: 'Topic Body',
              type: "array",
      of: [{ type: "block" }], // Rich text (multi-line, formatted)
            }),
          ],
          preview: {
            select: {
              title: 'topicTitle',
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'endTitle',
      title: 'End Title',
      type: 'string',
    }),

    defineField({
      name: 'endBody',
      title: 'End Body',
      type: "array",
      of: [{ type: "block" }], // Rich text (multi-line, formatted)
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'seoTitle',
          title: 'SEO Title',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'desktopHeroImage',
    },
  },
})
