import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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

function percentTooltip(value: unknown) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '-'
  }

  return `${number.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

function truncateLabel(label: string): string {
  return label.length > 22 ? `${label.slice(0, 21)}...` : label
}

export function ChartsGrid({ analytics }: ChartsGridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <ChartCard title="Queda da inadimplência" subtitle="Evolução mensal de títulos protestados e em cartório por vencimento">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={analytics.delinquencyTrend} margin={{ left: 8, right: 18, top: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="delinquencyArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.red} stopOpacity={0.24} />
                  <stop offset="95%" stopColor={chartColors.red} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: chartColors.slate }} />
              <YAxis
                yAxisId="valor"
                tickLine={false}
                axisLine={false}
                width={78}
                tick={{ fontSize: 12, fill: chartColors.slate }}
                tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
              />
              <YAxis
                yAxisId="percentual"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 12, fill: chartColors.slate }}
                tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'variacao') return percentTooltip(value)
                  if (name === 'titulos') return integerTooltip(value)
                  return currencyTooltip(value)
                }}
                labelClassName="font-semibold"
              />
              <Legend iconType="circle" formatter={(value) => <span className="text-sm text-ink-body">{value}</span>} />
              <Area
                yAxisId="valor"
                type="monotone"
                dataKey="inadimplencia"
                name="Inadimplência"
                stroke={chartColors.red}
                strokeWidth={2.4}
                fill="url(#delinquencyArea)"
              />
              <Bar yAxisId="valor" dataKey="titulos" name="Títulos" fill={chartColors.slate} radius={[4, 4, 0, 0]} barSize={18} />
              <Line
                yAxisId="percentual"
                type="monotone"
                dataKey="variacao"
                name="Variação mensal"
                stroke={chartColors.green}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="xl:col-span-2">
        <ChartCard title="Inadimplência mensal em colunas" subtitle="Valor em atraso por mês de vencimento, considerando protestados e títulos em cartório">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.delinquencyTrend} margin={{ left: 8, right: 18, top: 18, bottom: 4 }}>
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
              <Legend iconType="circle" formatter={() => <span className="text-sm text-ink-body">Valor inadimplente</span>} />
              <Bar dataKey="inadimplencia" name="Valor inadimplente" radius={[6, 6, 0, 0]} barSize={44}>
                {analytics.delinquencyTrend.map((entry, index) => {
                  const previous = analytics.delinquencyTrend[index - 1]
                  const isFalling = previous ? entry.inadimplencia < previous.inadimplencia : false

                  return <Cell key={entry.dateKey} fill={isFalling ? chartColors.green : chartColors.red} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

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
            <Area type="monotone" dataKey="valor" name="Valor emitido" stroke={chartColors.blue} strokeWidth={2.2} fill="url(#valueArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição por status" subtitle="Participação financeira e volume de títulos">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={analytics.statusDistribution} dataKey="valor" nameKey="status" innerRadius={58} outerRadius={90} paddingAngle={4}>
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
            <Bar dataKey="valor" name="Valor" fill={chartColors.teal} radius={[0, 4, 4, 0]} barSize={16} />
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
            <Bar dataKey="valor" name="Valor" fill={chartColors.blue} radius={[4, 4, 0, 0]} barSize={28} />
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
              <Area type="monotone" dataKey="valor" name="Valor" stroke={chartColors.amber} strokeWidth={2.2} fill="url(#dueArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
