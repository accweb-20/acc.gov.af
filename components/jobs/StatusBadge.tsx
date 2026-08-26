import type { JobStatus } from '@/types/job'
import type { Dictionary } from '@/lib/i18n/dictionaries'

interface StatusBadgeProps {
  status?: JobStatus
  closingDate?: string
  dict: Dictionary
}

export function getComputedStatus(status?: JobStatus, closingDate?: string): 'open' | 'expired' | 'closed' {
  if (status === 'closed') return 'closed'
  if (closingDate && closingDate < new Date().toISOString().slice(0, 10)) return 'expired'
  return 'open'
}

const styles: Record<string, { bg: string; color: string }> = {
  open: { bg: 'var(--jb-open-bg)', color: 'var(--jb-open)' },
  expired: { bg: 'var(--jb-expired-bg)', color: 'var(--jb-expired)' },
  closed: { bg: 'var(--jb-closed-bg)', color: 'var(--jb-closed)' },
}

export function StatusBadge({ status, closingDate, dict }: StatusBadgeProps) {
  const computed = getComputedStatus(status, closingDate)
  const label = dict.status[computed]
  const style = styles[computed]

  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {label}
    </span>
  )
}
