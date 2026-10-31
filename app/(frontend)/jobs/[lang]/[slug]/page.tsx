// jobs/[lang]/[slug]/page.tsx
import Link from 'next/link'
import { localeIntlTag } from '@/lib/i18n/config'
import { notFound } from 'next/navigation'

import { client } from '@/lib/sanity/client'
import {
  jobBySlugQuery,
  relatedJobsQuery,
} from '@/lib/sanity/queries'

import type {
  JobCardData,
  JobPosting,
} from '@/types/job'

import {
  isLocale,
  defaultLocale,
  localeDir,
  type Locale,
} from '@/lib/i18n/config'

import { getDictionary } from '@/lib/i18n/dictionaries'
import {
  pickLocaleString,
  pickLocaleList,
} from '@/lib/i18n/getLocalized'

import {
  StatusBadge,
  getComputedStatus,
} from '@/components/jobs/StatusBadge'

import { LanguageSwitcher } from '@/components/jobs/LanguageSwitcher'
import { JobSidebarFacts } from '@/components/jobs/JobSidebarFacts'
import { BulletList } from '@/components/jobs/BulletList'
import { JobCard } from '@/components/jobs/JobCard'

import PageHeader from '@/components/PageHeader'
import { ArrowLeft, Briefcase, CalendarDays, Clock, MapPin, Send } from 'lucide-react'
import '@/styles/jobs-theme.css'

/*
 * Do not prerender individual job pages during Vercel build.
 * Fetch Sanity data when the page is requested instead.
 */
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface JobDetailPageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

export default async function JobDetailPage({
  params,
}: JobDetailPageProps) {
  const { lang, slug } = await params

  const locale: Locale = isLocale(lang)
    ? lang
    : defaultLocale

  const dict = getDictionary(locale)

  const job = await client.fetch<JobPosting | null>(
    jobBySlugQuery,
    { slug }
  )

  // Breadcrumbs from the "Job Page" document in Sanity (default: Home / Jobs)
  const crumbDoc = await client
    .fetch<{ links?: { _key?: string; label?: string; href?: string }[] | null } | null>(
      `*[_type == "jobsPage"][0]{ "links": jobBreadcrumbLinks[]{_key, label, href} }`
    )
    .catch(() => null)
  const crumbLinks = (crumbDoc?.links ?? []).filter((l) => l?.label && l?.href) as { _key?: string; label: string; href: string }[]

  if (!job) {
    notFound()
  }

  const relatedJobs = job.functionalArea
    ? await client.fetch<JobCardData[]>(
        relatedJobsQuery,
        {
          functionalArea: job.functionalArea,
          slug: job.slug,
        }
      )
    : []

  const title = pickLocaleString(
    job.title,
    locale
  )

  const location = pickLocaleString(
    job.location,
    locale
  )

  const jobSummary = pickLocaleString(
    job.jobSummary,
    locale
  )

  const submissionGuidelines = pickLocaleString(
    job.submissionGuidelines,
    locale
  )

  const responsibilities = pickLocaleList(
    job.keyResponsibilities,
    locale
  )

  const qualifications = pickLocaleList(
    job.qualifications,
    locale
  )

  const computedStatus = getComputedStatus(
    job.status,
    job.closingDate
  )

  const CONTAINER = 'mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]'
  const closing = job.closingDate
    ? new Intl.DateTimeFormat(localeIntlTag[locale], { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(job.closingDate))
    : null
  const chip = 'inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white'

  return (
    <main className="bg-mist text-ink">
      <PageHeader
        title={title || 'Job'}
        breadcrumbLinks={crumbLinks.length ? crumbLinks : [{ label: 'Home', href: '/' }, { label: 'Jobs', href: '/jobs' }]}
        breadcrumbLabel={title || 'Job'}
      >
        {/* Key facts under the title */}
        <div className="flex flex-wrap justify-center gap-2" dir={localeDir[locale]}>
          <StatusBadge status={job.status} closingDate={job.closingDate} dict={dict} />
          {job.referenceNumber && <span className="jb-mono bg-[#F4BA00] px-3 py-1.5 text-[13px] font-bold text-[#1A1A1A]">Ref {job.referenceNumber}</span>}
          {location && <span className={chip}><MapPin size={15} className="text-[#F4BA00]" />{location}</span>}
          {job.workType && <span className={chip}><Briefcase size={15} className="text-[#F4BA00]" />{dict.options.workType[job.workType]}</span>}
          {closing && <span className={chip}><CalendarDays size={15} className="text-[#F4BA00]" />{dict.fields.closingDate}: {closing}</span>}
        </div>
      </PageHeader>

      <div className="jb-root" dir={localeDir[locale]} data-lang={locale}>
        {/* Back link + language */}
        <div className="border-b border-brand-line/10 bg-paper">
          <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-3 py-3`}>
            <Link href={`/jobs/${locale}`} className="inline-flex items-center gap-2 text-[15px] font-semibold text-brand-fg hover:underline">
              <ArrowLeft size={17} className="rtl:rotate-180" />
              {dict.backToJobs.replace(/^[←→]\s*/, '')}
            </Link>
            <LanguageSwitcher current={locale} />
          </div>
        </div>

        <section className="py-12 md:py-16">
          <div className={CONTAINER}>
            {computedStatus !== 'open' && (
              <div className="mb-8 flex items-center gap-3 border-s-4 px-5 py-4 text-[15px] font-semibold" style={{ borderColor: 'var(--jb-expired)', backgroundColor: 'var(--jb-expired-bg)', color: 'var(--jb-expired)' }}>
                <Clock size={19} className="shrink-0" />
                {dict.status[computedStatus]}
                {closing && ` — ${dict.fields.closingDate}: ${closing}`}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
              <article className="space-y-6">
                {jobSummary && (
                  <section className="bg-paper p-6 md:p-8">
                    <h2 className="text-[22px] font-extrabold md:text-[26px]">{dict.fields.jobSummary}</h2>
                    <span className="mt-3 block h-1 w-12 bg-[#F4BA00]" />
                    <p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed text-ink/75">{jobSummary}</p>
                  </section>
                )}

                <BulletList title={dict.fields.keyResponsibilities} items={responsibilities} />
                <BulletList title={dict.fields.qualifications} items={qualifications} />

                {submissionGuidelines && (
                  <section className="relative overflow-hidden bg-brand p-6 text-white md:p-8">
                    <span className="absolute end-0 top-0 h-10 w-10 bg-[#F4BA00] [clip-path:polygon(0_0,100%_0,100%_100%)] rtl:[clip-path:polygon(0_0,100%_0,0_100%)]" />
                    <h2 className="flex items-center gap-3 text-[22px] font-extrabold md:text-[26px]">
                      <Send size={22} className="text-[#F4BA00] rtl:-scale-x-100" />
                      {dict.fields.submissionGuidelines}
                    </h2>
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-white/85">{submissionGuidelines}</p>
                  </section>
                )}
              </article>

              <JobSidebarFacts job={job} locale={locale} dict={dict} />
            </div>

            {relatedJobs.length > 0 && (
              <section className="mt-14">
                <h2 className="text-[26px] font-extrabold md:text-[32px]">{dict.relatedJobs}</h2>
                <span className="mt-3 block h-1 w-16 bg-[#F4BA00]" />
                <div className="mt-8 space-y-5">
                  {relatedJobs.map((related) => (
                    <JobCard key={related._id} job={related} locale={locale} dict={dict} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
