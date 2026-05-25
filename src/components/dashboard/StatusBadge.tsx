import type { ProtestStatus } from '../../types/dashboard'

const statusClassName: Record<string, string> = {
  Protestado: 'border-finance-red/20 bg-finance-red/10 text-finance-red',
  'Em Cartório': 'border-finance-blue/20 bg-finance-blue/10 text-finance-blue',
  Aberto: 'border-finance-green/20 bg-finance-green/10 text-finance-green',
  'Corrigido Vencimento': 'border-finance-amber/20 bg-finance-amber/10 text-finance-amber',
  'Sem status': 'border-slate-300 bg-slate-100 text-slate-600',
}

export function StatusBadge({ status }: { status: ProtestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClassName[status] ?? 'border-slate-300 bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}
