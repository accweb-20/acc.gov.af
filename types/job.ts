export type LocaleString = Partial<Record<'en' | 'ps' | 'fa', string>>
export type LocaleList = Partial<Record<'en' | 'ps' | 'fa', string[]>>

export type Gender = 'male' | 'female' | 'any'
export type AnnouncementType = 'internal' | 'external' | 'both'
export type WorkType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary'
export type FunctionalArea =
  | 'it'
  | 'finance'
  | 'hr'
  | 'health'
  | 'education'
  | 'engineering'
  | 'logistics'
  | 'admin'
  | 'media'
  | 'agriculture'
  | 'other'
export type LanguageTag = 'dari' | 'pashto' | 'english' | 'other'
export type JobStatus = 'draft' | 'active' | 'closed'

/** Shape returned by jobCardProjection — enough to render a listing card. */
export interface JobCardData {
  _id: string
  title: LocaleString
  slug: string
  location?: LocaleString
  workType?: WorkType
  functionalArea?: FunctionalArea
  numberOfVacancies?: number
  referenceNumber?: string
  publishDate?: string
  closingDate?: string
  status?: JobStatus
}

/** Full shape returned by jobBySlugQuery. */
export interface JobPosting extends JobCardData {
  degree?: LocaleString
  gender?: Gender
  jobSummary?: LocaleString
  keyResponsibilities?: LocaleList
  qualifications?: LocaleList
  submissionGuidelines?: LocaleString
  announcementType?: AnnouncementType
  salaryRange?: LocaleString
  experienceRequired?: LocaleString
  probationaryPeriod?: LocaleString
  contractType?: LocaleString
  contractDuration?: LocaleString
  contractExtension?: LocaleString
  languages?: LanguageTag[]
  nationality?: LocaleString
  travelRequired?: LocaleString
}
