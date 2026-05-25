import type { ProtestTitle } from '../types/dashboard'
import { formatDate } from './date'

const CSV_HEADERS = [
  'Cart',
  'Conta',
  'Emissao',
  'Vencto',
  'Vcto Original',
  'Doc',
  'Sacado',
  'Valor',
  'Carimbo',
  'Status',
]

function escapeCsvCell(value: string | number): string {
  const cell = String(value)

  if (/[;"\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`
  }

  return cell
}

export function buildTitlesCsv(records: ProtestTitle[]): string {
  const rows = records.map((record) => [
    record.cart,
    record.account,
    formatDate(record.issueDate),
    formatDate(record.dueDate),
    formatDate(record.originalDueDate),
    record.document,
    record.debtor,
    record.value.toFixed(2).replace('.', ','),
    record.stamp,
    record.status,
  ])

  const csv = [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(';'))
    .join('\n')

  return `\ufeff${csv}`
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
