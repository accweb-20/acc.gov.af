// sanity/schemaTypes/objects/richText.tsx
// Shared rich-text definition for descriptive fields:
// bold, italic, underline, strike-through, highlight (yellow marker),
// text color (brand colors) and links (internal paths or external URLs).

import type { ReactNode } from "react";
import { defineArrayMember, defineField } from "sanity";
import { LinkIcon } from "@sanity/icons";

export const TEXT_COLORS = [
  { title: "Primary blue", value: "primary", hex: "#02587B" },
  { title: "Yellow", value: "secondary", hex: "#C99A00" },
  { title: "Red", value: "red", hex: "#B60000" },
  { title: "Black", value: "black", hex: "#1A1A1A" },
  { title: "Gray", value: "gray", hex: "#6B6B6B" },
];

const HighlightIcon = () => (
  <span style={{ fontWeight: 700, background: "#FFE58A", padding: "0 3px" }}>H</span>
);
const ColorIcon = () => <span style={{ fontWeight: 700, color: "#02587B" }}>A</span>;

const marks = {
  decorators: [
    { title: "Bold", value: "strong" },
    { title: "Italic", value: "em" },
    { title: "Underline", value: "underline" },
    { title: "Strike", value: "strike-through" },
    {
      title: "Highlight",
      value: "highlight",
      icon: HighlightIcon,
      component: (props: { children?: ReactNode }) => (
        <span style={{ background: "#FFF1B8", padding: "0 2px" }}>{props.children}</span>
      ),
    },
  ],
  annotations: [
    {
      name: "link",
      type: "object",
      title: "Link",
      icon: LinkIcon,
      fields: [
        defineField({
          name: "href",
          title: "Link to",
          type: "string",
          description:
            'Internal page path such as "/services/imports/insulators", "#inquiry" for the inquiry form on product pages, or a full URL such as "https://example.com".',
          validation: (Rule) =>
            Rule.required().custom((v) =>
              typeof v === "string" && (/^\/(?!\/)/.test(v) || /^#\w/.test(v) || /^(https?:|mailto:|tel:)/.test(v))
                ? true
                : 'Start with "/" for a page on this website, "#" for a section of the same page (e.g. #inquiry), or with https://, mailto: or tel:'
            ),
        }),
        defineField({ name: "blank", title: "Open in new tab", type: "boolean", initialValue: false }),
      ],
    },
    {
      name: "textColor",
      type: "object",
      title: "Text color",
      icon: ColorIcon,
      fields: [
        defineField({
          name: "color",
          title: "Color",
          type: "string",
          options: { list: TEXT_COLORS.map(({ title, value }) => ({ title, value })), layout: "radio" },
          initialValue: "primary",
          validation: (Rule) => Rule.required(),
        }),
      ],
      components: {
        annotation: (props: { value?: { color?: string }; renderDefault: (p: unknown) => ReactNode }) => (
          <span style={{ color: TEXT_COLORS.find((c) => c.value === props.value?.color)?.hex }}>
            {props.renderDefault(props)}
          </span>
        ),
      },
    },
  ],
};

/** Full rich text: paragraphs, headings, quotes, lists, all marks. */
export const richTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "Heading", value: "h3" },
    { title: "Sub-heading", value: "h4" },
    { title: "Quote", value: "blockquote" },
  ],
  lists: [
    { title: "Bullet", value: "bullet" },
    { title: "Numbered", value: "number" },
  ],
  marks: marks as never,
});

/** Short rich text: paragraphs only, all marks (bold, italic, highlight, color, link). */
export const shortRichTextBlock = defineArrayMember({
  type: "block",
  styles: [{ title: "Normal", value: "normal" }],
  lists: [],
  marks: marks as never,
});

type Block = { _type?: string; children?: { text?: string }[] };
export const plainLength = (value: unknown) =>
  Array.isArray(value)
    ? (value as Block[]).reduce((n, b) => n + (b.children ?? []).reduce((m, c) => m + (c.text?.length ?? 0), 0), 0)
    : 0;

/** Rich text field with headings/lists/images. */
export function richTextField(opts: { name: string; title: string; description?: string; group?: string; images?: boolean }) {
  return defineField({
    name: opts.name,
    title: opts.title,
    description: opts.description,
    group: opts.group,
    type: "array",
    of: opts.images === false ? [richTextBlock] : [richTextBlock, defineArrayMember({ type: "image", options: { hotspot: true } })],
  });
}

/** Short rich text field (one or a few paragraphs) with an optional character limit. */
export function shortRichTextField(opts: { name: string; title: string; description?: string; group?: string; max?: number }) {
  return defineField({
    name: opts.name,
    title: opts.title,
    description: opts.description,
    group: opts.group,
    type: "array",
    of: [shortRichTextBlock],
    validation: (Rule) =>
      Rule.custom((value) =>
        opts.max && plainLength(value) > opts.max ? `Keep this under ${opts.max} characters (now ${plainLength(value)}).` : true
      ),
  });
}

/**
 * Old plain-text field, kept hidden so content saved before the switch to
 * rich text is never lost. The website shows it only when the new field is empty.
 */
export function legacyTextField(name: string, title: string, group?: string) {
  return defineField({
    name,
    title: `${title} (old plain text)`,
    type: "text",
    group,
    readOnly: true,
    hidden: true,
  });
}

/** Rich "Header Message" shown under the page title (replaces the old plain-text headerMessage). */
export function headerMessageFields(group?: string) {
  return [
    shortRichTextField({
      name: "headerDescription",
      title: "Header Message",
      description: "Short message displayed below the page title. Bold, highlight, color and links are supported.",
      group,
      max: 400,
    }),
    legacyTextField("headerMessage", "Header Message", group),
  ];
}
