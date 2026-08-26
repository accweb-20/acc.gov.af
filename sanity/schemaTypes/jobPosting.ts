import { defineField, defineType, type Rule } from 'sanity'

const requireEnglish = (Rule: Rule) =>
  Rule.custom((value: { en?: string } | undefined) => {
    if (!value?.en) return 'English is required (Pashto and Dari are optional but recommended).'
    return true
  })

export default defineType({
  name: 'jobPosting',
  title: 'اعلان بست / Job Posting',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content (EN / PS / FA)', default: true },
    { name: 'details', title: 'Job Details' },
    { name: 'contract', title: 'Contract & Compensation' },
    { name: 'meta', title: 'Dates & Status' },
  ],
  fields: [
    // ───────────────────────── Content (localized) ─────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      group: 'content',
      validation: requireEnglish,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title.en', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'degree',
      title: 'Degree',
      type: 'localeString',
      description: 'e.g. "Bachelor\'s Degree in Computer Science"',
      group: 'content',
    }),
    defineField({
      name: 'jobSummary',
      title: 'Job Summary',
      type: 'localeText',
      group: 'content',
    }),
    defineField({
      name: 'keyResponsibilities',
      title: 'Key Responsibilities',
      type: 'localeList',
      group: 'content',
    }),
    defineField({
      name: 'qualifications',
      title: 'Qualifications',
      type: 'localeList',
      group: 'content',
    }),
    defineField({
      name: 'submissionGuidelines',
      title: 'Submission Guidelines',
      type: 'localeText',
      group: 'content',
    }),

    // ───────────────────────── Job details ─────────────────────────
    defineField({
      name: 'referenceNumber',
      title: 'Reference Number',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'numberOfVacancies',
      title: 'Number of Vacancies',
      type: 'number',
      group: 'details',
      initialValue: 1,
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'gender',
      title: 'Gender',
      type: 'string',
      group: 'details',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Male / نارینه / مرد', value: 'male' },
          { title: 'Female / ښځینه / زن', value: 'female' },
          { title: 'Any / دواړه / هردو', value: 'any' },
        ],
      },
      initialValue: 'any',
    }),
    defineField({
      name: 'announcementType',
      title: 'Announcement Type',
      type: 'string',
      group: 'details',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Internal / داخلي / داخلی', value: 'internal' },
          { title: 'External / بهرنی / خارجی', value: 'external' },
          { title: 'Internal & External / داخلي او بهرنی / داخلی و خارجی', value: 'both' },
        ],
      },
      initialValue: 'external',
    }),
    defineField({
      name: 'workType',
      title: 'Work Type',
      type: 'string',
      group: 'details',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Full-time / بشپړ وخت / وقت کامل', value: 'full_time' },
          { title: 'Part-time / نیم وخت / وقت جزئی', value: 'part_time' },
          { title: 'Contract / قراردادي / قراردادی', value: 'contract' },
          { title: 'Internship / زده‌کړه / کارآموزی', value: 'internship' },
          { title: 'Temporary / مؤقت / موقت', value: 'temporary' },
        ],
      },
      initialValue: 'full_time',
    }),
    defineField({
      name: 'experienceRequired',
      title: 'Experience Required',
      type: 'localeString',
      description: 'e.g. "3 years of relevant experience"',
      group: 'details',
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
        list: [
          { title: 'Dari / دري / دری', value: 'dari' },
          { title: 'Pashto / پښتو / پشتو', value: 'pashto' },
          { title: 'English / انګلیسي / انگلیسی', value: 'english' },
          { title: 'Other / نور / سایر', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'functionalArea',
      title: 'Functional Area',
      type: 'string',
      group: 'details',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Information Technology / معلوماتي ټکنالوژي / تکنالوژی معلوماتی', value: 'it' },
          { title: 'Finance / مالي / مالی', value: 'finance' },
          { title: 'Human Resources / بشري سرچینې / منابع بشری', value: 'hr' },
          { title: 'Health / روغتیا / صحت', value: 'health' },
          { title: 'Education / زده‌کړه / معارف', value: 'education' },
          { title: 'Engineering / انجنیري / انجینری', value: 'engineering' },
          { title: 'Logistics / لوژستیک / لوژستیک', value: 'logistics' },
          { title: 'Administration / اداري / اداری', value: 'admin' },
          { title: 'Media & Communications / رسنۍ او اړیکې / رسانه و ارتباطات', value: 'media' },
          { title: 'Agriculture / کرنه / زراعت', value: 'agriculture' },
          { title: 'Other / نور / سایر', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'nationality',
      title: 'Nationality',
      type: 'localeString',
      group: 'details',
      initialValue: { en: 'Afghan', ps: 'افغان', fa: 'افغان' },
    }),
    defineField({
      name: 'travelRequired',
      title: 'Travel Required',
      type: 'localeString',
      description: 'e.g. "Occasional domestic travel required"',
      group: 'details',
    }),

    // ───────────────────────── Contract & compensation ─────────────────────────
    defineField({
      name: 'salaryRange',
      title: 'Salary Range',
      type: 'localeString',
      group: 'contract',
      initialValue: {
        en: 'Organization Salary Scale',
        ps: 'د ادارې د معاش کچه',
        fa: 'مطابق سکیل معاشاتی اداره',
      },
    }),
    defineField({
      name: 'probationaryPeriod',
      title: 'Probationary Period',
      type: 'localeString',
      group: 'contract',
      initialValue: { en: 'Three Months', ps: 'درې میاشتې', fa: 'سه ماه' },
    }),
    defineField({
      name: 'contractType',
      title: 'Contract Type',
      type: 'localeString',
      group: 'contract',
      initialValue: { en: 'Permanent', ps: 'دايمي', fa: 'دایمی' },
    }),
    defineField({
      name: 'contractDuration',
      title: 'Contract Duration',
      type: 'localeString',
      group: 'contract',
      initialValue: { en: 'Permanent', ps: 'دايمي', fa: 'دایمی' },
    }),
    defineField({
      name: 'contractExtension',
      title: 'Contract Extension',
      type: 'localeString',
      description: 'Whether the contract may be extended',
      group: 'contract',
      initialValue: { en: 'Yes', ps: 'هو', fa: 'بلی' },
    }),

    // ───────────────────────── Dates & status ─────────────────────────
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
      group: 'meta',
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
    defineField({
      name: 'closingDate',
      title: 'Closing Date',
      type: 'date',
      group: 'meta',
      validation: (Rule) =>
        Rule.custom((closingDate, context) => {
          const publishDate = (context.document as { publishDate?: string })?.publishDate
          if (closingDate && publishDate && closingDate < publishDate) {
            return 'Closing date must be after the publish date.'
          }
          return true
        }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'meta',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Draft (not shown on site)', value: 'draft' },
          { title: 'Active', value: 'active' },
          { title: 'Closed (manually closed)', value: 'closed' },
        ],
      },
      initialValue: 'active',
      description:
        'Note: jobs stay visible on the public site past their closing date and are automatically labeled "Expired" — set this to Closed only to pull a job down early, or Draft to hide it entirely.',
    }),
  ],
  orderings: [
    {
      title: 'Publish date, newest',
      name: 'publishDateDesc',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
    {
      title: 'Closing date, soonest',
      name: 'closingDateAsc',
      by: [{ field: 'closingDate', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      location: 'location.en',
      workType: 'workType',
      status: 'status',
      closingDate: 'closingDate',
    },
    prepare({ title, location, workType, status, closingDate }) {
      return {
        title: title || 'Untitled job posting',
        subtitle: [location, workType, status, closingDate ? `closes ${closingDate}` : null]
          .filter(Boolean)
          .join(' — '),
      }
    },
  },
})
