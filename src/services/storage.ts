import type { ImportSummary, ParserIssue, ProtestTitle } from '../types/dashboard'

const STORAGE_KEY = 'dashboard-protestos:workbook:v4'

export interface PersistedDashboardData {
  records: ProtestTitle[]
  issues: ParserIssue[]
  fileName: string
  sheetName: string
  importedAt: string
  summary: ImportSummary
}

function canUseLocalStorage(): boolean {
  try {
    const probe = '__dashboard_probe__'
    window.localStorage.setItem(probe, probe)
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function loadPersistedDashboardData(): PersistedDashboardData | null {
  if (!canUseLocalStorage()) {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PersistedDashboardData

    if (!Array.isArray(parsed.records)) {
      return null
    }

    return parsed
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveDashboardData(data: PersistedDashboardData): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearDashboardData(): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem('dashboard-protestos:workbook:v1')
  window.localStorage.removeItem('dashboard-protestos:workbook:v2')
  window.localStorage.removeItem('dashboard-protestos:workbook:v3')
}
