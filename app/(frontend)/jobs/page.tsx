// jobs/page.tsx
import { redirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export default function JobsIndexRedirect() {
  redirect(`/jobs/${defaultLocale}`)
}