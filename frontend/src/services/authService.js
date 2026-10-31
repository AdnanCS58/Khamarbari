// Async API-shaped auth service backed by localStorage.
// Later: replace the internals with fetch() calls to the Express API.
import { storage } from './storage'
import { loadDb, saveDb, uid, hashPassword, verifyPassword } from './mockDb'

const SESSION_KEY = 'session'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// shape: { data, error }
export async function registerFarm(payload) {
  await delay(600)
  const db = loadDb()

  if (db.users.some((u) => u.contact === payload.contact)) {
    return { data: null, error: 'This contact number is already registered.' }
  }

  const farmId = uid('farm')
  const userId = uid('user')

  const farm = {
    id: farmId,
    name: payload.farmName,
    logo: payload.logo || null,
    license: payload.license,
    address: payload.address,
    division: payload.division,
    district: payload.district,
    zilla: payload.zilla,
    upazila: payload.upazila,
    ownerName: payload.ownerName,
    ownerNid: payload.nid,
    email: payload.email || null,
    contact: payload.contact,
    createdAt: new Date().toISOString(),
  }

  const user = {
    id: userId,
    farmId,
    name: payload.ownerName,
    contact: payload.contact,
    email: payload.email || null,
    passwordHash: hashPassword(payload.password),
    role: 'owner',
    branchId: null,
    createdAt: new Date().toISOString(),
  }

  db.farms.push(farm)
  db.users.push(user)
  saveDb(db)

  return { data: { farm, user: publicUser(user) }, error: null }
}

export async function login({ contact, password }) {
  await delay(500)
  const db = loadDb()
  const user = db.users.find((u) => u.contact === contact)
  if (!user) return { data: null, error: 'No account found with this contact.' }
  if (!verifyPassword(password, user.passwordHash)) {
    return { data: null, error: 'Incorrect password.' }
  }
  const farm = db.farms.find((f) => f.id === user.farmId)
  const session = {
    token: `mock.${uid('tok')}`,
    userId: user.id,
    farmId: user.farmId,
    createdAt: new Date().toISOString(),
  }
  storage.set(SESSION_KEY, session)
  return { data: { user: publicUser(user), farm, token: session.token }, error: null }
}

export async function logout() {
  await delay(200)
  storage.remove(SESSION_KEY)
  return { data: true, error: null }
}

export async function getSession() {
  await delay(150)
  const session = storage.get(SESSION_KEY)
  if (!session) return { data: null, error: null }
  const db = loadDb()
  const user = db.users.find((u) => u.id === session.userId)
  if (!user) return { data: null, error: null }
  const farm = db.farms.find((f) => f.id === user.farmId)
  return { data: { user: publicUser(user), farm, token: session.token }, error: null }
}

export async function updateProfile(patch) {
  await delay(400)
  const session = storage.get(SESSION_KEY)
  if (!session) return { data: null, error: 'Not authenticated.' }
  const db = loadDb()
  const userIdx = db.users.findIndex((u) => u.id === session.userId)
  if (userIdx < 0) return { data: null, error: 'User not found.' }
  const user = db.users[userIdx]
  if (patch.contact) user.contact = patch.contact
  if (patch.name) user.name = patch.name
  if (patch.email !== undefined) user.email = patch.email
  if (patch.password) user.passwordHash = hashPassword(patch.password)
  db.users[userIdx] = user
  saveDb(db)
  return { data: publicUser(user), error: null }
}

export async function requestPasswordReset(contact) {
  await delay(500)
  // Mock — real backend would send OTP/token.
  return { data: { ok: true, contact }, error: null }
}

function publicUser(user) {
  const { passwordHash, ...rest } = user
  return rest
}