const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) {
    return 'Nao preenchida na planilha'
  }

  const [year, month, day] = isoDate.split('-')

  if (!year || !month || !day) {
    return 'Nao preenchida na planilha'
  }

  return `${day}/${month}/${year}`
}

export function monthKeyFromISO(isoDate: string | null): string | null {
  if (!isoDate) {
    return null
  }

  const [year, month] = isoDate.split('-')

  if (!year || !month) {
    return null
  }

  return `${year}-${month}`
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const monthIndex = Number(month) - 1

  if (!year || monthIndex < 0 || monthIndex > 11) {
    return monthKey
  }

  return `${MONTH_LABELS[monthIndex]}/${year.slice(2)}`
}

export function isBeforeToday(isoDate: string | null): boolean {
  if (!isoDate) {
    return false
  }

  return isoDate < toISODate(new Date())
}

export function sortISODate(a: string | null, b: string | null): number {
  if (!a && !b) {
    return 0
  }

  if (!a) {
    return 1
  }

  if (!b) {
    return -1
  }

  return a.localeCompare(b)
}
