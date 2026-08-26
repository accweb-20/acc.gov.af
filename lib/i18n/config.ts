export const locales = ['en', 'ps', 'fa'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeDir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ps: 'rtl',
  fa: 'rtl',
}

// Native-name labels shown in the language switcher.
export const localeLabel: Record<Locale, string> = {
  en: 'English',
  ps: 'پښتو',
  fa: 'دری',
}

// Tags passed to Intl.DateTimeFormat / Intl.NumberFormat.
// Note: 'fa-AF' renders dates on the Solar Hijri calendar, which is the
// expected convention for Dari readers even though the date is stored
// as a plain Gregorian ISO date in Sanity.
export const localeIntlTag: Record<Locale, string> = {
  en: 'en-US',
  ps: 'ps-AF',
  fa: 'fa-AF',
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
