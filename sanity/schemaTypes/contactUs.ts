// schemaTypes/contactUs.ts
import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'contactUs',
  title: 'Contact Us',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Contact Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),

    /* ---------- INTRO SECTION ---------- */

    defineField({
      name: 'introTitle',
      title: 'Intro Title',
      type: 'string',
    }),

    defineField({
      name: 'introMessage',
      title: 'Intro Message',
      description: 'Rich text (detailed story style) for the intro message.',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({ type: 'image' }),
      ],
    }),

    // ✅ Intro background color checkbox
    defineField({
      name: 'introBackground',
      title: 'Intro Deep Teal Blue Background Color',
      description: 'Enable Deep Teal Blue background color for intro section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Deep Teal Blue background color',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),

    /* ---------- BODY SECTION ---------- */

    defineField({
      name: 'bodyTitle',
      title: 'Body Title',
      type: 'string',
    }),

    defineField({
      name: 'bodyMessage',
      title: 'Body Message',
      description: 'Rich text (detailed story style) for the body message.',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({ type: 'image' }),
      ],
    }),

    // ✅ Body background color checkbox
    defineField({
      name: 'bodyBackground',
      title: 'Body Purple Background Color',
      description: 'Enable Purple background color for body section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable purple background color',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),

    /* ---------- SEO ---------- */

    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text' }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
        }),
      ],
    }),
  ],
});
