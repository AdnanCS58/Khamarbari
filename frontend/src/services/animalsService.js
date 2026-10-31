import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'animals'
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listAnimals({ farmId, branchId, enclosureId, search, status } = {}) {
  await delay()
  let rows = read().filter((a) => a.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((a) => a.branchId === branchId)
  if (enclosureId) rows = rows.filter((a) => a.enclosureId === enclosureId)
  if (status && status !== 'all') rows = rows.filter((a) => (a.status || 'active') === status)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.tag?.toLowerCase().includes(q) ||
        a.species?.toLowerCase().includes(q) ||
        a.breed?.toLowerCase().includes(q)
    )
  }
  return { data: rows, error: null }
}

export async function getAnimal(id) {
  await delay()
  const row = read().find((a) => a.id === id)
  return { data: row || null, error: row ? null : 'Not found' }
}

export async function createAnimal(payload) {
  await delay()
  const row = {
    id: uid('animal'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    enclosureId: payload.enclosureId || null,
    tag: payload.tag || '',
    name: payload.name || '',
    species: payload.species || '',
    breed: payload.breed || '',
    gender: payload.gender || '',
    dob: payload.dob || null,
    purchaseDate: payload.purchaseDate || null,
    purchasePrice: Number(payload.purchasePrice || 0),
    weight: Number(payload.weight || 0),
    health: payload.health || 'healthy',
    source: payload.source || '',
    photo: payload.photo || null,
    notes: payload.notes || '',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateAnimal(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((a) => a.id === id)
  if (i < 0) return { data: null, error: 'Animal not found' }
  rows[i] = {
    ...rows[i],
    ...patch,
    weight: patch.weight !== undefined ? Number(patch.weight) : rows[i].weight,
    purchasePrice: patch.purchasePrice !== undefined ? Number(patch.purchasePrice) : rows[i].purchasePrice,
  }
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteAnimal(id) {
  await delay()
  write(read().filter((a) => a.id !== id))
  return { data: true, error: null }
}