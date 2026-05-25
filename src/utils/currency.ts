export function parseBrazilianCurrency(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (value === null || value === undefined) {
    return 0
  }

  const raw = String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/[^\d,.-]/g, '')
    .trim()

  if (!raw) {
    return 0
  }

  const hasComma = raw.includes(',')
  const normalized = hasComma ? raw.replace(/\./g, '').replace(',', '.') : raw
  const parsed = Number.parseFloat(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}
