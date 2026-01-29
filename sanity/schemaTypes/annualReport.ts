import { defineType, defineField } from "sanity";

export default defineType({
  name: "annualReport",
  title: "Annual Report",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().warning("Add a title for this report."),
    }),
    defineField({
      name: "pdf",
      title: "PDF File",
      type: "file",
      description: "Upload the annual report as a PDF.",
      options: {
        accept: "application/pdf",
      },
      validation: (Rule) => Rule.required().error("Annual Report PDF is required."),
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
