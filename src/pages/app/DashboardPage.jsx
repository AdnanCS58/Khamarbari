import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Beef, Wallet, ShoppingCart, TrendingUp, AlertTriangle, Milk, Egg, Plus, ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
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
    Promise.all([
      getDashboardSummary({ farmId: farm.id, branchId: selectedBranchId, range: dateRange }),
      getRecentActivity({ farmId: farm.id, branchId: selectedBranchId }),
      getAlerts({ farmId: farm.id, branchId: selectedBranchId }),
    ]).then(([s, a, al]) => {
      if (cancelled) return
      if (s.error || !s.data) { setError(s.error || 'Failed to load'); setLoading(false); return }
      setSummary(s.data)
      setActivity(a.data || [])
      setAlerts(al.data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [farm.id, selectedBranchId, dateRange])

  if (loading) {
    return (
      <div className="p-6">
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
  const bdt = (n) => `৳${n.toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-900">{t('dashboard.title')}</h1>
          <p className="text-sm text-forest-700/70 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button asChild>
            <Link to="/dashboard/animals"><Plus className="h-4 w-4" /> {t('quick.addAnimal')}</Link>
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Beef} label={t('kpi.totalAnimals')} value={kpis.totalAnimals} tone="fresh" delay={0} />
        <KpiCard icon={Milk} label={t('kpi.productionToday')} value={kpis.productionToday.milk} unit="L" tone="default" delay={0.05} />
        <KpiCard icon={Wallet} label={t('kpi.expenses30d')} value={bdt(kpis.expenses30d)} tone="earth" delay={0.1} />
        <KpiCard icon={TrendingUp} label={t('kpi.netProfit30d')} value={bdt(kpis.netProfit)} tone="fresh" delta="+12%" delay={0.15} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label={t('kpi.male')} value={kpis.male} />
        <MiniStat label={t('kpi.female')} value={kpis.female} />
        <MiniStat label={t('kpi.sick')} value={kpis.sick} tone="danger" />
        <MiniStat label={t('kpi.birthsDeaths')} value={`${kpis.births30d} / ${kpis.deaths30d}`} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between flex">
            <CardTitle>{t('chart.incomeVsExpense')}</CardTitle>
            <Badge variant="outline">{dateRange}</Badge>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={incomeVsExpense} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('chart.health')}</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthPieChart data={healthBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between flex">
          <CardTitle>{t('chart.productionTrend')}</CardTitle>
          <Link to="/dashboard/production" className="text-xs text-fresh-600 hover:underline inline-flex items-center gap-1">
            {t('common.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <ProductionTrendChart data={productionTrend} />
        </CardContent>
      </Card>

      {/* Bottom row: activity + alerts + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{t('panel.recentActivity')}</CardTitle></CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <EmptyState title={t('empty.noActivity')} />
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-fresh shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-forest-800 truncate">{a.title}</p>
                      <p className="text-xs text-forest-700/60">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('panel.alerts')}</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <EmptyState title={t('empty.noAlerts')} />
            ) : (
              <ul className="space-y-3">
                {alerts.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        'h-4 w-4 mt-0.5 shrink-0',
                        a.severity === 'high' && 'text-red-500',
                        a.severity === 'medium' && 'text-amber-500',
                        a.severity === 'low' && 'text-forest-700/60',
                      )}
                    />
                    <div>
                      <p className="text-sm text-forest-800">{a.title}</p>
                      <p className="text-xs text-forest-700/60">{a.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('panel.quickActions')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction to="/dashboard/animals" icon={Beef} label={t('quick.addAnimal')} />
              <QuickAction to="/dashboard/expenses" icon={Wallet} label={t('quick.addExpense')} />
              <QuickAction to="/dashboard/sales" icon={ShoppingCart} label={t('quick.recordSale')} />
              <QuickAction to="/dashboard/production" icon={Egg} label={t('quick.addProduction')} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ label, value, tone = 'default' }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs uppercase tracking-wide text-forest-700/60">{label}</p>
        <p className={cn(
          'mt-1 text-xl font-bold',
          tone === 'danger' ? 'text-red-600' : 'text-forest-900'
        )}>{value}</p>
      </CardContent>
    </Card>
  )
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-forest-50 bg-white px-3 py-4 text-center hover:bg-sage/40 transition-colors"
    >
      <Icon className="h-5 w-5 text-forest-700" />
      <span className="text-xs font-medium text-forest-800">{label}</span>
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
    <div className="inline-flex rounded-xl border border-forest-100 bg-white p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            value === o.v ? 'bg-forest text-white' : 'text-forest-700 hover:bg-sage'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}