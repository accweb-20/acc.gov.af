'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { locales, type Locale, localeLabel } from '@/lib/i18n/config'

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="flex items-center gap-1 rounded-full border p-1" style={{ borderColor: 'var(--jb-border)' }}>
      {locales.map((locale) => {
        const segments = pathname.split('/').filter(Boolean)
        segments[segments.indexOf(current) >= 0 ? segments.indexOf(current) : 1] = locale
        const newPath = `/${segments.join('/')}`
        const query = searchParams.toString()
        const href = query ? `${newPath}?${query}` : newPath
        const isActive = locale === current

        return (
          <Link
            key={locale}
            href={href}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
            style={
              isActive
                ? { backgroundColor: 'var(--jb-primary)', color: '#fff' }
                : { color: 'var(--jb-muted)' }
            }
          >
            {localeLabel[locale]}
          </Link>
        )
      })}
    </div>
  )
}
