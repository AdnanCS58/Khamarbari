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
    
    // Decode the JWT to get the expiration time
    const payloadBase64 = data.token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payloadBase64))
    
    storage.set(SESSION_KEY, { 
      token: data.token, 
      user: data.user, 
      farm: data.farm,
      expiresAt: decodedPayload.exp * 1000 // Convert seconds to milliseconds
    })
    
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
  
  // 1. No session or token? Boot them out.
  if (!session || !session.token) return { data: null, error: null }

  // 2. Check if the token is EXPIRED locally (this is instantaneous)
  if (session.expiresAt && Date.now() > session.expiresAt) {
    storage.remove(SESSION_KEY)
    return { data: null, error: null }
  }

  // 3. Token is valid! Let them in immediately.
  // We return the local session data so the UI loads instantly.
  
  // 4. Silently fetch fresh data from the server in the background
  apiFetch('/auth/me').then((freshData) => {
    // Update the local storage with the latest farm/user info
    storage.set(SESSION_KEY, { ...session, user: freshData.user, farm: freshData.farm })
  }).catch(() => {
    // If the server is asleep, we don't care! They are already logged in.
  })

  return { data: session, error: null }
}

export async function updateProfile(patch) {
  return { data: patch, error: null } 
}

export async function requestPasswordReset(contact) {
  return { data: { ok: true, contact }, error: null }
}