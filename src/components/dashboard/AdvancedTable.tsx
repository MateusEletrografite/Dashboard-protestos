import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ProtestTitle, SortState } from '../../types/dashboard'
import { buildTitlesCsv, downloadTextFile } from '../../utils/csv'
import { formatDate } from '../../utils/date'
import { currencyFormatter, integerFormatter } from '../../utils/formatters'
import { includesNormalized } from '../../utils/text'
import { StatusBadge } from './StatusBadge'

interface AdvancedTableProps {
  records: ProtestTitle[]
}

const columns: Array<{ key: keyof ProtestTitle; label: string; align?: 'right' }> = [
  { key: 'dueDate', label: 'Vencimento' },
  { key: 'issueDate', label: 'Emissão' },
  { key: 'account', label: 'Conta' },
  { key: 'document', label: 'Doc.' },
  { key: 'debtor', label: 'Sacado' },
  { key: 'status', label: 'Status' },
  { key: 'value', label: 'Valor', align: 'right' },
]

function compareRecords(a: ProtestTitle, b: ProtestTitle, sort: SortState): number {
  const left = a[sort.key]
  const right = b[sort.key]

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }

  return String(left ?? '').localeCompare(String(right ?? ''), 'pt-BR', { numeric: true })
}

function sortIcon(sort: SortState, key: keyof ProtestTitle) {
  if (sort.key !== key) {
    return <ArrowUpDown size={14} />
  }

  return sort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
}

export function AdvancedTable({ records }: AdvancedTableProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [sort, setSort] = useState<SortState>({ key: 'dueDate', direction: 'asc' })

  const visibleRecords = useMemo(() => {
    const searched = records.filter((record) => {
      const haystack = `${record.document} ${record.debtor} ${record.account} ${record.status} ${record.cart}`

      return includesNormalized(haystack, query)
    })

    return [...searched].sort((a, b) => {
      const result = compareRecords(a, b, sort)

      return sort.direction === 'asc' ? result : -result
    })
  }, [query, records, sort])

  const pageCount = Math.max(1, Math.ceil(visibleRecords.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRecords = visibleRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key: keyof ProtestTitle) => {
    setPage(1)
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const exportCsv = () => {
    downloadTextFile('titulos-protestos.csv', buildTitlesCsv(visibleRecords), 'text/csv;charset=utf-8')
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col justify-between gap-3 border-b border-surface-line p-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-base font-semibold text-ink-strong">Títulos</h2>
          <p className="mt-1 text-sm text-ink-muted">{integerFormatter.format(visibleRecords.length)} registros tabulados</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-72">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              className="field pl-9"
              value={query}
              placeholder="Buscar na tabela"
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-surface-line bg-white px-3 text-sm font-semibold text-ink-body transition hover:border-finance-blue/30 hover:text-finance-blue"
            onClick={exportCsv}
          >
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-4 py-3 font-semibold text-ink-muted ${column.align === 'right' ? 'text-right' : ''}`}>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 transition hover:text-finance-blue ${
                      column.align === 'right' ? 'ml-auto' : ''
                    }`}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {sortIcon(sort, column.key)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRecords.length > 0 ? (
              pageRecords.map((record) => (
                <tr key={record.id} className="border-t border-surface-line bg-white transition hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-body">{formatDate(record.dueDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-body">{formatDate(record.issueDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-body">{record.account || 'Nao informado'}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-strong">{record.document || 'Nao informado'}</td>
                  <td className="max-w-[340px] px-4 py-3 text-ink-body">
                    <span className="block truncate" title={record.debtor}>
                      {record.debtor || 'Nao informado'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-strong">
                    {currencyFormatter.format(record.value)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-ink-muted" colSpan={columns.length}>
                  Nenhum título encontrado para os critérios atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-surface-line p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <span>Linhas</span>
          <select
            className="field h-9 w-20"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
          >
            {[12, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-ink-muted">
            Página {currentPage} de {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" className="icon-button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
