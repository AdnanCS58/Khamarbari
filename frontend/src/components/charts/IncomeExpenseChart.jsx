import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

const cssVar = (name, fallback) =>
  typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback

// Theme-aligned palette:
// - Income  = crop green (growth, yield, harvest)
// - Expense = harvest amber (investment, cost, soil) — warm, on-theme, not alarm-y
const COLORS = {
  income:  cssVar('--color-forest-500', '#10B981'),
  expense: cssVar('--color-warn-500',   '#F59E0B'),
  grid:    cssVar('--color-cream-200',  '#E2E8F0'),
  axis:    cssVar('--color-slate-mid',  '#475569'),
  border:  cssVar('--color-cream-200',  '#E2E8F0'),
  ink:     cssVar('--color-slate-ink',  '#0F172A'),
  muted:   cssVar('--color-slate-soft', '#94A3B8'),
}

export default function IncomeExpenseChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 8, bottom: 4, left: -16 }}
        barGap={4}
        barCategoryGap="24%"
      >
        <defs>
          {/* Subtle top-lit gradient — gives bars a physical, "engineered" feel */}
          <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={COLORS.income} stopOpacity={1} />
            <stop offset="100%" stopColor={COLORS.income} stopOpacity={0.75} />
          </linearGradient>
          <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={COLORS.expense} stopOpacity={1} />
            <stop offset="100%" stopColor={COLORS.expense} stopOpacity={0.75} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="2 6"
          stroke={COLORS.grid}
          vertical={false}
        />

        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: COLORS.muted, fontSize: 11, fontWeight: 500 }}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          width={56}
          tick={{ fill: COLORS.muted, fontSize: 11, fontWeight: 500 }}
          tickFormatter={(v) => `৳${v >= 1000 ? `${v / 1000}k` : v}`}
        />

        <Tooltip
          cursor={{ fill: 'rgba(16,185,129,0.05)', radius: 6 }}
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            fontSize: 12,
            padding: '10px 12px',
            boxShadow: '0 12px 32px rgba(6,28,21,0.10), 0 2px 6px rgba(6,28,21,0.06)',
            background: '#fff',
          }}
          labelStyle={{
            color: COLORS.ink,
            fontWeight: 600,
            marginBottom: 6,
            fontSize: 12,
          }}
          itemStyle={{ padding: '2px 0' }}
          formatter={(v, name) => [`৳${v.toLocaleString()}`, name]}
        />

        <Legend
          wrapperStyle={{ fontSize: 12, color: COLORS.axis, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
          align="right"
          verticalAlign="top"
        />

        <Bar
          dataKey="income"
          name="Income"
          fill="url(#barIncome)"
          radius={[8, 8, 2, 2]}
          maxBarSize={26}
        />
        <Bar
          dataKey="expense"
          name="Expense"
          fill="url(#barExpense)"
          radius={[8, 8, 2, 2]}
          maxBarSize={26}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}