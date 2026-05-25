import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="panel p-4">
      <div className="mb-3 border-b border-surface-line pb-3">
        <h2 className="text-sm font-semibold text-ink-strong">{title}</h2>
        <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>
      </div>
      <div className="h-[300px] min-w-0">{children}</div>
    </section>
  )
}
