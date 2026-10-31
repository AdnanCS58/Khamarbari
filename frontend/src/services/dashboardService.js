import { storage } from './storage'

export async function getDashboardSummary({ farmId, branchId, range = '7d' }) {
  const sales = storage.get('sales', []).filter(s => branchId === 'all' || s.branchId === branchId)
  const expenses = storage.get('expenses', []).filter(e => branchId === 'all' || e.branchId === branchId)
  const animals = storage.get('animals', []).filter(a => branchId === 'all' || a.branchId === branchId)

  const revenue = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const netProfit = revenue - totalExpenses

  const healthy = animals.filter(a => a.health === 'healthy' || !a.health).length
  const sick = animals.length - healthy

  return {
    data: {
      kpis: {
        totalAnimals: animals.length,
        male: animals.filter(a => a.gender === 'male').length,
        female: animals.filter(a => a.gender === 'female').length,
        sick,
        births30d: 0,
        deaths30d: 0,
        productionToday: { milk: 0, eggs: 0 },
        expenses30d: totalExpenses,
        revenue30d: revenue,
        netProfit,
      },
      incomeVsExpense: [
        { day: 'Mon', income: revenue * 0.1, expense: totalExpenses * 0.1 },
        { day: 'Tue', income: revenue * 0.2, expense: totalExpenses * 0.15 },
        { day: 'Wed', income: revenue * 0.15, expense: totalExpenses * 0.2 },
        { day: 'Thu', income: revenue * 0.25, expense: totalExpenses * 0.25 },
        { day: 'Fri', income: revenue * 0.3, expense: totalExpenses * 0.3 },
      ],
      healthBreakdown: [
        { name: 'Healthy', value: healthy, color: '#65A765' },
        { name: 'Sick', value: sick, color: '#DC2626' },
      ],
      productionTrend: [
        { date: 'Today', milk: 0, eggs: 0 },
      ],
      branchCount: 2,
    },
    error: null,
  }
}

export async function getRecentActivity() {
  return { data: [{ id: 1, type: 'system', title: 'System connected to live backend', time: 'just now' }], error: null }
}

export async function getAlerts() {
  return { data: [], error: null }
}