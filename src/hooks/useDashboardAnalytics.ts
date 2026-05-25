import { useMemo } from 'react'
import type {
  DashboardAnalytics,
  DashboardFilters,
  DashboardMetrics,
  ProtestStatus,
  ProtestTitle,
  RankingPoint,
  StatusDistributionPoint,
  TimeSeriesPoint,
} from '../types/dashboard'
import { formatMonthLabel, isBeforeToday, monthKeyFromISO, sortISODate } from '../utils/date'
import { includesNormalized } from '../utils/text'

function applyFilters(records: ProtestTitle[], filters: DashboardFilters): ProtestTitle[] {
  return records.filter((record) => {
    const matchesDateFrom = !filters.issueDateFrom || (record.issueDate !== null && record.issueDate >= filters.issueDateFrom)
    const matchesDateTo = !filters.issueDateTo || (record.issueDate !== null && record.issueDate <= filters.issueDateTo)
    const matchesAccount = filters.account === 'Todas' || record.account === filters.account
    const matchesStatus = filters.status === 'Todos' || record.status === filters.status
    const matchesDebtor = includesNormalized(record.debtor, filters.debtor)
    const matchesDocument = includesNormalized(record.document, filters.document)

    return matchesDateFrom && matchesDateTo && matchesAccount && matchesStatus && matchesDebtor && matchesDocument
  })
}

function calculateMetrics(records: ProtestTitle[]): DashboardMetrics {
  const totalValue = records.reduce((sum, record) => sum + record.value, 0)
  const protestedValue = records
    .filter((record) => record.status === 'Protestado')
    .reduce((sum, record) => sum + record.value, 0)
  const registryValue = records
    .filter((record) => record.status === 'Em Cartório')
    .reduce((sum, record) => sum + record.value, 0)
  const maxTitleValue = records.reduce((max, record) => Math.max(max, record.value), 0)
  const overdueCount = records.filter((record) => isBeforeToday(record.dueDate)).length

  return {
    totalValue,
    protestedValue,
    registryValue,
    titleCount: records.length,
    averageTicket: records.length > 0 ? totalValue / records.length : 0,
    maxTitleValue,
    overdueCount,
    openCount: records.length - overdueCount,
  }
}

function groupByMonth(records: ProtestTitle[], dateSelector: (record: ProtestTitle) => string | null): TimeSeriesPoint[] {
  const groups = new Map<string, TimeSeriesPoint>()

  records.forEach((record) => {
    const monthKey = monthKeyFromISO(dateSelector(record))

    if (!monthKey) {
      return
    }

    const current = groups.get(monthKey) ?? {
      label: formatMonthLabel(monthKey),
      dateKey: monthKey,
      valor: 0,
      titulos: 0,
    }

    current.valor += record.value
    current.titulos += 1
    groups.set(monthKey, current)
  })

  return Array.from(groups.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}

function groupRanking(records: ProtestTitle[], selector: (record: ProtestTitle) => string, limit?: number): RankingPoint[] {
  const groups = new Map<string, RankingPoint>()

  records.forEach((record) => {
    const name = selector(record) || 'Nao informado'
    const current = groups.get(name) ?? { name, valor: 0, titulos: 0 }

    current.valor += record.value
    current.titulos += 1
    groups.set(name, current)
  })

  const sorted = Array.from(groups.values()).sort((a, b) => b.valor - a.valor)

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

function buildStatusDistribution(records: ProtestTitle[]): StatusDistributionPoint[] {
  const statuses: ProtestStatus[] = ['Protestado', 'Em Cartório']

  return statuses.map((status) => {
    const scoped = records.filter((record) => record.status === status)

    return {
      status,
      valor: scoped.reduce((sum, record) => sum + record.value, 0),
      titulos: scoped.length,
    }
  })
}

export function useDashboardAnalytics(records: ProtestTitle[], filters: DashboardFilters): DashboardAnalytics {
  return useMemo(() => {
    const filteredRecords = applyFilters(records, filters)
    const accounts = Array.from(new Set(records.map((record) => record.account).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )

    return {
      filteredRecords: filteredRecords.sort((a, b) => sortISODate(a.dueDate, b.dueDate)),
      accounts,
      metrics: calculateMetrics(filteredRecords),
      temporalEvolution: groupByMonth(filteredRecords, (record) => record.issueDate),
      statusDistribution: buildStatusDistribution(filteredRecords),
      topDebtors: groupRanking(filteredRecords, (record) => record.debtor, 8),
      accountValues: groupRanking(filteredRecords, (record) => record.account),
      dueCurve: groupByMonth(filteredRecords, (record) => record.dueDate),
    }
  }, [filters, records])
}
