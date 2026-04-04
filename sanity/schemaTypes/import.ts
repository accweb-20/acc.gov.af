import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'import',
  title: 'Import',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Import Page Title',
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

    // --- separate hero images for desktop and mobile ---
    defineField({
      name: 'desktopHero',
      title: 'Desktop Hero Image',
      type: 'image',
      description: 'Hero image used on large screens (desktop/tablet landscape).',
      options: { hotspot: true },
    }),

    defineField({
      name: 'mobileHero',
      title: 'Mobile Hero Image',
      type: 'image',
      description: 'Hero image used on small screens (phones / narrow viewports).',
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

    // ---------- IMPORTS: added after intro ----------
    defineField({
      name: 'imports',
      title: 'Import Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          title: 'Import Item',
          fields: [
            defineField({
              name: 'title',
              title: 'Import Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Import Description',
              description: 'Rich text description for this import item.',
              type: 'array',
              of: [
                defineArrayMember({ type: 'block' }),
                defineArrayMember({ type: 'image' }),
              ],
            }),
            defineField({
              name: 'image',
              title: 'Import Image',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'order',
              title: 'Order Number',
              type: 'number',
              description: 'Integer that controls ordering; lower numbers appear first.',
              validation: (Rule) => Rule.integer().min(0),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
              order: 'order',
            },
            prepare(selection) {
              const { title, media, order } = selection;
              return {
                title: title || 'Untitled import',
                subtitle: typeof order === 'number' ? `Order: ${order}` : 'No order',
                media,
              };
            },
          },
        }),
      ],
    }),
    // ---------- end imports ----------

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