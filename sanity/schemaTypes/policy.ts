import { defineType, defineField } from "sanity";

export default defineType({
  name: "policy",
  title: "Policy",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().warning("Add a title for this policy."),
    }),
    defineField({
      name: "pdf",
      title: "PDF File",
      type: "file",
      description: "Upload the policy as a PDF.",
      options: {
        accept: "application/pdf",
      },
      validation: (Rule) => Rule.required().error("Policy PDF is required."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      file: "pdf.asset.originalFilename",
    },
    prepare({ title, file }) {
      return {
        title: title || "Untitled",
        subtitle: file ? `File: ${file}` : "",
      };
    },
  },
});
