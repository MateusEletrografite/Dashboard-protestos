import { RotateCcw, Search } from 'lucide-react'
import { DEFAULT_FILTERS } from '../../data/filters'
import type { DashboardFilters } from '../../types/dashboard'

interface FilterBarProps {
  filters: DashboardFilters
  accounts: string[]
  statuses: string[]
  resultCount: number
  onChange: (filters: DashboardFilters) => void
}

export function FilterBar({ filters, accounts, statuses, resultCount, onChange }: FilterBarProps) {
  const updateFilter = <Key extends keyof DashboardFilters>(key: Key, value: DashboardFilters[Key]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="panel p-3">
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-ink-strong">Filtros</h2>
          <p className="mt-1 text-xs text-ink-muted">{resultCount.toLocaleString('pt-BR')} títulos na visão atual</p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-surface-line bg-white px-3 text-sm font-semibold text-ink-body transition hover:border-finance-blue/30 hover:text-finance-blue"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <RotateCcw size={15} />
          Limpar
        </button>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-6">
        <label className="space-y-1.5">
          <span className="label">Emissão inicial</span>
          <input
            type="date"
            className="field"
            value={filters.issueDateFrom}
            onChange={(event) => updateFilter('issueDateFrom', event.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Emissão final</span>
          <input
            type="date"
            className="field"
            value={filters.issueDateTo}
            onChange={(event) => updateFilter('issueDateTo', event.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Conta</span>
          <select className="field" value={filters.account} onChange={(event) => updateFilter('account', event.target.value)}>
            <option value="Todas">Todas</option>
            {accounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">Status</span>
          <select
            className="field"
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value as DashboardFilters['status'])}
          >
            <option value="Todos">Todos</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">Sacado</span>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              className="field pl-9"
              value={filters.debtor}
              placeholder="Nome ou razão social"
              onChange={(event) => updateFilter('debtor', event.target.value)}
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="label">Documento</span>
          <input
            type="search"
            className="field"
            value={filters.document}
            placeholder="Doc."
            onChange={(event) => updateFilter('document', event.target.value)}
          />
        </label>
      </div>
    </section>
  )
}
