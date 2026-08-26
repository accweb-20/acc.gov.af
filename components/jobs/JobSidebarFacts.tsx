import type { JobPosting } from '@/types/job'
import type { Locale } from '@/lib/i18n/config'
import { localeIntlTag } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { pickLocaleString } from '@/lib/i18n/getLocalized'

function formatDate(dateStr: string | undefined, locale: Locale) {
  if (!dateStr) return undefined
  return new Intl.DateTimeFormat(localeIntlTag[locale], { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(dateStr)
  )
}

export function JobSidebarFacts({ job, locale, dict }: { job: JobPosting; locale: Locale; dict: Dictionary }) {
  const rows: { label: string; value?: string }[] = [
    { label: dict.fields.location, value: pickLocaleString(job.location, locale) },
    { label: dict.fields.numberOfVacancies, value: job.numberOfVacancies?.toString() },
    { label: dict.fields.gender, value: job.gender ? dict.options.gender[job.gender] : undefined },
    { label: dict.fields.degree, value: pickLocaleString(job.degree, locale) },
    {
      label: dict.fields.announcementType,
      value: job.announcementType ? dict.options.announcementType[job.announcementType] : undefined,
    },
    { label: dict.fields.workType, value: job.workType ? dict.options.workType[job.workType] : undefined },
    {
      label: dict.fields.functionalArea,
      value: job.functionalArea ? dict.options.functionalArea[job.functionalArea] : undefined,
    },
    { label: dict.fields.experienceRequired, value: pickLocaleString(job.experienceRequired, locale) },
    { label: dict.fields.salaryRange, value: pickLocaleString(job.salaryRange, locale) },
    { label: dict.fields.probationaryPeriod, value: pickLocaleString(job.probationaryPeriod, locale) },
    { label: dict.fields.contractType, value: pickLocaleString(job.contractType, locale) },
    { label: dict.fields.contractDuration, value: pickLocaleString(job.contractDuration, locale) },
    { label: dict.fields.contractExtension, value: pickLocaleString(job.contractExtension, locale) },
    {
      label: dict.fields.languages,
      value: job.languages?.map((l) => dict.options.languages[l]).join(', '),
    },
    { label: dict.fields.nationality, value: pickLocaleString(job.nationality, locale) },
    { label: dict.fields.travelRequired, value: pickLocaleString(job.travelRequired, locale) },
    { label: dict.fields.referenceNumber, value: job.referenceNumber },
    { label: dict.fields.publishDate, value: formatDate(job.publishDate, locale) },
    { label: dict.fields.closingDate, value: formatDate(job.closingDate, locale) },
  ].filter((row) => row.value)

  return (
    <aside
      className="h-fit rounded-xl border p-5 lg:sticky lg:top-6"
      style={{ borderColor: 'var(--jb-border)', backgroundColor: 'var(--jb-surface)' }}
    >
      <h2
        className="mb-4 border-b pb-3 text-sm font-bold uppercase tracking-wide"
        style={{ borderColor: 'var(--jb-border)', color: 'var(--jb-primary)' }}
      >
        {dict.jobOverview}
      </h2>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-sm">
            <dt style={{ color: 'var(--jb-muted)' }}>{row.label}</dt>
            <dd className="text-right font-medium" style={{ color: 'var(--jb-ink)' }}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
