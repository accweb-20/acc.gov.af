import Link from 'next/link'
import { ArrowRight, Briefcase, Layers, MapPin, Users } from 'lucide-react'
import type { JobCardData } from '@/types/job'
import type { Locale } from '@/lib/i18n/config'
import { localeIntlTag } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { pickLocaleString } from '@/lib/i18n/getLocalized'
import { StatusBadge, getComputedStatus } from './StatusBadge'

const fmt = (d: string, locale: Locale, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(localeIntlTag[locale], o).format(new Date(d))

/** One job in the list: closing date on the side, title and facts in the middle. */
export function JobCard({ job, locale, dict }: { job: JobCardData; locale: Locale; dict: Dictionary }) {
  const title = pickLocaleString(job.title, locale)
  const location = pickLocaleString(job.location, locale)
  const open = getComputedStatus(job.status, job.closingDate) === 'open'

  return (
    <Link
      href={`/jobs/${locale}/${job.slug}`}
      className="group grid border border-brand-line/10 bg-paper transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(2,88,123,0.14)] md:grid-cols-[130px_minmax(0,1fr)_170px]"
    >
      {/* Closing date */}
      <div className={`flex items-center gap-3 px-5 py-4 md:flex-col md:justify-center md:gap-0 md:py-6 ${open ? 'bg-brand text-white' : 'bg-ink/[0.06] text-ink/60'}`}>
        <b className="jb-mono text-[30px] font-extrabold leading-none md:text-[38px]">{job.closingDate ? fmt(job.closingDate, locale, { day: 'numeric' }) : '–'}</b>
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">{job.closingDate ? fmt(job.closingDate, locale, { month: 'short', year: 'numeric' }) : ''}</span>
        <span className={`ms-auto text-[11px] md:ms-0 md:mt-2 ${open ? 'text-white/70' : ''}`}>{dict.fields.closingDate}</span>
      </div>

      {/* Title and facts */}
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {job.referenceNumber && <span className="jb-mono bg-[#F4BA00] px-2.5 py-1 text-[12px] font-bold">Ref {job.referenceNumber}</span>}
          <StatusBadge status={job.status} closingDate={job.closingDate} dict={dict} />
        </div>
        <h3 className="mt-3 text-[19px] font-bold leading-snug text-ink transition group-hover:text-brand-fg md:text-[21px]">{title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink/65">
          {location && <span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-brand-fg" />{location}</span>}
          {job.workType && <span className="inline-flex items-center gap-1.5"><Briefcase size={15} className="text-brand-fg" />{dict.options.workType[job.workType]}</span>}
          {job.functionalArea && <span className="inline-flex items-center gap-1.5"><Layers size={15} className="text-brand-fg" />{dict.options.functionalArea[job.functionalArea]}</span>}
        </div>
      </div>

      {/* Vacancies + arrow */}
      <div className="flex items-center justify-between gap-4 border-t border-brand-line/10 px-5 py-4 md:flex-col md:items-start md:justify-center md:border-s md:border-t-0">
        {job.numberOfVacancies ? (
          <span className="flex items-center gap-3">
            <Users size={22} className="text-brand-fg" />
            <span>
              <b className="block text-[22px] leading-none text-ink">{job.numberOfVacancies}</b>
              <span className="text-[12px] text-ink/55">{dict.fields.numberOfVacancies}</span>
            </span>
          </span>
        ) : <span />}
        <span className="grid h-10 w-10 shrink-0 place-items-center border border-brand-line/20 text-brand-fg transition group-hover:bg-[#F4BA00] group-hover:text-[#1A1A1A]">
          <ArrowRight size={18} className="rtl:rotate-180" />
        </span>
      </div>
    </Link>
  )
}
