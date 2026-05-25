export type ProtestStatus = string

export interface ProtestTitle {
  id: string
  rowNumber: number
  cart: string
  account: string
  issueDate: string | null
  dueDate: string | null
  originalDueDate: string | null
  document: string
  debtor: string
  value: number
  stamp: string
  status: ProtestStatus
}

export interface ParserIssue {
  rowNumber: number
  field: string
  message: string
}

export interface ImportSummary {
  worksheetRows: number
  importedRows: number
  skippedEmptyRows: number
  skippedSummaryRows: number
  skippedInvalidRows: number
  sheetTotalValue: number | null
  calculatedTotalValue: number
  totalMatchesSheet: boolean | null
}

export interface ParsedWorkbook {
  records: ProtestTitle[]
  issues: ParserIssue[]
  sheetName: string
  summary: ImportSummary
}

export interface DashboardFilters {
  issueDateFrom: string
  issueDateTo: string
  account: string
  status: 'Todos' | ProtestStatus
  debtor: string
  document: string
}

export interface DashboardMetrics {
  totalValue: number
  protestedValue: number
  registryValue: number
  otherStatusValue: number
  titleCount: number
  averageTicket: number
  maxTitleValue: number
  overdueCount: number
  openCount: number
}

export interface TimeSeriesPoint {
  label: string
  dateKey: string
  valor: number
  titulos: number
}

export interface StatusDistributionPoint {
  status: ProtestStatus
  valor: number
  titulos: number
}

export interface RankingPoint {
  name: string
  valor: number
  titulos: number
}

export interface DashboardAnalytics {
  filteredRecords: ProtestTitle[]
  accounts: string[]
  statuses: ProtestStatus[]
  metrics: DashboardMetrics
  temporalEvolution: TimeSeriesPoint[]
  statusDistribution: StatusDistributionPoint[]
  topDebtors: RankingPoint[]
  accountValues: RankingPoint[]
  dueCurve: TimeSeriesPoint[]
}

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: keyof ProtestTitle
  direction: SortDirection
}
