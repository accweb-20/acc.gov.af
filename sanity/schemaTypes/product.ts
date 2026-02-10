import { defineType, defineField } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [

    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    }),

    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "price",
      title: "Price",
      type: "string",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "properties",
      title: "Properties / Description",
      type: "array",
      of: [{ type: "block" }], // Rich text (multi-line, formatted)
    }),

    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "image",
      subtitle: "price",
    },
    prepare(selection) {
      const { title, media, subtitle } = selection;
      return {
        title,
        media,
        subtitle: subtitle ? `$${subtitle}` : "No price",
      };
    },
  },
});
