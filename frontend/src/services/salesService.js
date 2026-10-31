// localStorage-backed sales service.
// Swap internals for fetch() later; pages stay unchanged.
import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'sales'
const ANIMALS_KEY = 'animals'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listSales({ farmId, branchId, search, itemType, paymentStatus, dateFrom, dateTo } = {}) {
  await delay()
  let rows = read().filter((s) => s.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((s) => s.branchId === branchId)
  if (itemType && itemType !== 'all') rows = rows.filter((s) => s.itemType === itemType)
  if (paymentStatus && paymentStatus !== 'all') rows = rows.filter((s) => s.paymentStatus === paymentStatus)
  if (dateFrom) rows = rows.filter((s) => s.date >= dateFrom)
  if (dateTo) rows = rows.filter((s) => s.date <= dateTo)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (s) =>
        s.buyer?.toLowerCase().includes(q) ||
        s.buyerContact?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.invoiceNo?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function createSale(payload) {
  await delay()
  const quantity = Number(payload.quantity)
  const unitPrice = Number(payload.unitPrice)
  const total = quantity * unitPrice
  const paidAmount = Number(payload.paidAmount || (payload.paymentStatus === 'paid' ? total : 0))
  const row = {
    id: uid('sale'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    invoiceNo: payload.invoiceNo || `INV-${Date.now().toString().slice(-8)}`,
    itemType: payload.itemType,
    animalId: payload.animalId || null,
    description: payload.description || '',
    date: payload.date,
    quantity,
    unit: payload.unit || 'unit',
    unitPrice,
    total,
    paidAmount,
    outstanding: Math.max(0, total - paidAmount),
    buyer: payload.buyer || '',
    buyerContact: payload.buyerContact || '',
    paymentStatus: payload.paymentStatus || 'unpaid',
    paymentMethod: payload.paymentMethod || 'cash',
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)

  // If selling an animal, flip its status to 'sold'
  if (row.itemType === 'animal' && row.animalId) {
    const animals = storage.get(ANIMALS_KEY, [])
    const idx = animals.findIndex((a) => a.id === row.animalId)
    if (idx >= 0) {
      animals[idx].status = 'sold'
      animals[idx].soldAt = row.date
      animals[idx].saleId = row.id
      storage.set(ANIMALS_KEY, animals)
    }
  }

  return { data: row, error: null }
}

export async function updateSale(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Sale not found' }
  const cur = rows[i]
  const quantity = patch.quantity !== undefined ? Number(patch.quantity) : cur.quantity
  const unitPrice = patch.unitPrice !== undefined ? Number(patch.unitPrice) : cur.unitPrice
  const total = quantity * unitPrice
  const paidAmount = patch.paidAmount !== undefined ? Number(patch.paidAmount) : cur.paidAmount
  rows[i] = {
    ...cur,
    ...patch,
    quantity,
    unitPrice,
    total,
    paidAmount,
    outstanding: Math.max(0, total - paidAmount),
  }
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteSale(id) {
  await delay()
  const rows = read()
  const target = rows.find((r) => r.id === id)
  write(rows.filter((r) => r.id !== id))

  // If deleting an animal sale, clear the sold status
  if (target?.itemType === 'animal' && target?.animalId) {
    const animals = storage.get(ANIMALS_KEY, [])
    const idx = animals.findIndex((a) => a.id === target.animalId)
    if (idx >= 0) {
      delete animals[idx].soldAt
      delete animals[idx].saleId
      animals[idx].status = 'active'
      storage.set(ANIMALS_KEY, animals)
    }
  }

  return { data: true, error: null }
}

export async function getSalesTotals({ farmId, branchId, dateFrom, dateTo } = {}) {
  const { data } = await listSales({ farmId, branchId, dateFrom, dateTo })
  const revenue = data.reduce((s, r) => s + r.total, 0)
  const collected = data.reduce((s, r) => s + r.paidAmount, 0)
  const outstanding = data.reduce((s, r) => s + r.outstanding, 0)
  return { data: { revenue, collected, outstanding, count: data.length }, error: null }
}