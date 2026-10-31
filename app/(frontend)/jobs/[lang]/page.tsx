// jobs/[lang]/page.tsx
import { client } from '@/lib/sanity/client'
import {
  allJobsQuery,
  jobFunctionalAreasQuery,
  jobWorkTypesQuery,
} from '@/lib/sanity/queries'
import type {
  JobCardData,
  FunctionalArea,
  WorkType,
} from '@/types/job'
import {
  locales,
  isLocale,
  defaultLocale,
  localeDir,
  type Locale,
} from '@/lib/i18n/config'
import {
  getDictionary,
  formatActiveCount,
} from '@/lib/i18n/dictionaries'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { LanguageSwitcher } from '@/components/jobs/LanguageSwitcher'
import PageHeader from '@/components/PageHeader'
import { BriefcaseBusiness } from 'lucide-react'
import { hasRich } from '@/lib/imports'
import '@/styles/jobs-theme.css'

export const revalidate = 60

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

interface JobsPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    search?: string
    functionalArea?: string
    workType?: string
    hideExpired?: string
  }>
}

export default async function JobsPage({
  params,
  searchParams,
}: JobsPageProps) {
  const { lang } = await params

  const locale: Locale = isLocale(lang)
    ? lang
    : defaultLocale

  const dict = getDictionary(locale)

  const {
    search,
    functionalArea,
    workType,
    hideExpired,
  } = await searchParams

  const [jobs, functionalAreas, workTypes, page] = await Promise.all([
    client.fetch<JobCardData[]>(
      allJobsQuery,
      {
        search: search || null,
        functionalArea: functionalArea || null,
        workType: workType || null,
        hideExpired: hideExpired === '1',
        today: new Date().toISOString().slice(0, 10),
      }
    ),

    client.fetch<FunctionalArea[]>(
      jobFunctionalAreasQuery
    ),

    client.fetch<WorkType[]>(
      jobWorkTypesQuery
    ),

    // Breadcrumbs from the "Job Page" document in Sanity
    client
      .fetch<JobsCrumbs | null>(
        `*[_type == "jobsPage"][0]{ title, breadcrumbLabel, description, "links": breadcrumbLinks[]{_key, label, href} }`
      )
      .catch(() => null),
  ])

  const crumbs = (page?.links ?? []).filter((l) => l?.label && l?.href) as { _key?: string; label: string; href: string }[]
  const english = locale === 'en'
  const CONTAINER = 'mx-auto w-[90%] max-w-[493px] md:w-[93%] md:max-w-[924px] lg:w-[90%] lg:max-w-[1140px]'

  return (
    <main className="bg-mist text-ink">
      <PageHeader
        title={english ? page?.title || dict.siteTitle : dict.siteTitle}
        breadcrumbLinks={crumbs}
        breadcrumbLabel={english ? page?.breadcrumbLabel || page?.title || 'Jobs' : dict.siteTitle}
        headerMessage={
          english
            ? (hasRich(page?.description) ? page?.description : null) ||
              'Join Afghan Cart Corporation. Browse our current vacancies, read the job details and apply before the closing date.'
            : formatActiveCount(dict.activeCount, jobs.length)
        }
      />

      <div className="jb-root" dir={localeDir[locale]} data-lang={locale}>
        {/* Count + language */}
        <div className="border-b border-brand-line/10 bg-paper">
          <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-3 py-3`}>
            <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink/70">
              <span className="grid h-9 w-9 place-items-center bg-brand/10 text-brand-fg">
                <BriefcaseBusiness size={18} />
              </span>
              {formatActiveCount(dict.activeCount, jobs.length)}
            </span>
            <LanguageSwitcher current={locale} />
          </div>
        </div>

        <section className="py-12 md:py-16">
          <div className={CONTAINER}>
            <JobFilters functionalAreas={functionalAreas} workTypes={workTypes} dict={dict} />

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center border border-dashed border-brand-line/25 bg-paper px-6 py-14 text-center">
                <span className="grid h-14 w-14 place-items-center bg-brand/10 text-brand-fg">
                  <BriefcaseBusiness size={26} />
                </span>
                <h3 className="mt-5 text-[20px] font-bold">{dict.noJobsFound}</h3>
                <p className="mt-2 max-w-md text-[15px] text-ink/60">{dict.noJobsFoundDesc}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} locale={locale} dict={dict} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

type JobsCrumbs = {
  title?: string | null
  breadcrumbLabel?: string | null
  description?: unknown
  links?: { _key?: string; label?: string; href?: string }[] | null
}
