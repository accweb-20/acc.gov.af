import { defineField, defineType } from 'sanity'

/**
 * A bullet-point list entered separately in English, Pashto and Dari.
 * Used for Key Responsibilities and Qualifications.
 */
export default defineType({
  name: 'localeList',
  title: 'Localized bullet list',
  type: 'object',
  options: { collapsible: false, columns: 1 },
  fields: [
    defineField({ name: 'en', title: 'English', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'ps', title: 'پښتو (Pashto)', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'fa', title: 'دری (Dari)', type: 'array', of: [{ type: 'string' }] }),
  ],
})
