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
import { getDictionary } from '@/lib/i18n/dictionaries'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { LanguageSwitcher } from '@/components/jobs/LanguageSwitcher'
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

  const [jobs, functionalAreas, workTypes] = await Promise.all([
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
  ])

  /*
   * `activeCount` is a function, so it must stay on the
   * server and must NOT be passed to Client Components.
   *
   * Everything else in `clientDict` is serializable.
   */
  const {
    activeCount,
    ...clientDict
  } = dict

  const activeCountText = activeCount(jobs.length)

  return (
    <main
      className="jb-root min-h-screen px-4 py-10 sm:px-8"
      dir={localeDir[locale]}
      data-lang={locale}
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-extrabold sm:text-3xl"
              style={{ color: 'var(--jb-ink)' }}
            >
              {dict.siteTitle}
            </h1>

            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--jb-muted)' }}
            >
              {activeCountText}
            </p>
          </div>

          <LanguageSwitcher current={locale} />
        </header>

        <JobFilters
          functionalAreas={functionalAreas}
          workTypes={workTypes}
          dict={clientDict}
        />

        {jobs.length === 0 ? (
          <div
            className="rounded-xl border border-dashed py-16 text-center"
            style={{
              borderColor: 'var(--jb-border)',
              color: 'var(--jb-muted)',
            }}
          >
            <p
              className="mb-1 font-semibold"
              style={{ color: 'var(--jb-ink)' }}
            >
              {dict.noJobsFound}
            </p>

            <p className="text-sm">
              {dict.noJobsFoundDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                locale={locale}
                dict={clientDict}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}