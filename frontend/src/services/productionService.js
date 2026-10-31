// localStorage-backed production service.
import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'production'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listProduction({ farmId, branchId, type, search, dateFrom, dateTo } = {}) {
  await delay()
  let rows = read().filter((p) => p.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((p) => p.branchId === branchId)
  if (type && type !== 'all') rows = rows.filter((p) => p.type === type)
  if (dateFrom) rows = rows.filter((p) => p.date >= dateFrom)
  if (dateTo) rows = rows.filter((p) => p.date <= dateTo)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (p) =>
        p.animalName?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        p.recorder?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function createProduction(payload) {
  await delay()
  const row = {
    id: uid('prod'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    type: payload.type,
    animalId: payload.animalId || null,
    animalName: payload.animalName || '',
    date: payload.date,
    session: payload.session || null,
    quantity: Number(payload.quantity),
    unit: payload.unit,
    quality: payload.quality || '',
    recorder: payload.recorder || '',
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateProduction(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Record not found' }
  rows[i] = {
    ...rows[i],
    ...patch,
    quantity: patch.quantity !== undefined ? Number(patch.quantity) : rows[i].quantity,
  }
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteProduction(id) {
  await delay()
  write(read().filter((r) => r.id !== id))
  return { data: true, error: null }
}

export async function getProductionTotals({ farmId, branchId, dateFrom, dateTo } = {}) {
  const { data } = await listProduction({ farmId, branchId, dateFrom, dateTo })
  const byType = {}
  data.forEach((p) => {
    if (!byType[p.type]) byType[p.type] = { quantity: 0, unit: p.unit, count: 0 }
    byType[p.type].quantity += p.quantity
    byType[p.type].count += 1
  })
  return { data: { byType, count: data.length }, error: null }
}

export async function getProductionTrend({ farmId, branchId, type = 'milk', days = 14 } = {}) {
  const { data } = await listProduction({ farmId, branchId, type })
  const map = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map[key] = { date: key.slice(5), quantity: 0 }
  }
  data.forEach((p) => {
    if (map[p.date]) map[p.date].quantity += p.quantity
  })
  return { data: Object.values(map), error: null }
}