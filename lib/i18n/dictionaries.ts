import type { Locale } from './config'

export interface Dictionary {
  siteTitle: string
  backToJobs: string
  searchPlaceholder: string
  allFunctionalAreas: string
  allWorkTypes: string
  hideExpired: string
  noJobsFound: string
  noJobsFoundDesc: string
  activeCount: (n: number) => string
  jobOverview: string
  relatedJobs: string
  postedOn: string
  apply: string
  fields: {
    location: string
    degree: string
    gender: string
    jobSummary: string
    keyResponsibilities: string
    qualifications: string
    submissionGuidelines: string
    publishDate: string
    closingDate: string
    referenceNumber: string
    numberOfVacancies: string
    announcementType: string
    workType: string
    salaryRange: string
    experienceRequired: string
    probationaryPeriod: string
    contractType: string
    contractDuration: string
    contractExtension: string
    languages: string
    functionalArea: string
    nationality: string
    travelRequired: string
  }
  status: {
    open: string
    closed: string
    expired: string
  }
  options: {
    gender: Record<string, string>
    announcementType: Record<string, string>
    workType: Record<string, string>
    functionalArea: Record<string, string>
    languages: Record<string, string>
  }
}

const en: Dictionary = {
  siteTitle: 'Job Vacancies',
  backToJobs: '← Back to all jobs',
  searchPlaceholder: 'Search job title...',
  allFunctionalAreas: 'All functional areas',
  allWorkTypes: 'All work types',
  hideExpired: 'Hide expired jobs',
  noJobsFound: 'No jobs found',
  noJobsFoundDesc: 'Try adjusting your search or filters.',
  activeCount: (n) => `${n} job${n === 1 ? '' : 's'} listed`,
  jobOverview: 'Job Overview',
  relatedJobs: 'Similar Jobs',
  postedOn: 'Posted',
  apply: 'Apply Now',
  fields: {
    location: 'Location',
    degree: 'Degree',
    gender: 'Gender',
    jobSummary: 'Job Summary',
    keyResponsibilities: 'Key Responsibilities',
    qualifications: 'Qualifications',
    submissionGuidelines: 'Submission Guidelines',
    publishDate: 'Publish Date',
    closingDate: 'Closing Date',
    referenceNumber: 'Reference Number',
    numberOfVacancies: 'Number of Vacancies',
    announcementType: 'Announcement Type',
    workType: 'Work Type',
    salaryRange: 'Salary Range',
    experienceRequired: 'Experience Required',
    probationaryPeriod: 'Probationary Period',
    contractType: 'Contract Type',
    contractDuration: 'Contract Duration',
    contractExtension: 'Contract Extendable',
    languages: 'Languages',
    functionalArea: 'Functional Area',
    nationality: 'Nationality',
    travelRequired: 'Travel Required',
  },
  status: { open: 'Open', closed: 'Closed', expired: 'Expired' },
  options: {
    gender: { male: 'Male', female: 'Female', any: 'Any' },
    announcementType: { internal: 'Internal', external: 'External', both: 'Internal & External' },
    workType: {
      full_time: 'Full-time',
      part_time: 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
      temporary: 'Temporary',
    },
    functionalArea: {
      it: 'Information Technology',
      finance: 'Finance',
      hr: 'Human Resources',
      health: 'Health',
      education: 'Education',
      engineering: 'Engineering',
      logistics: 'Logistics',
      admin: 'Administration',
      media: 'Media & Communications',
      agriculture: 'Agriculture',
      other: 'Other',
    },
    languages: { dari: 'Dari', pashto: 'Pashto', english: 'English', other: 'Other' },
  },
}

const fa: Dictionary = {
  siteTitle: 'بست‌های اعلان شده',
  backToJobs: '← بازگشت به فهرست بست‌ها',
  searchPlaceholder: 'جستجوی عنوان وظیفه...',
  allFunctionalAreas: 'همه بخش‌ها',
  allWorkTypes: 'همه انواع کار',
  hideExpired: 'پنهان کردن اعلانات ختم شده',
  noJobsFound: 'هیچ بستی یافت نشد',
  noJobsFoundDesc: 'معیارهای جستجو یا فیلترها را تغییر دهید.',
  activeCount: (n) => `${n} بست نشر شده`,
  jobOverview: 'معلومات بست',
  relatedJobs: 'بست‌های مشابه',
  postedOn: 'تاریخ نشر',
  apply: 'درخواست دادن',
  fields: {
    location: 'موقعیت',
    degree: 'سویه تحصیل',
    gender: 'جنسیت',
    jobSummary: 'خلص وظیفه',
    keyResponsibilities: 'مسئولیت‌های کلیدی',
    qualifications: 'شرایط لازم',
    submissionGuidelines: 'طرزالعمل ارسال درخواستی',
    publishDate: 'تاریخ نشر',
    closingDate: 'تاریخ ختم',
    referenceNumber: 'شماره مرجع',
    numberOfVacancies: 'تعداد بست',
    announcementType: 'نوعیت اعلان',
    workType: 'نوع کار',
    salaryRange: 'مقدار معاش',
    experienceRequired: 'تجربه کاری',
    probationaryPeriod: 'دوره آزمایشی',
    contractType: 'نوع قرارداد',
    contractDuration: 'مدت قرارداد',
    contractExtension: 'تمدید قرارداد',
    languages: 'زبان‌ها',
    functionalArea: 'بخش وظیفوی',
    nationality: 'تابعیت',
    travelRequired: 'سفرهای کاری',
  },
  status: { open: 'فعال', closed: 'بسته شده', expired: 'ختم شده' },
  options: {
    gender: { male: 'مرد', female: 'زن', any: 'هردو' },
    announcementType: { internal: 'داخلی', external: 'خارجی', both: 'داخلی و خارجی' },
    workType: {
      full_time: 'وقت کامل',
      part_time: 'وقت جزئی',
      contract: 'قراردادی',
      internship: 'کارآموزی',
      temporary: 'موقت',
    },
    functionalArea: {
      it: 'تکنالوژی معلوماتی',
      finance: 'مالی',
      hr: 'منابع بشری',
      health: 'صحت',
      education: 'معارف',
      engineering: 'انجینری',
      logistics: 'لوژستیک',
      admin: 'اداری',
      media: 'رسانه و ارتباطات',
      agriculture: 'زراعت',
      other: 'سایر',
    },
    languages: { dari: 'دری', pashto: 'پشتو', english: 'انگلیسی', other: 'سایر' },
  },
}

const ps: Dictionary = {
  siteTitle: 'د دندو اعلانونه',
  backToJobs: '← بېرته د بستونو لړلیک ته',
  searchPlaceholder: 'د دندې عنوان ولټوئ...',
  allFunctionalAreas: 'ټولې برخې',
  allWorkTypes: 'د کار ټول ډولونه',
  hideExpired: 'پای ته رسېدلي اعلانونه پټ کړئ',
  noJobsFound: 'هیڅ دنده و نه موندل شوه',
  noJobsFoundDesc: 'خپل لټون یا فلټرونه بدل کړئ.',
  activeCount: (n) => `${n} دندې خپرې شوې`,
  jobOverview: 'د دندې لنډيز',
  relatedJobs: 'ورته دندې',
  postedOn: 'خپور شوی',
  apply: 'غوښتنلیک ورکړئ',
  fields: {
    location: 'ځای',
    degree: 'زده کړه',
    gender: 'جنس',
    jobSummary: 'د دندې لنډيز',
    keyResponsibilities: 'کلیدي مسؤلیتونه',
    qualifications: 'اړین شرطونه',
    submissionGuidelines: 'د غوښتنليک لارښود',
    publishDate: 'د خپرېدو نېټه',
    closingDate: 'د ختمېدو نېټه',
    referenceNumber: 'د راجع کولو شمېره',
    numberOfVacancies: 'د بستونو شمېر',
    announcementType: 'د اعلان ډول',
    workType: 'د کار ډول',
    salaryRange: 'د معاش کچه',
    experienceRequired: 'اړینه تجربه',
    probationaryPeriod: 'ازمایښتي دوره',
    contractType: 'د تړون ډول',
    contractDuration: 'د تړون موده',
    contractExtension: 'د تړون تمدید',
    languages: 'ژبې',
    functionalArea: 'کاري برخه',
    nationality: 'تابعیت',
    travelRequired: 'کاري سفرونه',
  },
  status: { open: 'فعال', closed: 'تړل شوی', expired: 'پای ته رسېدلی' },
  options: {
    gender: { male: 'نارینه', female: 'ښځینه', any: 'دواړه' },
    announcementType: { internal: 'داخلي', external: 'بهرنی', both: 'داخلي او بهرنی' },
    workType: {
      full_time: 'بشپړ وخت',
      part_time: 'نيم وخت',
      contract: 'قراردادي',
      internship: 'انترنشپ',
      temporary: 'مؤقت',
    },
    functionalArea: {
      it: 'معلوماتي ټکنالوژي',
      finance: 'مالي',
      hr: 'بشري سرچینې',
      health: 'روغتیا',
      education: 'زده‌کړه',
      engineering: 'انجنیري',
      logistics: 'لوژستیک',
      admin: 'اداري',
      media: 'رسنۍ او اړیکې',
      agriculture: 'کرنه',
      other: 'نور',
    },
    languages: { dari: 'دري', pashto: 'پښتو', english: 'انګلیسي', other: 'نور' },
  },
}

const dictionaries: Record<Locale, Dictionary> = { en, fa, ps }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
