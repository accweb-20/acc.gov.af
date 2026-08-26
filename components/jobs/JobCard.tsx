import Link from 'next/link'
import type { JobCardData } from '@/types/job'
import type { Locale } from '@/lib/i18n/config'
import { localeIntlTag } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { pickLocaleString } from '@/lib/i18n/getLocalized'
import { StatusBadge } from './StatusBadge'

function formatDate(dateStr: string | undefined, locale: Locale) {
  if (!dateStr) return null
  return new Intl.DateTimeFormat(localeIntlTag[locale], { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(dateStr)
  )
}

export function JobCard({ job, locale, dict }: { job: JobCardData; locale: Locale; dict: Dictionary }) {
  const title = pickLocaleString(job.title, locale)
  const location = pickLocaleString(job.location, locale)

  return (
    <Link
      href={`/jobs/${locale}/${job.slug}`}
      className="group flex gap-4 rounded-xl border p-5 transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--jb-border)', backgroundColor: 'var(--jb-surface)' }}
    >
      <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: 'var(--jb-primary)' }} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3
            className="truncate text-base font-bold transition-colors group-hover:underline"
            style={{ color: 'var(--jb-ink)' }}
          >
            {title}
          </h3>
          <StatusBadge status={job.status} closingDate={job.closingDate} dict={dict} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--jb-muted)' }}>
          {location && <span>📍 {location}</span>}
          {job.workType && <span>{dict.options.workType[job.workType]}</span>}
          {job.functionalArea && <span>{dict.options.functionalArea[job.functionalArea]}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--jb-muted)' }}>
          {job.numberOfVacancies && (
            <span>
              {dict.fields.numberOfVacancies}: <strong>{job.numberOfVacancies}</strong>
            </span>
          )}
          {job.closingDate && (
            <span className="jb-mono">
              {dict.fields.closingDate}: {formatDate(job.closingDate, locale)}
            </span>
          )}
          {job.referenceNumber && <span className="jb-mono">Ref: {job.referenceNumber}</span>}
        </div>
      </div>
    </Link>
  )
}
