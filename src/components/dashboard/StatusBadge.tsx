import type { ProtestStatus } from '../../types/dashboard'

const statusClassName: Record<ProtestStatus, string> = {
  Protestado: 'border-finance-red/20 bg-finance-red/10 text-finance-red',
  'Em Cartório': 'border-finance-blue/20 bg-finance-blue/10 text-finance-blue',
}

export function StatusBadge({ status }: { status: ProtestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClassName[status]}`}>
      {status}
    </span>
  )
}
