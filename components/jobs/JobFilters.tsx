'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { FunctionalArea, WorkType } from '@/types/job'

interface JobFiltersProps {
  functionalAreas: FunctionalArea[]
  workTypes: WorkType[]
  dict: Dictionary
}

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
    <div
      className="mb-8 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
      style={{ borderColor: 'var(--jb-border)', backgroundColor: 'var(--jb-surface)' }}
    >
      <input
        type="search"
        placeholder={dict.searchPlaceholder}
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => setParam('search', e.target.value)}
        className="flex-1 rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2"
        style={{ borderColor: 'var(--jb-border)' }}
      />

      <select
        defaultValue={searchParams.get('functionalArea') ?? ''}
        onChange={(e) => setParam('functionalArea', e.target.value)}
        className="rounded-lg border px-4 py-2 text-sm outline-none"
        style={{ borderColor: 'var(--jb-border)' }}
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
        className="rounded-lg border px-4 py-2 text-sm outline-none"
        style={{ borderColor: 'var(--jb-border)' }}
      >
        <option value="">{dict.allWorkTypes}</option>
        {workTypes.map((type) => (
          <option key={type} value={type}>
            {dict.options.workType[type]}
          </option>
        ))}
      </select>

      <label className="flex shrink-0 items-center gap-2 text-sm" style={{ color: 'var(--jb-muted)' }}>
        <input
          type="checkbox"
          defaultChecked={searchParams.get('hideExpired') === '1'}
          onChange={(e) => setParam('hideExpired', e.target.checked ? '1' : '')}
        />
        {dict.hideExpired}
      </label>
    </div>
  )
}
