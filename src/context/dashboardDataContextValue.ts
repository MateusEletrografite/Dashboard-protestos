import { createContext } from 'react'
import type { ImportSummary, ParserIssue, ProtestTitle } from '../types/dashboard'

export interface DashboardDataContextValue {
  records: ProtestTitle[]
  issues: ParserIssue[]
  fileName: string
  sheetName: string
  importedAt: string
  summary: ImportSummary
  isParsing: boolean
  error: string
  hasData: boolean
  importFile: (file: File) => Promise<void>
  clearData: () => void
}

export const DashboardDataContext = createContext<DashboardDataContextValue | null>(null)
