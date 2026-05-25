import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  detail: string
  icon: LucideIcon
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate'
}

const toneClassName = {
  blue: 'text-finance-blue',
  green: 'text-finance-green',
  amber: 'text-finance-amber',
  red: 'text-finance-red',
  slate: 'text-ink-muted',
}

export function KpiCard({ title, value, detail, icon: Icon, tone = 'blue' }: KpiCardProps) {
  return (
    <article className="min-h-[106px] border-b border-surface-line p-4 sm:border-r xl:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <p className="label">{title}</p>
        <Icon size={16} className={toneClassName[tone]} />
      </div>
      <p className="mt-3 text-[22px] font-semibold leading-none tracking-normal text-ink-strong">{value}</p>
      <p className="mt-3 text-xs leading-5 text-ink-muted">{detail}</p>
    </article>
  )
}
