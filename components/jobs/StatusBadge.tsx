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

/** Small square label with a dot: Open / Expired / Closed. */
export function StatusBadge({ status, closingDate, dict }: StatusBadgeProps) {
  const computed = getComputedStatus(status, closingDate)
  const style = styles[computed]

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-bold" style={{ backgroundColor: style.bg, color: style.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {dict.status[computed]}
    </span>
  )
}
