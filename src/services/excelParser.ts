import type { ParsedWorkbook, ParserIssue, ProtestStatus, ProtestTitle } from '../types/dashboard'
import { parseBrazilianCurrency } from '../utils/currency'
import { toISODate } from '../utils/date'
import { normalizeCellText, normalizeHeader } from '../utils/text'

type FieldKey = 'cart' | 'account' | 'issueDate' | 'dueDate' | 'originalDueDate' | 'document' | 'debtor' | 'value' | 'stamp'
type XLSXModule = typeof import('xlsx')

const HEADER_ALIASES: Record<FieldKey, string[]> = {
  cart: ['cart'],
  account: ['conta'],
  issueDate: ['emissao'],
  dueDate: ['vencto', 'vencimento'],
  originalDueDate: ['vctooriginal', 'vencimentooriginal'],
  document: ['doc', 'documento'],
  debtor: ['sacado', 'cliente', 'devedor'],
  value: ['valor'],
  stamp: ['carimbo', 'status'],
}

const REQUIRED_FIELDS: FieldKey[] = ['cart', 'account', 'issueDate', 'dueDate', 'document', 'debtor', 'value', 'stamp']

function isEmptyRow(row: unknown[]): boolean {
  return row.every((cell) => normalizeCellText(cell).length === 0)
}

function resolveHeaderMap(rows: unknown[][]): { headerRowIndex: number; columns: Record<FieldKey, number> } | null {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 20); rowIndex += 1) {
    const normalizedHeaders = rows[rowIndex].map(normalizeHeader)
    const columns = {} as Record<FieldKey, number>

    Object.entries(HEADER_ALIASES).forEach(([field, aliases]) => {
      const columnIndex = normalizedHeaders.findIndex((header) => aliases.includes(header))

      if (columnIndex >= 0) {
        columns[field as FieldKey] = columnIndex
      }
    })

    const matchedRequired = REQUIRED_FIELDS.filter((field) => columns[field] !== undefined)

    if (matchedRequired.length === REQUIRED_FIELDS.length) {
      return { headerRowIndex: rowIndex, columns }
    }
  }

  return null
}

function parseDateString(value: string, xlsx: XLSXModule): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const serial = Number(trimmed.replace(',', '.'))

  if (Number.isFinite(serial) && serial > 0) {
    return parseExcelSerialDate(serial, xlsx)
  }

  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed)

  if (isoMatch) {
    return buildISODate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]))
  }

  const brMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(trimmed)

  if (brMatch) {
    const yearToken = Number(brMatch[3])
    const year = yearToken < 100 ? (yearToken >= 70 ? 1900 + yearToken : 2000 + yearToken) : yearToken

    return buildISODate(year, Number(brMatch[2]), Number(brMatch[1]))
  }

  return null
}

function parseExcelSerialDate(serial: number, xlsx: XLSXModule): string | null {
  const parsed = xlsx.SSF.parse_date_code(serial)

  if (!parsed) {
    return null
  }

  return buildISODate(parsed.y, parsed.m, parsed.d)
}

function buildISODate(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) {
    return null
  }

  const date = new Date(year, month - 1, day)
  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isValid ? toISODate(date) : null
}

function parseDateCell(value: unknown, rowNumber: number, field: string, issues: ParserIssue[], xlsx: XLSXModule): string | null {
  if (value === null || value === undefined || normalizeCellText(value) === '') {
    return null
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toISODate(value)
  }

  if (typeof value === 'number') {
    const parsed = parseExcelSerialDate(value, xlsx)

    if (parsed) {
      return parsed
    }
  }

  const parsed = parseDateString(normalizeCellText(value), xlsx)

  if (!parsed) {
    issues.push({
      rowNumber,
      field,
      message: 'Data invalida ou em formato nao reconhecido.',
    })
  }

  return parsed
}

function deriveStatus(stamp: string): ProtestStatus {
  const normalized = normalizeHeader(stamp)

  return normalized.includes('protest') ? 'Protestado' : 'Em Cartório'
}

function cell(row: unknown[], index: number | undefined): unknown {
  return index === undefined ? '' : row[index]
}

function buildRecord(
  row: unknown[],
  rowNumber: number,
  columns: Record<FieldKey, number>,
  issues: ParserIssue[],
  xlsx: XLSXModule,
): ProtestTitle | null {
  const cart = normalizeCellText(cell(row, columns.cart))
  const account = normalizeCellText(cell(row, columns.account))
  const document = normalizeCellText(cell(row, columns.document))
  const debtor = normalizeCellText(cell(row, columns.debtor))
  const stamp = normalizeCellText(cell(row, columns.stamp))
  const rawValue = cell(row, columns.value)
  const value = parseBrazilianCurrency(rawValue)

  if (!document && !debtor && value === 0) {
    return null
  }

  if (!document) {
    issues.push({ rowNumber, field: 'Doc.', message: 'Documento ausente.' })
  }

  if (!debtor) {
    issues.push({ rowNumber, field: 'Sacado', message: 'Sacado ausente.' })
  }

  if (value === 0 && normalizeCellText(rawValue) === '') {
    issues.push({ rowNumber, field: 'Valor', message: 'Valor ausente.' })
  }

  const issueDate = parseDateCell(cell(row, columns.issueDate), rowNumber, 'Emissão', issues, xlsx)
  const dueDate = parseDateCell(cell(row, columns.dueDate), rowNumber, 'Vencto.', issues, xlsx)
  const originalDueDate = parseDateCell(cell(row, columns.originalDueDate), rowNumber, 'Vcto Original.', issues, xlsx)

  return {
    id: `${rowNumber}-${document || debtor}-${value}`,
    rowNumber,
    cart,
    account,
    issueDate,
    dueDate,
    originalDueDate,
    document,
    debtor,
    value,
    stamp,
    status: deriveStatus(stamp),
  }
}

export async function parseWorkbookFile(file: File): Promise<ParsedWorkbook> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension !== 'xlsx' && extension !== 'xls') {
    throw new Error('Envie uma planilha Excel nos formatos .xlsx ou .xls.')
  }

  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { cellDates: true })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error('A planilha nao possui abas para leitura.')
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  })

  const headerMap = resolveHeaderMap(rows)

  if (!headerMap) {
    throw new Error('Nao foi possivel localizar as colunas obrigatorias da planilha.')
  }

  const issues: ParserIssue[] = []
  const records = rows
    .slice(headerMap.headerRowIndex + 1)
    .flatMap((row, index) => {
      if (isEmptyRow(row)) {
        return []
      }

      const record = buildRecord(row, headerMap.headerRowIndex + index + 2, headerMap.columns, issues, XLSX)

      return record ? [record] : []
    })

  return {
    records,
    issues,
    sheetName,
  }
}
