import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { parseWorkbookFile } from '../services/excelParser'
import {
  clearDashboardData,
  loadPersistedDashboardData,
  saveDashboardData,
  type PersistedDashboardData,
} from '../services/storage'
import { DashboardDataContext, type DashboardDataContextValue } from './dashboardDataContextValue'

const emptyPersistedData: PersistedDashboardData = {
  records: [],
  issues: [],
  fileName: '',
  sheetName: '',
  importedAt: '',
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedDashboardData>(() => loadPersistedDashboardData() ?? emptyPersistedData)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState('')

  const importFile = useCallback(async (file: File) => {
    setIsParsing(true)
    setError('')

    try {
      const parsed = await parseWorkbookFile(file)
      const nextData: PersistedDashboardData = {
        records: parsed.records,
        issues: parsed.issues,
        fileName: file.name,
        sheetName: parsed.sheetName,
        importedAt: new Date().toISOString(),
      }

      setData(nextData)
      saveDashboardData(nextData)
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Nao foi possivel processar a planilha.'
      setError(message)
    } finally {
      setIsParsing(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setData(emptyPersistedData)
    setError('')
    clearDashboardData()
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
