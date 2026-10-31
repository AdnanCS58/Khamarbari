import { storage } from './storage'
import { loadDb, saveDb, hashPassword } from './mockDb'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function updateFarm(farmId, patch) {
  await delay()
  const db = loadDb()
  const i = db.farms.findIndex((f) => f.id === farmId)
  if (i < 0) return { data: null, error: 'Farm not found' }
  db.farms[i] = { ...db.farms[i], ...patch }
  saveDb(db)
  return { data: db.farms[i], error: null }
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  await delay()
  const db = loadDb()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { data: null, error: 'User not found' }
  const { verifyPassword } = await import('./mockDb')
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { data: null, error: 'Current password is incorrect' }
  }
  user.passwordHash = hashPassword(newPassword)
  saveDb(db)
  return { data: true, error: null }
}

export async function resetAllData() {
  await delay(400)
  storage.remove('db')
  storage.remove('session')
  // clear all module keys
  ;['expenses', 'sales', 'production', 'inventory_items', 'inventory_moves',
    'utilities', 'workers', 'attendance', 'worker_payments',
    'animals', 'enclosures'].forEach((k) => storage.remove(k))
  return { data: true, error: null }
}