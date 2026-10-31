// schemas/jobsPage.ts

import { defineField, defineType } from 'sanity'
import { richTextField } from './objects/richText'
import { breadcrumbField } from './import'

export default defineType({
  name: 'jobsPage',
  title: 'Job Page',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
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
        slugify: (input) =>
          input
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, ''),
      },
      validation: (Rule) => Rule.required(),
    }),

    richTextField({ name: 'description', title: 'Description', images: false }),

    // Breadcrumbs shown at the top of /jobs and of each job page
    breadcrumbField({
      initial: [{ _key: 'home', label: 'Home', href: '/' }],
      description: 'Links shown before "Jobs" on the jobs page. Default: Home.',
    }),
    defineField({
      name: 'breadcrumbLabel',
      title: 'Current Breadcrumb Label',
      type: 'string',
      description: 'Defaults to the page title.',
    }),
    breadcrumbField({
      name: 'jobBreadcrumbLinks',
      title: 'Breadcrumb Links for Each Job Page',
      initial: [
        { _key: 'home', label: 'Home', href: '/' },
        { _key: 'jobs', label: 'Jobs', href: '/jobs' },
      ],
      description: "Links shown before the job title on every job page. Default: Home / Jobs.",
    }),
  ],

  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title: title || 'Untitled Page',
        subtitle: slug ? `/${slug}` : 'No slug',
      }
    },
  },
})