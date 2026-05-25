import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartColors } from '../../data/chartColors'
import type { DashboardAnalytics } from '../../types/dashboard'
import { compactCurrencyFormatter, currencyFormatter, integerFormatter } from '../../utils/formatters'
import { ChartCard } from './ChartCard'

interface ChartsGridProps {
  analytics: DashboardAnalytics
}

const statusColors: Record<string, string> = {
  Protestado: chartColors.red,
  'Em Cartório': chartColors.blue,
  Aberto: chartColors.green,
  'Corrigido Vencimento': chartColors.amber,
  'Sem status': chartColors.slate,
}

function statusColor(status: string): string {
  return statusColors[status] ?? chartColors.teal
}

function currencyTooltip(value: unknown) {
  return currencyFormatter.format(Number(value) || 0)
}

function integerTooltip(value: unknown) {
  return integerFormatter.format(Number(value) || 0)
}

function truncateLabel(label: string): string {
  return label.length > 22 ? `${label.slice(0, 21)}...` : label
}

export function ChartsGrid({ analytics }: ChartsGridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Evolução temporal" subtitle="Valor emitido por mês de emissão">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.temporalEvolution} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="valueArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={chartColors.blue} stopOpacity={0.22} />
                <stop offset="95%" stopColor={chartColors.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: chartColors.slate }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={78}
              tick={{ fontSize: 12, fill: chartColors.slate }}
              tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
            />
            <Tooltip formatter={(value) => currencyTooltip(value)} labelClassName="font-semibold" />
            <Area type="monotone" dataKey="valor" stroke={chartColors.blue} strokeWidth={2.2} fill="url(#valueArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição por status" subtitle="Participação financeira e volume de títulos">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={analytics.statusDistribution}
              dataKey="valor"
              nameKey="status"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={4}
            >
              {analytics.statusDistribution.map((entry) => (
                <Cell key={entry.status} fill={statusColor(entry.status)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => currencyTooltip(value)} />
            <Legend iconType="circle" formatter={(value) => <span className="text-sm text-ink-body">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top sacados" subtitle="Maiores saldos por sacado na visão filtrada">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.topDebtors} layout="vertical" margin={{ left: 18, right: 18, top: 6, bottom: 4 }}>
            <CartesianGrid stroke={chartColors.grid} horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: chartColors.slate }}
              tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: chartColors.slate }}
              tickFormatter={truncateLabel}
            />
            <Tooltip formatter={(value) => currencyTooltip(value)} />
            <Bar dataKey="valor" fill={chartColors.teal} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Valores por conta" subtitle="Concentração financeira por carteira">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.accountValues} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
            <CartesianGrid stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: chartColors.slate }}
              tickFormatter={truncateLabel}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={78}
              tick={{ fontSize: 12, fill: chartColors.slate }}
              tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
            />
            <Tooltip formatter={(value, name) => (name === 'titulos' ? integerTooltip(value) : currencyTooltip(value))} />
            <Bar dataKey="valor" fill={chartColors.blue} radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="xl:col-span-2">
        <ChartCard title="Curva de vencimentos" subtitle="Distribuição mensal por data de vencimento">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.dueCurve} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="dueArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.amber} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={chartColors.amber} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: chartColors.slate }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={78}
                tick={{ fontSize: 12, fill: chartColors.slate }}
                tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
              />
              <Tooltip formatter={(value) => currencyTooltip(value)} />
              <Area type="monotone" dataKey="valor" stroke={chartColors.amber} strokeWidth={2.2} fill="url(#dueArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
