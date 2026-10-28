import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Beef,
  Bird,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Egg,
  Leaf,
  Milk,
  Plus,
  ShoppingCart,
  Sprout,
  TrendingUp,
  Wallet,
  Package,
  Users,
  Stethoscope,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart'
import HealthPieChart from '@/components/charts/HealthPieChart'
import ProductionTrendChart from '@/components/charts/ProductionTrendChart'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { getDashboardSummary, getRecentActivity, getAlerts } from '@/services/dashboardService'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const { selectedBranchId, dateRange, setDateRange } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [activity, setActivity] = useState([])
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([
      getDashboardSummary({ farmId: farm.id, branchId: selectedBranchId, range: dateRange }),
      getRecentActivity({ farmId: farm.id, branchId: selectedBranchId }),
      getAlerts({ farmId: farm.id, branchId: selectedBranchId }),
    ])
      .then(([s, a, al]) => {
        if (cancelled) return
        if (s.error || !s.data) {
          setError(s.error || 'Failed to load dashboard')
          setLoading(false)
          return
        }
        setSummary(s.data)
        setActivity(a.data || [])
        setAlerts(al.data || [])
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message || 'Failed to load dashboard')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [farm.id, selectedBranchId, dateRange])

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center p-6">
        <SproutLoader label={t('common.loading')} />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertTriangle}
          title={t('errors.generic')}
          description={error}
          action={<Button onClick={() => window.location.reload()}>{t('common.retry')}</Button>}
        />
      </div>
    )
  }

  const { kpis, incomeVsExpense, healthBreakdown, productionTrend } = summary
  const bdt = (n) => `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`
  const highAlerts = alerts.filter((a) => a.severity === 'high').length

  const modules = [
    { title: 'Livestock', subtitle: 'Cattle & herd records', icon: Beef, tone: 'bg-emerald-50 text-emerald-800', to: '/dashboard/animals' },
    { title: 'Poultry', subtitle: 'Flocks, eggs & health', icon: Bird, tone: 'bg-lime-50 text-lime-800', to: '/dashboard/animals' },
    { title: 'Crops & vegetables', subtitle: 'Fields, harvest & yield', icon: Sprout, tone: 'bg-green-50 text-green-800', to: '/dashboard/production' },
    { title: 'Dairy & production', subtitle: 'Daily output tracking', icon: Milk, tone: 'bg-teal-50 text-teal-800', to: '/dashboard/production' },
    { title: 'Inventory & feed', subtitle: 'Stock and supplies', icon: Package, tone: 'bg-amber-50 text-amber-800', to: '/dashboard/expenses' },
    { title: 'Sales & distribution', subtitle: 'Orders and transactions', icon: ShoppingCart, tone: 'bg-cyan-50 text-cyan-800', to: '/dashboard/sales' },
  ]

  return (
    <main className="min-w-0 space-y-6 bg-[#f5f8f2] p-4 text-slate-800 sm:p-6 xl:p-8">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            Farm operations center
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {t('dashboard.subtitle')} <span className="text-emerald-700">·</span> Monitor livestock, poultry, crops, production and finances in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <CalendarDays className="h-4 w-4 text-emerald-700" />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
          <Button asChild className="rounded-xl bg-emerald-700 shadow-sm hover:bg-emerald-800">
            <Link to="/dashboard/animals"><Plus className="mr-2 h-4 w-4" />{t('quick.addAnimal')}</Link>
          </Button>
        </div>
      </header>

      {/* Operations banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123f2b] via-[#17613b] to-[#25834b] p-6 text-white shadow-lg shadow-emerald-950/10 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-[-5rem] right-1/4 h-48 w-48 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/20 bg-white/10 text-lime-100 hover:bg-white/10">
              <Activity className="mr-1.5 h-3.5 w-3.5" /> Live farm overview
            </Badge>
<h2 className="max-w-xl text-2xl font-bold leading-tight sm:text-3xl text-white">
  Every part of your farm, <span className="text-lime-300">working in sync.</span>
</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80">
              A unified view of animal health, harvests, production, stock and cash flow—built to help your team spot issues early and make better decisions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-lime-300 font-semibold text-emerald-950 hover:bg-lime-200">
                <Link to="/dashboard/production">View production <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to="/dashboard/sales">Review sales</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeroMetric icon={Beef} label="Total animals" value={Number(kpis.totalAnimals || 0).toLocaleString()} foot="Across registered herds" />
            <HeroMetric icon={Egg} label="Today's output" value={`${Number(kpis.productionToday?.milk || 0).toLocaleString()} L`} foot="Milk production recorded" />
            <HeroMetric icon={Wallet} label="30-day expenses" value={bdt(kpis.expenses30d)} foot="Operating costs" />
            <HeroMetric icon={TrendingUp} label="30-day net profit" value={bdt(kpis.netProfit)} foot="Income minus expenses" />
          </div>
        </div>
      </section>

      {/* At-a-glance stats */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MiniMetric icon={Users} label={t('kpi.male')} value={kpis.male} />
        <MiniMetric icon={Users} label={t('kpi.female')} value={kpis.female} />
        <MiniMetric icon={Stethoscope} label={t('kpi.sick')} value={kpis.sick} warning />
        <MiniMetric icon={Activity} label={t('kpi.birthsDeaths')} value={`${kpis.births30d} / ${kpis.deaths30d}`} />
      </section>

      {/* Business modules */}
      <section className="space-y-3">
        <SectionHeading eyebrow="Connected modules" title="Manage every operation" note="Move between the core areas of your farm." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.title}
              to={module.to}
              className="group flex items-center gap-4 rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-sm shadow-emerald-950/[0.02] transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', module.tone)}>
                <module.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-800">{module.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{module.subtitle}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
            </Link>
          ))}
        </div>
      </section>

      {/* Analytics */}
      <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="overflow-hidden rounded-2xl border-emerald-100/80 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Financial performance</p>
              <CardTitle className="mt-1 text-lg text-slate-900">{t('chart.incomeVsExpense')}</CardTitle>
            </div>
            <Badge variant="outline" className="rounded-lg border-emerald-100 bg-emerald-50 text-emerald-800">{dateRange}</Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <IncomeExpenseChart data={incomeVsExpense} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-emerald-100/80 bg-white shadow-sm">
          <CardHeader className="px-5 pb-0 pt-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Animal wellbeing</p>
            <CardTitle className="mt-1 text-lg text-slate-900">{t('chart.health')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <HealthPieChart data={healthBreakdown} />
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              Track health status and follow up on animals that need attention.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden rounded-2xl border-emerald-100/80 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Output over time</p>
            <CardTitle className="mt-1 text-lg text-slate-900">{t('chart.productionTrend')}</CardTitle>
          </div>
          <Link to="/dashboard/production" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
            {t('common.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ProductionTrendChart data={productionTrend} />
        </CardContent>
      </Card>

      {/* Activity and response */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-emerald-100/80 bg-white shadow-sm xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Farm log</p>
              <CardTitle className="mt-1 text-lg text-slate-900">{t('panel.recentActivity')}</CardTitle>
            </div>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Clock3 className="h-4 w-4" /></span>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            {activity.length === 0 ? (
              <EmptyState title={t('empty.noActivity')} />
            ) : (
              <ul className="space-y-4">
                {activity.slice(0, 5).map((item, index) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Activity className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0">
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100/80 bg-white shadow-sm xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Needs attention</p>
              <CardTitle className="mt-1 text-lg text-slate-900">{t('panel.alerts')}</CardTitle>
            </div>
            <span className={cn('rounded-xl p-2', highAlerts ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700')}>
              <AlertTriangle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            {alerts.length === 0 ? (
              <EmptyState title={t('empty.noAlerts')} />
            ) : (
              <ul className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <li key={alert.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                    <span className={cn(
                      'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                      alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500',
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{alert.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100/80 bg-white shadow-sm">
          <CardHeader className="px-5 pb-2 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Shortcuts</p>
            <CardTitle className="mt-1 text-lg text-slate-900">{t('panel.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 px-5 pb-5 pt-3">
            <QuickAction to="/dashboard/animals" icon={Beef} label={t('quick.addAnimal')} />
            <QuickAction to="/dashboard/expenses" icon={Wallet} label={t('quick.addExpense')} />
            <QuickAction to="/dashboard/sales" icon={ShoppingCart} label={t('quick.recordSale')} />
            <QuickAction to="/dashboard/production" icon={Egg} label={t('quick.addProduction')} />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function HeroMetric({ icon: Icon, label, value, foot }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.09] p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-emerald-50/80">{label}</span>
        <Icon className="h-4 w-4 text-lime-300" />
      </div>
      <p className="mt-3 break-words text-xl font-bold tracking-tight text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-[11px] text-emerald-50/60">{foot}</p>
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value, warning = false }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-sm shadow-emerald-950/[0.02]">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', warning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className={cn('mt-1 text-xl font-bold tabular-nums', warning ? 'text-amber-700' : 'text-slate-900')}>{value ?? 0}</p>
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, note }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      <p className="text-sm text-slate-500">{note}</p>
    </div>
  )
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="group flex min-h-24 flex-col items-start justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-slate-700">
        {label}
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function DateRangePicker({ value, onChange }) {
  const { t } = useTranslation()
  const options = [
    { v: '7d', label: t('range.7d') },
    { v: '30d', label: t('range.30d') },
    { v: '90d', label: t('range.90d') },
    { v: 'ytd', label: t('range.ytd') },
  ]

  return (
    <div className="flex items-center gap-1">
      {options.map((option) => (
        <button
          key={option.v}
          type="button"
          onClick={() => onChange(option.v)}
          className={cn(
            'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3',
            value === option.v
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-800',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
