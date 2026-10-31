import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil, Trash2, Wallet, AlertTriangle, Download, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ExpenseDialog from '@/components/expenses/ExpenseDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listExpenses, deleteExpense, getExpenseTotals } from '@/services/expensesService'
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

export default function ExpensesPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ total: 0, count: 0, byCategory: {} })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await listExpenses({
      farmId: farm.id, branchId: selectedBranchId, search, category, dateFrom, dateTo,
    })
    if (error) { setError(error); setLoading(false); return }
    setRows(data)
    const tot = await getExpenseTotals({ farmId: farm.id, branchId: selectedBranchId, dateFrom, dateTo })
    setTotals(tot.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.id, selectedBranchId, search, category, dateFrom, dateTo])

  useEffect(() => { setPage(1) }, [search, category, dateFrom, dateTo, selectedBranchId])

  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  )
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const donutData = useMemo(
    () =>
      Object.entries(totals.byCategory)
        .map(([id, value]) => {
          const cat = EXPENSE_CATEGORIES.find((c) => c.id === id)
          return { name: cat?.label || id, value, color: cat?.color || '#999' }
        })
        .sort((a, b) => b.value - a.value),
    [totals.byCategory]
  )

  const bdt = (n) => `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    await deleteExpense(confirm.row.id)
    setConfirm({ open: false, row: null, loading: false })
    refresh()
  }

  const exportCsv = () => {
    const header = ['Date', 'Title', 'Category', 'Amount', 'Method', 'Paid By', 'Supplier']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push(
        [
          r.date,
          `"${(r.title || '').replace(/"/g, '""')}"`,
          r.category,
          r.amount,
          r.paymentMethod,
          `"${r.paidBy || ''}"`,
          `"${r.supplier || ''}"`,
        ].join(',')
      )
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.expenses')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> {t('common.export')}
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> {t('expenses.add')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label={t('expenses.total')} value={bdt(totals.total)} tone="earth" icon={Wallet} />
        <KpiCard label={t('expenses.count')} value={totals.count} tone="default" icon={Filter} />
        <KpiCard
          label={t('expenses.topCategory')}
          value={donutData[0] ? `${donutData[0].name} · ${bdt(donutData[0].value)}` : '—'}
          tone="fresh"
          icon={AlertTriangle}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-700/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('expenses.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        >
          <option value="all">{t('expenses.allCategories')}</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
          <h3 className="text-sm font-semibold text-forest-900 mb-2">{t('expenses.byCategory')}</h3>
          {donutData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-forest-700/60">
              {t('empty.noExpenses')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => bdt(v)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
          {loading ? (
            <SproutLoader label={t('common.loading')} />
          ) : error ? (
            <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title={t('expenses.emptyTitle')}
              description={t('expenses.emptyDesc')}
              action={
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4" /> {t('expenses.add')}
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t('expenses.date')}</th>
                      <th className="px-4 py-3 font-semibold">{t('expenses.title')}</th>
                      <th className="px-4 py-3 font-semibold">{t('expenses.category')}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t('expenses.amount')}</th>
                      <th className="px-4 py-3 font-semibold">{t('expenses.paymentMethod')}</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => {
                      const cat = EXPENSE_CATEGORIES.find((c) => c.id === r.category)
                      return (
                        <tr key={r.id} className="border-t border-forest-50 hover:bg-sage/20">
                          <td className="px-4 py-3 text-forest-700/80 whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-3 font-medium text-forest-900">
                            {r.title}
                            {r.supplier && (
                              <div className="text-xs text-forest-700/60">{r.supplier}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
                              {cat?.label || r.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">{bdt(r.amount)}</td>
                          <td className="px-4 py-3 text-xs uppercase text-forest-700/70">{r.paymentMethod}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => { setEditing(r); setDialogOpen(true) }}
                                className="rounded-lg p-1.5 hover:bg-sage text-forest-700"
                                aria-label="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirm({ open: true, row: r, loading: false })}
                                className="rounded-lg p-1.5 hover:bg-red-50 text-red-600"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-sage/40">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-xs uppercase font-semibold text-forest-700/70">
                        {t('expenses.pageTotal')}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-forest-900">
                        {bdt(pageRows.reduce((s, r) => s + r.amount, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-forest-50 text-sm">
                  <span className="text-forest-700/60">
                    {t('common.page')} {page} / {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {t('common.prev')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}
        editing={editing}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('expenses.deleteTitle')}
        description={t('expenses.deleteDesc')}
        confirmLabel={t('common.delete')}
        destructive
        loading={confirm.loading}
        onConfirm={onDelete}
      />
    </div>
  )
}

function KpiCard({ label, value, tone = 'default', icon: Icon }) {
  const tones = {
    default: 'bg-sage text-forest-700',
    fresh: 'bg-fresh-100 text-fresh-600',
    earth: 'bg-earth/10 text-earth-700',
  }
  return (
    <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', tones[tone])}>
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-forest-700/60">{label}</p>
      <p className="mt-1 text-lg font-bold text-forest-900">{value}</p>
    </div>
  )
}