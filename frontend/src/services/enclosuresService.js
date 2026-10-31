import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'enclosures'
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listEnclosures({ farmId, branchId, type, search } = {}) {
  await delay()
  let rows = read().filter((e) => e.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((e) => e.branchId === branchId)
  if (type && type !== 'all') rows = rows.filter((e) => e.type === type)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.speciesNote?.toLowerCase().includes(q) ||
        e.barnId?.toLowerCase().includes(q)
    )
  }
  return { data: rows, error: null }
}

export async function createEnclosure(payload) {
  await delay()
  const row = {
    id: uid('enc'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    type: payload.type,
    name: payload.name,
    barnId: payload.barnId || '',
    speciesId: payload.speciesId,
    speciesNote: payload.speciesNote || '',
    size: Number(payload.size),
    capacity: Number(payload.capacity),
    occupied: Number(payload.occupied || 0),
    health: payload.health || 'healthy',
    notes: payload.notes || '',
    lastCheck: 'just now',
    ageDays: Number(payload.ageDays || 0),
    createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateEnclosure(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((e) => e.id === id)
  if (i < 0) return { data: null, error: 'Enclosure not found' }
  rows[i] = {
    ...rows[i],
    ...patch,
    size: patch.size !== undefined ? Number(patch.size) : rows[i].size,
    capacity: patch.capacity !== undefined ? Number(patch.capacity) : rows[i].capacity,
    occupied: patch.occupied !== undefined ? Number(patch.occupied) : rows[i].occupied,
  }
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteEnclosure(id) {
  await delay()
  write(read().filter((e) => e.id !== id))
  return { data: true, error: null }
}