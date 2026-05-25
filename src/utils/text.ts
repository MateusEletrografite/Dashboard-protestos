export function normalizeCellText(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeHeader(value: unknown): string {
  return normalizeCellText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function includesNormalized(source: string, query: string): boolean {
  const normalizedSource = source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const normalizedQuery = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  return normalizedQuery.length === 0 || normalizedSource.includes(normalizedQuery)
}
