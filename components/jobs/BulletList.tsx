import { CircleCheck } from 'lucide-react'

interface BulletListProps {
  title: string
  items: string[]
}

/** A white card with a title and a check-marked list. */
export function BulletList({ title, items }: BulletListProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="bg-paper p-6 md:p-8">
      <h2 className="text-[22px] font-extrabold text-ink md:text-[26px]">{title}</h2>
      <span className="mt-3 block h-1 w-12 bg-[#F4BA00]" />
      <ul className="mt-6 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <CircleCheck size={19} className="mt-0.5 shrink-0 text-brand-fg" />
            <p className="leading-relaxed text-ink/75">{item}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
