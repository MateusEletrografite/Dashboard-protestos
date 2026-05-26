import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarClock,
  CircleDollarSign,
  FileWarning,
  Landmark,
  ReceiptText,
  Trash2,
  TrendingDown,
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

function signedPercent(value: number): string {
  const formatted = Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })

  if (value < 0) {
    return `-${formatted}%`
  }

  return `+${formatted}%`
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
        title: 'Inadimplência',
        value: currencyFormatter.format(metrics.delinquencyValue),
        detail: 'Protestado + Em Cartório',
        icon: AlertTriangle,
        tone: 'red' as const,
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

      <section className="overflow-hidden rounded-xl border border-finance-green/20 bg-gradient-to-br from-white via-white to-emerald-50 shadow-panel">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-5 sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-finance-green/20 bg-finance-green/5 px-3 py-1 text-xs font-semibold text-finance-green">
              <TrendingDown size={15} />
              Indicador de recuperação
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink-strong sm:text-3xl">
              Queda da inadimplência em {analytics.delinquencySnapshot.currentMonthLabel}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
              O painel compara mês a mês os títulos classificados como Protestado ou Em Cartório pela data de vencimento, destacando redução, pico da carteira e valor atual em risco.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-surface-line bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Mês atual</p>
                <p className="mt-2 text-xl font-semibold text-ink-strong">{currencyFormatter.format(analytics.delinquencySnapshot.currentValue)}</p>
                <p className="mt-1 text-xs text-ink-muted">{analytics.delinquencySnapshot.currentMonthLabel}</p>
              </div>
              <div className="rounded-lg border border-surface-line bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Variação mensal</p>
                <p className={`mt-2 text-xl font-semibold ${analytics.delinquencySnapshot.variationPercent <= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                  {signedPercent(analytics.delinquencySnapshot.variationPercent)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">vs. {analytics.delinquencySnapshot.previousMonthLabel}</p>
              </div>
              <div className="rounded-lg border border-surface-line bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Queda do pico</p>
                <p className="mt-2 text-xl font-semibold text-finance-green">{analytics.delinquencySnapshot.dropFromPeakPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</p>
                <p className="mt-1 text-xs text-ink-muted">pico em {analytics.delinquencySnapshot.peakMonthLabel}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-surface-line bg-white/70 p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Resumo executivo</p>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">Pico da inadimplência</span>
                  <strong className="text-ink-strong">{currencyFormatter.format(analytics.delinquencySnapshot.peakValue)}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-finance-red" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">Saldo atual em risco</span>
                  <strong className="text-ink-strong">{currencyFormatter.format(analytics.delinquencySnapshot.currentValue)}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-finance-green"
                    style={{
                      width: `${analytics.delinquencySnapshot.peakValue > 0 ? Math.max(4, (analytics.delinquencySnapshot.currentValue / analytics.delinquencySnapshot.peakValue) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-surface-muted px-3 py-3 text-sm leading-5 text-ink-body">
                A leitura considera apenas títulos de inadimplência efetiva: Protestado e Em Cartório. Status Aberto ou Corrigido ficam fora da curva de queda.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel grid overflow-hidden sm:grid-cols-2 lg:grid-cols-5">
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
