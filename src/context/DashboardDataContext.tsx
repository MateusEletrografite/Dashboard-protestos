import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { parseWorkbookFile } from '../services/excelParser'
import {
  clearDashboardData,
  loadPersistedDashboardData,
  saveDashboardData,
  type PersistedDashboardData,
} from '../services/storage'
import { DashboardDataContext, type DashboardDataContextValue } from './dashboardDataContextValue'

const DEFAULT_WORKBOOK_PATH = './RELATORIO_DIARIO_SEM_TST.xlsx'
const DEFAULT_WORKBOOK_NAME = 'RELATORIO_DIARIO_SEM_TST.xlsx'
const DEMO_LOAD_BLOCK_KEY = 'dashboard-protestos:demo-load-blocked'

const emptyPersistedData: PersistedDashboardData = {
  records: [],
  issues: [],
  fileName: '',
  sheetName: '',
  importedAt: '',
  summary: {
    worksheetRows: 0,
    importedRows: 0,
    skippedEmptyRows: 0,
    skippedSummaryRows: 0,
    skippedInvalidRows: 0,
    sheetTotalValue: null,
    calculatedTotalValue: 0,
    totalMatchesSheet: null,
  },
}

function canUseSessionStorage(): boolean {
  try {
    const probe = '__dashboard_session_probe__'
    window.sessionStorage.setItem(probe, probe)
    window.sessionStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function hasBlockedDefaultLoad(): boolean {
  return canUseSessionStorage() && window.sessionStorage.getItem(DEMO_LOAD_BLOCK_KEY) === 'true'
}

function blockDefaultLoad(): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(DEMO_LOAD_BLOCK_KEY, 'true')
  }
}

function unblockDefaultLoad(): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(DEMO_LOAD_BLOCK_KEY)
  }
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedDashboardData>(() => loadPersistedDashboardData() ?? emptyPersistedData)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState('')

  const applyParsedFile = useCallback(async (file: File) => {
    const parsed = await parseWorkbookFile(file)
    const nextData: PersistedDashboardData = {
      records: parsed.records,
      issues: parsed.issues,
      fileName: file.name,
      sheetName: parsed.sheetName,
      importedAt: new Date().toISOString(),
      summary: parsed.summary,
    }

    setData(nextData)
    saveDashboardData(nextData)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadDefaultWorkbook() {
      if (data.records.length > 0 || hasBlockedDefaultLoad()) {
        return
      }

      setIsParsing(true)
      setError('')

      try {
        const response = await fetch(DEFAULT_WORKBOOK_PATH, { cache: 'no-store' })

        if (!response.ok) {
          throw new Error('Nao foi possivel carregar a base demonstrativa do dashboard.')
        }

        const blob = await response.blob()
        const file = new File([blob], DEFAULT_WORKBOOK_NAME, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        if (isMounted) {
          await applyParsedFile(file)
        }
      } catch (unknownError) {
        if (isMounted) {
          const message = unknownError instanceof Error ? unknownError.message : 'Nao foi possivel carregar a base inicial.'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsParsing(false)
        }
      }
    }

    void loadDefaultWorkbook()

    return () => {
      isMounted = false
    }
  }, [applyParsedFile, data.records.length])

  const importFile = useCallback(async (file: File) => {
    setIsParsing(true)
    setError('')
    unblockDefaultLoad()

    try {
      await applyParsedFile(file)
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Nao foi possivel processar a planilha.'
      setError(message)
    } finally {
      setIsParsing(false)
    }
  }, [applyParsedFile])

  const clearData = useCallback(() => {
    setData(emptyPersistedData)
    setError('')
    clearDashboardData()
    blockDefaultLoad()
  }, [])

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      ...data,
      isParsing,
      error,
      hasData: data.records.length > 0,
      importFile,
      clearData,
    }),
    [clearData, data, error, importFile, isParsing],
  )

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}
