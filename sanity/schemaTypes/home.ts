// schemaTypes/home.ts
import { defineType, defineField, defineArrayMember } from 'sanity';
import { richTextField, shortRichTextField } from './objects/richText';

export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Home Page Title',
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
      options: { source: 'title' },
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

    richTextField({
      name: 'introMessage',
      title: 'Intro Message (CEO message text)',
      description: 'The message itself. Put the name and position in the fields below, not here.',
    }),

    /* ---------- CEO SIGNATURE (shown under the intro message) ---------- */

    defineField({ name: 'ceoName', title: 'CEO Name', type: 'string', description: 'Example: Lutfullah Rahmaty' }),
    defineField({ name: 'ceoPosition', title: 'CEO Position', type: 'string', initialValue: 'Chief Executive Officer' }),
    defineField({ name: 'ceoOrganization', title: 'Organization', type: 'string', initialValue: 'Afghan Cart Corporation (ACC)' }),
    defineField({
      name: 'ceoPhoto',
      title: 'CEO Photo (optional)',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string' })],
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

    /* ---------- IMPORTS SECTION ---------- */
    // Only the heading text lives here. Categories and products come from the
    // "Import Category" / "Import Product" documents automatically.

    defineField({
      name: 'importsTitle',
      title: 'Imports Section Title',
      description: 'Heading of the imports section on the home page. Example: "What We Import".',
      type: 'string',
    }),

    shortRichTextField({
      name: 'importsDescription',
      title: 'Imports Section Description',
      description: 'Short paragraph under the imports heading. Bold, highlight, color and links are supported.',
      max: 500,
    }),

    /* ---------- EXPORTS & SALES SECTIONS ---------- */
    // Same as imports: only the heading text lives here, the categories come from Sanity automatically.

    defineField({
      name: 'exportsTitle',
      title: 'Exports Section Title',
      description: 'Heading of the exports section on the home page. Example: "What We Export".',
      type: 'string',
    }),

    shortRichTextField({
      name: 'exportsDescription',
      title: 'Exports Section Description',
      description: 'Short paragraph under the exports heading.',
      max: 500,
    }),

    defineField({
      name: 'salesTitle',
      title: 'Sales Section Title',
      description: 'Heading of the sales section on the home page. Example: "What We Sell".',
      type: 'string',
    }),

    shortRichTextField({
      name: 'salesDescription',
      title: 'Sales Section Description',
      description: 'Short paragraph under the sales heading.',
      max: 500,
    }),

    /* ---------- BODY SECTION ---------- */

    defineField({
      name: 'bodyTitle',
      title: 'Body Title',
      type: 'string',
    }),

    richTextField({ name: 'bodyMessage', title: 'Body Message' }),

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
