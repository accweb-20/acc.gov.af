import type { Locale } from './config'

type LocaleString = Partial<Record<Locale, string>> | undefined
type LocaleList = Partial<Record<Locale, string[]>> | undefined

/** Pick a localized string, falling back to English, then any set value. */
export function pickLocaleString(value: LocaleString, locale: Locale): string | undefined {
  if (!value) return undefined
  return value[locale] || value.en || value.ps || value.fa || undefined
}

/** Pick a localized bullet list, falling back to English, then any set value. */
export function pickLocaleList(value: LocaleList, locale: Locale): string[] {
  if (!value) return []
  const list = value[locale] ?? value.en ?? value.ps ?? value.fa
  return list && list.length > 0 ? list : []
}
