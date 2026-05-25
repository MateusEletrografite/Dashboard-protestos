import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-canvas text-ink-body">
      <header className="border-b border-surface-line bg-white">
        <div className="mx-auto max-w-[1640px] px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-ink-strong sm:text-2xl">Protestos e Cartório</h1>
            <p className="mt-1 text-sm text-ink-muted">Painel operacional de carteira, vencimentos e exposição financeira.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1640px] px-4 py-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
