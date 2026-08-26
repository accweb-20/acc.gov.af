// jobs/[lang]/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client } from '@/lib/sanity/client'
import {
  jobBySlugQuery,
  jobSlugsQuery,
  relatedJobsQuery,
} from '@/lib/sanity/queries'

import type {
  JobCardData,
  JobPosting,
} from '@/types/job'

import {
  locales,
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

import '@/styles/jobs-theme.css'

export const revalidate = 60

interface JobDetailPageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(
    jobSlugsQuery
  )

  return locales.flatMap((lang) =>
    slugs.map((slug) => ({
      lang,
      slug,
    }))
  )
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

  return (
    <main
      className="jb-root min-h-screen px-4 py-10 sm:px-8 mt-10"
      dir={localeDir[locale]}
      data-lang={locale}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/jobs/${locale}`}
            className="text-sm font-semibold"
            style={{
              color: 'var(--jb-primary)',
            }}
          >
            {dict.backToJobs}
          </Link>

          <LanguageSwitcher current={locale} />
        </div>

        {computedStatus === 'expired' && (
          <div
            className="mb-6 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: 'var(--jb-expired)',
              backgroundColor: 'var(--jb-expired-bg)',
              color: 'var(--jb-expired)',
            }}
          >
            {dict.status.expired}
            {' — '}
            {dict.fields.closingDate.toLowerCase()}
          </div>
        )}

        <header
          className="mb-8 rounded-xl border p-6 sm:p-8"
          style={{
            borderColor: 'var(--jb-border)',
            backgroundColor: 'var(--jb-surface)',
          }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={job.status}
              closingDate={job.closingDate}
              dict={dict}
            />

            {job.referenceNumber && (
              <span
                className="jb-mono text-xs"
                style={{
                  color: 'var(--jb-muted)',
                }}
              >
                Ref: {job.referenceNumber}
              </span>
            )}
          </div>

          <h1
            className="mb-2 text-2xl font-extrabold sm:text-3xl"
            style={{
              color: 'var(--jb-ink)',
            }}
          >
            {title}
          </h1>

          {location && (
            <p
              className="text-sm"
              style={{
                color: 'var(--jb-muted)',
              }}
            >
              📍 {location}
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <article>
            {jobSummary && (
              <section className="mb-8">
                <h2
                  className="mb-3 text-lg font-bold"
                  style={{
                    color: 'var(--jb-ink)',
                  }}
                >
                  {dict.fields.jobSummary}
                </h2>

                <p
                  className="leading-relaxed"
                  style={{
                    color: 'var(--jb-muted)',
                  }}
                >
                  {jobSummary}
                </p>
              </section>
            )}

            <BulletList
              title={dict.fields.keyResponsibilities}
              items={responsibilities}
            />

            <BulletList
              title={dict.fields.qualifications}
              items={qualifications}
            />

            {submissionGuidelines && (
              <section
                className="mb-8 rounded-lg p-5 text-white"
                style={{
                  backgroundColor: 'var(--jb-primary)',
                }}
              >
                <h2 className="mb-2 text-lg font-bold">
                  {dict.fields.submissionGuidelines}
                </h2>

                <p className="leading-relaxed opacity-90">
                  {submissionGuidelines}
                </p>
              </section>
            )}

            {relatedJobs.length > 0 && (
              <section>
                <h2
                  className="mb-4 border-b-2 pb-2 text-lg font-bold"
                  style={{
                    borderColor: 'var(--jb-border)',
                  }}
                >
                  {dict.relatedJobs}
                </h2>

                <div className="space-y-4">
                  {relatedJobs.map((related) => (
                    <JobCard
                      key={related._id}
                      job={related}
                      locale={locale}
                      dict={dict}
                    />
                  ))}
                </div>
              </section>
            )}
          </article>

          <JobSidebarFacts
            job={job}
            locale={locale}
            dict={dict}
          />
        </div>
      </div>
    </main>
  )
}