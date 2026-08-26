interface BulletListProps {
  title: string
  items: string[]
}

export function BulletList({ title, items }: BulletListProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold" style={{ color: 'var(--jb-ink)' }}>
        {title}
      </h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--jb-primary)' }} />
            <p className="leading-relaxed" style={{ color: 'var(--jb-muted)' }}>
              {item}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
