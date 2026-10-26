import { loadDb } from './mockDb'

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// Demo numbers so the dashboard renders nicely on first login.
// Once real Animals/Expenses/Production are wired (F5), these read from the DB.
export async function getDashboardSummary({ farmId, branchId, range = '7d' }) {
  await delay()

  const db = loadDb()
  const branches = db.branches.filter((b) => b.farmId === farmId)
  const branchFilter = (row) => branchId === 'all' || row.branchId === branchId

  // ---- KPIs (demo) ----
  const totalAnimals = 128
  const male = 42
  const female = 86
  const sick = 6
  const births30d = 8
  const deaths30d = 2

  const productionToday = { milk: 340, eggs: 1240 } // liters / pcs
  const expenses30d = 184500 // BDT
  const revenue30d = 267300
  const netProfit = revenue30d - expenses30d

  // ---- 7-day income vs expenses ----
  const dayLabels = ['Sat','Sun','Mon','Tue','Wed','Thu','Fri']
  const incomeVsExpense = Array.from({ length: 7 }).map((_, i) => ({
    day: dayLabels[i],
    income: 22000 + Math.round(Math.sin(i) * 4000) + i * 900,
    expense: 14000 + Math.round(Math.cos(i) * 3000) + i * 500,
  }))

  // ---- Healthy vs Sick ----
  const healthBreakdown = [
    { name: 'Healthy', value: totalAnimals - sick, color: '#65A765' },
    { name: 'Sick', value: sick, color: '#DC2626' },
    { name: 'Under treatment', value: 3, color: '#F59E0B' },
  ]

  // ---- Production trend (last 14 days) ----
  const productionTrend = Array.from({ length: 14 }).map((_, i) => {
    const d = daysAgo(13 - i)
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      milk: 280 + Math.round(Math.sin(i / 2) * 40) + i * 2,
      eggs: 1000 + Math.round(Math.cos(i / 2) * 120) + i * 5,
    }
  })

  return {
    data: {
      kpis: {
        totalAnimals, male, female, sick, births30d, deaths30d,
        productionToday, expenses30d, revenue30d, netProfit,
      },
      incomeVsExpense,
      healthBreakdown,
      productionTrend,
      branchCount: branches.length,
    },
    error: null,
  }
}

export async function getRecentActivity({ farmId, branchId, limit = 6 }) {
  await delay()
  // Demo activity feed. Real one will read from auditLogs.
  const items = [
    { id: 1, type: 'animal', title: 'Cow #C-104 recorded as sick', time: '12 min ago' },
    { id: 2, type: 'sale', title: 'Sold 40L milk to Aftab Dairy — ৳3,200', time: '1 hr ago' },
    { id: 3, type: 'expense', title: 'Feed purchase — ৳8,500', time: '3 hr ago' },
    { id: 4, type: 'production', title: 'Evening milk session — 172L', time: '5 hr ago' },
    { id: 5, type: 'worker', title: 'Karim Mia checked in', time: '8 hr ago' },
    { id: 6, type: 'inventory', title: 'Medicine "Oxytetra" low stock (4 left)', time: 'Yesterday' },
  ]
  return { data: items.slice(0, limit), error: null }
}

export async function getAlerts({ farmId, branchId }) {
  await delay()
  return {
    data: [
      { id: 'a1', severity: 'high', title: '6 animals need attention', detail: 'Vaccination overdue' },
      { id: 'a2', severity: 'medium', title: 'Low stock: Oxytetra', detail: 'Only 4 units left' },
      { id: 'a3', severity: 'low', title: 'Electricity bill due', detail: 'Due in 5 days' },
    ],
    error: null,
  }
}