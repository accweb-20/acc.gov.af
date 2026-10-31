'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { FunctionalArea, WorkType } from '@/types/job'

interface JobFiltersProps {
  functionalAreas: FunctionalArea[]
  workTypes: WorkType[]
  dict: Dictionary
}

const FIELD = 'h-12 w-full border border-brand-line/15 bg-paper px-3 text-[15px] text-ink outline-none transition focus:border-brand-line'

export function JobFilters({ functionalAreas, workTypes, dict }: JobFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="mb-8 grid gap-3 border-t-4 border-brand-line bg-paper p-4 shadow-[0_10px_30px_rgba(2,88,123,0.07)] md:grid-cols-2 md:p-5 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto] lg:items-center">
      <label className={`${FIELD} flex items-center gap-2 focus-within:border-brand-line md:col-span-2 lg:col-span-1`}>
        <Search size={18} className="shrink-0 text-brand-fg" />
        <input
          type="search"
          placeholder={dict.searchPlaceholder}
          aria-label={dict.searchPlaceholder}
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => setParam('search', e.target.value)}
          className="h-full w-full bg-transparent outline-none"
        />
      </label>

      <select
        defaultValue={searchParams.get('functionalArea') ?? ''}
        onChange={(e) => setParam('functionalArea', e.target.value)}
        aria-label={dict.fields.functionalArea}
        className={FIELD}
      >
        <option value="">{dict.allFunctionalAreas}</option>
        {functionalAreas.map((area) => (
          <option key={area} value={area}>
            {dict.options.functionalArea[area]}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('workType') ?? ''}
        onChange={(e) => setParam('workType', e.target.value)}
        aria-label={dict.fields.workType}
        className={FIELD}
      >
        <option value="">{dict.allWorkTypes}</option>
        {workTypes.map((type) => (
          <option key={type} value={type}>
            {dict.options.workType[type]}
          </option>
        ))}
      </select>

      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[14px] font-medium text-ink/70 md:col-span-2 lg:col-span-1">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#02587B]"
          defaultChecked={searchParams.get('hideExpired') === '1'}
          onChange={(e) => setParam('hideExpired', e.target.checked ? '1' : '')}
        />
        {dict.hideExpired}
      </label>
    </div>
  )
}
