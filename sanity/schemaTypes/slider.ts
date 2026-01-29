// src/sanity/schemaTypes/slider.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'slider',
  title: 'Slider Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title / alt text for the slide',
    }),
    defineField({
      name: 'desktopImage',
      title: 'Desktop Image',
      type: 'image',
      options: { hotspot: true },
      description: 'High-resolution image for desktop',
    }),
    defineField({
      name: 'mobileImage',
      title: 'Mobile Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional image for mobile. If omitted, desktop image will be used.',
    }),
    defineField({
      name: 'link_url',
      title: 'Link URL',
      type: 'url',
      description: 'Optional "Read more" link for the slide',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls ordering; lower numbers appear first',
      initialValue: 0,
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Only active slides will be returned by the public query',
    }),
  ],
});
