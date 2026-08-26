import { defineField, defineType } from 'sanity'

/**
 * A short text value entered separately in English, Pashto and Dari.
 * Used for titles, locations, and other single-line fields that need
 * to appear in all three languages of the site.
 */
export default defineType({
  name: 'localeString',
  title: 'Localized text',
  type: 'object',
  options: { collapsible: false, columns: 1 },
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string' }),
    defineField({ name: 'ps', title: 'پښتو (Pashto)', type: 'string' }),
    defineField({ name: 'fa', title: 'دری (Dari)', type: 'string' }),
  ],
  preview: {
    select: { title: 'en', subtitle: 'fa' },
  },
})
