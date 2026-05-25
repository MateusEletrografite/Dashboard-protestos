import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarClock,
  CircleDollarSign,
  FileWarning,
  Landmark,
  ReceiptText,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { Suspense, lazy, useMemo, useState } from 'react'
import { AdvancedTable } from '../components/dashboard/AdvancedTable'
import { FilterBar } from '../components/dashboard/FilterBar'
import { KpiCard } from '../components/dashboard/KpiCard'
import { UploadDropzone } from '../components/upload/UploadDropzone'
import { DEFAULT_FILTERS } from '../data/filters'
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics'
import { useDashboardData } from '../hooks/useDashboardData'
import type { DashboardFilters } from '../types/dashboard'
import { currencyFormatter, decimalFormatter, integerFormatter } from '../utils/formatters'

const ChartsGrid = lazy(() => import('../components/dashboard/ChartsGrid').then((module) => ({ default: module.ChartsGrid })))

function percentage(value: number, total: number): string {
  if (total <= 0) {
    return '0%'
  }

  return `${decimalFormatter.format((value / total) * 100)}%`
}

function formatImportedAt(importedAt: string): string {
  if (!importedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(importedAt))
}

export function DashboardPage() {
  const { records, issues, fileName, sheetName, importedAt, summary, isParsing, error, importFile, clearData, hasData } = useDashboardData()
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const analytics = useDashboardAnalytics(records, filters)

  const kpis = useMemo(() => {
    const metrics = analytics.metrics

    return [
      {
        title: 'Valor total',
        value: currencyFormatter.format(metrics.totalValue),
        detail: `${integerFormatter.format(metrics.titleCount)} títulos no recorte`,
        icon: CircleDollarSign,
        tone: 'blue' as const,
      },
      {
        title: 'Total protestado',
        value: currencyFormatter.format(metrics.protestedValue),
        detail: `${percentage(metrics.protestedValue, metrics.totalValue)} do valor filtrado`,
        icon: FileWarning,
        tone: 'red' as const,
      },
      {
        title: 'Total cartório',
        value: currencyFormatter.format(metrics.registryValue),
        detail: `${percentage(metrics.registryValue, metrics.totalValue)} do valor filtrado`,
        icon: Landmark,
        tone: 'blue' as const,
      },
      {
        title: 'Outros status',
        value: currencyFormatter.format(metrics.otherStatusValue),
        detail: 'Aberto, corrigido ou sem status',
        icon: BadgeDollarSign,
        tone: 'amber' as const,
      },
      {
        title: 'Quantidade títulos',
        value: integerFormatter.format(metrics.titleCount),
        detail: `${integerFormatter.format(records.length)} registros importados`,
        icon: ReceiptText,
        tone: 'slate' as const,
      },
      {
        title: 'Ticket médio',
        value: currencyFormatter.format(metrics.averageTicket),
        detail: 'Média financeira por documento',
        icon: BadgeDollarSign,
        tone: 'green' as const,
      },
      {
        title: 'Maior título',
        value: currencyFormatter.format(metrics.maxTitleValue),
        detail: 'Maior exposição individual',
        icon: TrendingUp,
        tone: 'amber' as const,
      },
      {
        title: 'Vencidos',
        value: integerFormatter.format(metrics.overdueCount),
        detail: `${percentage(metrics.overdueCount, metrics.titleCount)} da base filtrada`,
        icon: AlertTriangle,
        tone: 'red' as const,
      },
      {
        title: 'A vencer',
        value: integerFormatter.format(metrics.openCount),
        detail: `${percentage(metrics.openCount, metrics.titleCount)} da base filtrada`,
        icon: CalendarClock,
        tone: 'green' as const,
      },
    ]
  }, [analytics.metrics, records.length])

  if (!hasData) {
    return (
      <div className="space-y-3">
        <UploadDropzone isParsing={isParsing} error={error} fileName={fileName} onFile={importFile} />

        <section className="panel overflow-hidden">
          <div className="border-b border-surface-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-strong">Estrutura da planilha</h2>
            <p className="mt-1 text-xs text-ink-muted">As colunas abaixo são reconhecidas automaticamente no primeiro worksheet.</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-surface-line sm:grid-cols-3 lg:grid-cols-9">
            {['Cart', 'Conta', 'Emissão', 'Vencto.', 'Vcto Original.', 'Doc.', 'Sacado', 'Valor', 'Carimbo'].map((column) => (
              <div key={column} className="bg-white px-3 py-3 text-xs font-semibold text-ink-body">
                {column}
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <UploadDropzone isParsing={isParsing} error={error} fileName={fileName} onFile={importFile} />

      <section className="flex flex-col justify-between gap-2 rounded-lg border border-surface-line bg-white px-4 py-2.5 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>
            Aba <strong className="font-semibold text-ink-body">{sheetName}</strong>
          </span>
          <span>
            Importação <strong className="font-semibold text-ink-body">{formatImportedAt(importedAt)}</strong>
          </span>
          <span>
            Registros <strong className="font-semibold text-ink-body">{integerFormatter.format(records.length)}</strong>
          </span>
          {summary.sheetTotalValue !== null ? (
            <span>
              Total da planilha <strong className="font-semibold text-ink-body">{currencyFormatter.format(summary.sheetTotalValue)}</strong>
            </span>
          ) : null}
          {summary.skippedSummaryRows > 0 ? (
            <span>
              Totais removidos <strong className="font-semibold text-ink-body">{integerFormatter.format(summary.skippedSummaryRows)}</strong>
            </span>
          ) : null}
          {summary.skippedInvalidRows > 0 ? (
            <span>
              Linhas inválidas removidas{' '}
              <strong className="font-semibold text-ink-body">{integerFormatter.format(summary.skippedInvalidRows)}</strong>
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-surface-line bg-white px-3 text-xs font-semibold text-ink-body transition hover:border-finance-red/30 hover:text-finance-red"
          onClick={() => {
            clearData()
            setFilters(DEFAULT_FILTERS)
          }}
        >
          <Trash2 size={15} />
          Remover base
        </button>
      </section>

      {issues.length > 0 ? (
        <details className="rounded-lg border border-surface-line bg-white px-4 py-2.5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink-strong">
            <AlertTriangle size={16} className="text-finance-amber" />
            Validação da importação
            <span className="font-normal text-ink-muted">
              {integerFormatter.format(issues.length)} inconsistências tratadas
            </span>
          </summary>
          <div className="mt-3 border-t border-surface-line pt-3">
            <ul className="grid gap-1 text-xs leading-5 text-ink-body md:grid-cols-2">
                {issues.slice(0, 6).map((issue) => (
                  <li key={`${issue.rowNumber}-${issue.field}-${issue.message}`}>
                    Linha {issue.rowNumber}, {issue.field}: {issue.message}
                  </li>
                ))}
              </ul>
          </div>
        </details>
      ) : null}

      <FilterBar filters={filters} accounts={analytics.accounts} statuses={analytics.statuses} resultCount={analytics.filteredRecords.length} onChange={setFilters} />

      <section className="panel grid overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <Suspense
        fallback={
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="panel h-[360px] animate-pulse bg-surface-muted" />
            <div className="panel h-[360px] animate-pulse bg-surface-muted" />
          </div>
        }
      >
        <ChartsGrid analytics={analytics} />
      </Suspense>

      <AdvancedTable records={analytics.filteredRecords} />
    </div>
  )
}
