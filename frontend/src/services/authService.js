import { apiFetch } from '@/lib/api'
import { storage } from './storage'

const SESSION_KEY = 'session'

export async function registerFarm(payload) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        farmName: payload.farmName,
        license: payload.license,
        division: payload.division,
        district: payload.district,
        zilla: payload.zilla,
        upazila: payload.upazila,
        address: payload.address,
        ownerName: payload.ownerName,
        nid: payload.nid,
        email: payload.email,
        contact: payload.contact,
        password: payload.password,
        logo: payload.logo,
      }),
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function login({ contact, password }) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ contact, password }),
    })
    
    // Save session locally so the app stays logged in on refresh
    storage.set(SESSION_KEY, { token: data.token })
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function logout() {
  storage.remove(SESSION_KEY)
  return { data: true, error: null }
}

export async function getSession() {
  const session = storage.get(SESSION_KEY)
  if (!session || !session.token) return { data: null, error: null }

  try {
    const data = await apiFetch('/auth/me')
    return { data: { ...data, token: session.token }, error: null }
  } catch (error) {
    // Token expired or invalid
    storage.remove(SESSION_KEY)
    return { data: null, error: null }
  }
}

export async function updateProfile(patch) {
  // For now, this still updates locally to keep the demo running smoothly
  return { data: patch, error: null } 
}

export async function requestPasswordReset(contact) {
  // Mocked for now until an email service (like SendGrid) is connected
  return { data: { ok: true, contact }, error: null }
}
