import { defineField, defineType } from 'sanity'

/**
 * A paragraph value entered separately in English, Pashto and Dari.
 * Used for job summary and submission guidelines.
 */
export default defineType({
  name: 'localeText',
  title: 'Localized paragraph',
  type: 'object',
  options: { collapsible: false, columns: 1 },
  fields: [
    defineField({ name: 'en', title: 'English', type: 'text', rows: 4 }),
    defineField({ name: 'ps', title: 'پښتو (Pashto)', type: 'text', rows: 4 }),
    defineField({ name: 'fa', title: 'دری (Dari)', type: 'text', rows: 4 }),
  ],
})
