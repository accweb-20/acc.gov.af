import type { StructureBuilder, StructureResolver } from 'sanity/structure'
import type { Template } from 'sanity'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
//
// Imports / Exports / Sales are grouped in the Studio:
//   Imports → Products by Category → (a category) → its products
//           → Categories, All Products, Imports Page settings
// A product created inside a category already has that category selected.

const SECTIONS = [
  { title: 'Imports', page: 'import', category: 'importCategory', product: 'importProduct' },
  { title: 'Exports', page: 'export', category: 'exportCategory', product: 'exportProduct' },
  { title: 'Sales', page: 'sales', category: 'salesCategory', product: 'salesProduct' },
]

const GROUPED = [...SECTIONS.flatMap((s) => [s.page, s.category, s.product]), 'homeHero', 'aboutUs', 'aboutPage']
const BY_ORDER = [{ field: 'order', direction: 'asc' as const }, { field: 'title', direction: 'asc' as const }]

/** "New product" inside a category: the category is filled in automatically. */
export const productTemplates: Template[] = SECTIONS.map((s) => ({
  id: `${s.product}-in-category`,
  title: `${s.title} product in category`,
  schemaType: s.product,
  parameters: [{ name: 'categoryId', type: 'string' }],
  value: ({ categoryId }: { categoryId: string }) => ({
    category: { _type: 'reference', _ref: categoryId },
  }),
}))

function sectionItem(S: StructureBuilder, s: (typeof SECTIONS)[number]) {
  return S.listItem()
    .title(s.title)
    .id(s.page)
    .child(
      S.list()
        .title(s.title)
        .items([
          S.listItem()
            .title('Products by Category')
            .id(`${s.page}-by-category`)
            .child(
              S.documentTypeList(s.category)
                .title('Categories')
                .defaultOrdering(BY_ORDER)
                .child((categoryId) =>
                  S.documentList()
                    .title('Products')
                    .schemaType(s.product)
                    .filter('_type == $type && category._ref == $categoryId')
                    .params({ type: s.product, categoryId: categoryId.replace(/^drafts\./, '') })
                    .defaultOrdering(BY_ORDER)
                    .initialValueTemplates([
                      S.initialValueTemplateItem(`${s.product}-in-category`, {
                        categoryId: categoryId.replace(/^drafts\./, ''),
                      }),
                    ])
                )
            ),
          S.divider(),
          S.documentTypeListItem(s.category).title('Categories'),
          S.documentTypeListItem(s.product).title('All Products'),
          S.divider(),
          S.documentTypeListItem(s.page).title(`${s.title} Page Settings`),
        ])
    )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // one single "Home Hero" document with all hero designs
      S.listItem()
        .title('Home Hero')
        .id('homeHero')
        .child(S.document().schemaType('homeHero').documentId('homeHero').title('Home Hero')),
      // About Us: the main page (Who We Are) and its sub pages
      S.listItem()
        .title('About Us')
        .id('about')
        .child(
          S.list()
            .title('About Us')
            .items([
              S.documentTypeListItem('aboutUs').title('Who We Are (main page)'),
              S.listItem()
                .title('Sub Pages (Mission, Vision, What We Do, Values)')
                .id('aboutPages')
                .child(S.documentTypeList('aboutPage').title('Sub Pages').defaultOrdering([{ field: 'menuOrder', direction: 'asc' }])),
            ])
        ),
      S.divider(),
      ...SECTIONS.map((s) => sectionItem(S, s)),
      S.divider(),
      // every other document type, as before
      ...S.documentTypeListItems().filter((item) => !GROUPED.includes(item.getId() ?? '')),
    ])
