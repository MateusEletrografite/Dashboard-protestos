import { useMemo } from 'react'
import type {
  DashboardAnalytics,
  DashboardFilters,
  DashboardMetrics,
  DelinquencySnapshot,
  DelinquencyTrendPoint,
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

function isDelinquent(record: ProtestTitle): boolean {
  return record.status === 'Protestado' || record.status === 'Em Cartório'
}

function calculateMetrics(records: ProtestTitle[]): DashboardMetrics {
  const totalValue = records.reduce((sum, record) => sum + record.value, 0)
  const protestedValue = records.filter((record) => record.status === 'Protestado').reduce((sum, record) => sum + record.value, 0)
  const registryValue = records.filter((record) => record.status === 'Em Cartório').reduce((sum, record) => sum + record.value, 0)
  const otherStatusValue = totalValue - protestedValue - registryValue
  const delinquencyValue = protestedValue + registryValue
  const maxTitleValue = records.reduce((max, record) => Math.max(max, record.value), 0)
  const overdueCount = records.filter((record) => isBeforeToday(record.dueDate)).length

  return {
    totalValue,
    protestedValue,
    registryValue,
    otherStatusValue,
    delinquencyValue,
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

    const current = groups.get(monthKey) ?? { label: formatMonthLabel(monthKey), dateKey: monthKey, valor: 0, titulos: 0 }

    current.valor += record.value
    current.titulos += 1
    groups.set(monthKey, current)
  })

  return Array.from(groups.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}

function buildDelinquencyTrend(records: ProtestTitle[]): DelinquencyTrendPoint[] {
  const points = groupByMonth(records.filter(isDelinquent), (record) => record.dueDate)

  return points.map((point, index) => {
    const previous = points[index - 1]
    const variation = previous && previous.valor > 0 ? ((point.valor - previous.valor) / previous.valor) * 100 : null

    return {
      label: point.label,
      dateKey: point.dateKey,
      inadimplencia: point.valor,
      titulos: point.titulos,
      variacao: variation,
    }
  })
}

function buildDelinquencySnapshot(trend: DelinquencyTrendPoint[]): DelinquencySnapshot {
  if (trend.length === 0) {
    return {
      currentMonthLabel: '-',
      previousMonthLabel: '-',
      currentValue: 0,
      previousValue: 0,
      variationPercent: 0,
      variationValue: 0,
      peakValue: 0,
      peakMonthLabel: '-',
      dropFromPeakPercent: 0,
    }
  }

  const current = trend[trend.length - 1]
  const previous = trend[trend.length - 2] ?? current
  const peak = trend.reduce((max, point) => (point.inadimplencia > max.inadimplencia ? point : max), trend[0])
  const variationValue = current.inadimplencia - previous.inadimplencia
  const variationPercent = previous.inadimplencia > 0 ? (variationValue / previous.inadimplencia) * 100 : 0
  const dropFromPeakPercent = peak.inadimplencia > 0 ? ((peak.inadimplencia - current.inadimplencia) / peak.inadimplencia) * 100 : 0

  return {
    currentMonthLabel: current.label,
    previousMonthLabel: previous.label,
    currentValue: current.inadimplencia,
    previousValue: previous.inadimplencia,
    variationPercent,
    variationValue,
    peakValue: peak.inadimplencia,
    peakMonthLabel: peak.label,
    dropFromPeakPercent,
  }
}

function groupRanking(records: ProtestTitle[], selector: (record: ProtestTitle) => string, limit?: number): RankingPoint[] {
  const groups = new Map<string, RankingPoint>()

  records.forEach((record) => {
    const name = selector(record)
    const current = groups.get(name) ?? { name, valor: 0, titulos: 0 }

    current.valor += record.value
    current.titulos += 1
    groups.set(name, current)
  })

  const sorted = Array.from(groups.values()).sort((a, b) => b.valor - a.valor)

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

function buildStatusDistribution(records: ProtestTitle[]): StatusDistributionPoint[] {
  return groupRanking(records, (record) => record.status).map((point) => ({
    status: point.name,
    valor: point.valor,
    titulos: point.titulos,
  }))
}

export function useDashboardAnalytics(records: ProtestTitle[], filters: DashboardFilters): DashboardAnalytics {
  return useMemo(() => {
    const filteredRecords = applyFilters(records, filters)
    const delinquencyTrend = buildDelinquencyTrend(filteredRecords)
    const accounts = Array.from(new Set(records.map((record) => record.account).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
    const statuses = Array.from(new Set(records.map((record) => record.status).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )

    return {
      filteredRecords: [...filteredRecords].sort((a, b) => sortISODate(a.dueDate, b.dueDate)),
      accounts,
      statuses,
      metrics: calculateMetrics(filteredRecords),
      temporalEvolution: groupByMonth(filteredRecords, (record) => record.issueDate),
      statusDistribution: buildStatusDistribution(filteredRecords),
      topDebtors: groupRanking(filteredRecords, (record) => record.debtor, 10),
      accountValues: groupRanking(filteredRecords, (record) => record.account),
      dueCurve: groupByMonth(filteredRecords, (record) => record.dueDate),
      delinquencyTrend,
      delinquencySnapshot: buildDelinquencySnapshot(delinquencyTrend),
    }
  }, [filters, records])
}
