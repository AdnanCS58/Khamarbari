// localStorage-backed expenses service.
// Interface mirrors a REST API — swap internals for fetch() later.
import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'expenses'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listExpenses({ farmId, branchId, search, category, dateFrom, dateTo } = {}) {
  await delay()
  let rows = read().filter((e) => e.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((e) => e.branchId === branchId)
  if (category && category !== 'all') rows = rows.filter((e) => e.category === category)
  if (dateFrom) rows = rows.filter((e) => e.date >= dateFrom)
  if (dateTo) rows = rows.filter((e) => e.date <= dateTo)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.paidBy?.toLowerCase().includes(q) ||
        e.supplier?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function createExpense(payload) {
  await delay()
  const row = {
    id: uid('exp'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    title: payload.title,
    category: payload.category,
    amount: Number(payload.amount),
    date: payload.date,
    paymentMethod: payload.paymentMethod || 'cash',
    paidBy: payload.paidBy || '',
    relatedAnimalId: payload.relatedAnimalId || null,
    supplier: payload.supplier || '',
    description: payload.description || '',
    receipt: payload.receipt || null,
    createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateExpense(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Expense not found' }
  rows[i] = {
    ...rows[i],
    ...patch,
    amount: patch.amount !== undefined ? Number(patch.amount) : rows[i].amount,
  }
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteExpense(id) {
  await delay()
  write(read().filter((r) => r.id !== id))
  return { data: true, error: null }
}

export async function getExpenseTotals({ farmId, branchId, dateFrom, dateTo } = {}) {
  const { data } = await listExpenses({ farmId, branchId, dateFrom, dateTo })
  const total = data.reduce((s, e) => s + e.amount, 0)
  const byCategory = data.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  return { data: { total, count: data.length, byCategory }, error: null }
}