// schemaTypes/tender.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "tender",
  title: "Tender",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("Tender title is required."),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "refNo",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug is required."),
    }),

    defineField({
      name: "refNo",
      title: "Ref No",
      type: "string",
      validation: (Rule) => Rule.required().error("Reference number is required."),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      validation: (Rule) => Rule.required().error("Category is required."),
    }),

    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "date",
      validation: (Rule) => Rule.required().error("Publish date is required."),
    }),

    defineField({
      name: "expirationDate",
      title: "Expiration Date",
      type: "date",
      validation: (Rule) => Rule.required().error("Expiration date is required."),
    }),

    defineField({
      name: "contactPersonName",
      title: "Contact Person Name",
      type: "string",
    }),

    defineField({
      name: "contactPersonPhone",
      title: "Contact Person Phone",
      type: "string",
    }),

    defineField({
      name: "contactPersonEmail",
      title: "Contact Person Email",
      type: "email",
    }),

    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),

    defineField({
      name: "type",
      title: "Type",
      type: "string",
      description: "For example: Open Tender, RFQ, RFP, Expression of Interest.",
    }),

    defineField({
      name: "attachments",
      title: "Attachments",
      type: "array",
      of: [{ type: "file" }],
      options: {
        layout: "grid",
      },
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
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
      title: "title",
      subtitle: "refNo",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled Tender",
        subtitle: subtitle ? `Ref No: ${subtitle}` : "No reference number",
      };
    },
  },
});