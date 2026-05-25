import { useContext } from 'react'
import { DashboardDataContext } from '../context/dashboardDataContextValue'

export function useDashboardData() {
  const context = useContext(DashboardDataContext)

  if (!context) {
    throw new Error('useDashboardData deve ser usado dentro de DashboardDataProvider.')
  }

  return context
}
