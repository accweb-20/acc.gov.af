import { groq } from 'next-sanity'

const jobCardProjection = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  location,
  workType,
  functionalArea,
  numberOfVacancies,
  referenceNumber,
  publishDate,
  closingDate,
  status
}`

// All jobs, newest first. Drafts are always excluded from the public site.
// Expired jobs (closingDate in the past) are deliberately kept — the
// frontend labels them "Expired" rather than hiding them.
//
// Params (pass null to skip a filter):
//   $search          — matches title.en / title.ps / title.fa
//   $functionalArea  — exact match on functionalArea
//   $workType        — exact match on workType
//   $hideExpired     — if true, filter out jobs whose closingDate has passed
//   $today           — ISO date string for the hideExpired comparison
export const allJobsQuery = groq`
*[
  _type == "jobPosting"
  && status != "draft"
  && (!defined($search) || title.en match $search + "*" || title.ps match $search + "*" || title.fa match $search + "*")
  && (!defined($functionalArea) || functionalArea == $functionalArea)
  && (!defined($workType) || workType == $workType)
  && (!$hideExpired || !defined(closingDate) || closingDate >= $today)
] | order(publishDate desc) ${jobCardProjection}
`

export const jobFunctionalAreasQuery = groq`
array::unique(*[_type == "jobPosting" && status != "draft" && defined(functionalArea)].functionalArea)
`

export const jobWorkTypesQuery = groq`
array::unique(*[_type == "jobPosting" && status != "draft" && defined(workType)].workType)
`

export const jobSlugsQuery = groq`
*[_type == "jobPosting" && status != "draft" && defined(slug.current)][].slug.current
`

export const jobBySlugQuery = groq`
*[_type == "jobPosting" && slug.current == $slug && status != "draft"][0]{
  _id,
  title,
  "slug": slug.current,
  location,
  degree,
  gender,
  jobSummary,
  keyResponsibilities,
  qualifications,
  submissionGuidelines,
  publishDate,
  closingDate,
  referenceNumber,
  numberOfVacancies,
  announcementType,
  workType,
  salaryRange,
  experienceRequired,
  probationaryPeriod,
  contractType,
  contractDuration,
  contractExtension,
  languages,
  functionalArea,
  nationality,
  travelRequired,
  status
}
`

export const relatedJobsQuery = groq`
*[
  _type == "jobPosting"
  && status != "draft"
  && functionalArea == $functionalArea
  && slug.current != $slug
] | order(publishDate desc) [0...3] ${jobCardProjection}
`
