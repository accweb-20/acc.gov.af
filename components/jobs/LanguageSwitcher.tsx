'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Languages } from 'lucide-react'
import { locales, type Locale, localeLabel } from '@/lib/i18n/config'

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="flex items-center gap-1 border border-brand-line/15 bg-paper p-1">
      <Languages size={16} className="mx-1.5 text-brand-fg" aria-hidden />
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
            aria-current={isActive ? 'true' : undefined}
            className={`px-3 py-1.5 text-[13px] font-semibold transition-colors ${isActive ? 'bg-brand text-white' : 'text-ink/65 hover:text-brand-fg'}`}
          >
            {localeLabel[locale]}
          </Link>
        )
      })}
    </div>
  )
}
