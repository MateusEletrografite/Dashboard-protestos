import type { DashboardFilters } from '../types/dashboard'

export const DEFAULT_FILTERS: DashboardFilters = {
  issueDateFrom: '',
  issueDateTo: '',
  account: 'Todas',
  status: 'Todos',
  debtor: '',
  document: '',
}

export const STATUS_OPTIONS = ['Todos', 'Protestado', 'Em Cartório'] as const
