import { apiFetch } from '@/lib/api'

export async function listBranches(farmId) {
  try {
    // Note: farmId isn't needed in the URL because the backend 
    // uses the JWT token to know which farm you belong to.
    const data = await apiFetch('/branches')
    return { data: data.branches, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

export async function createBranch(farmId, payload) {
  try {
    const data = await apiFetch('/branches', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        location: payload.location,
        managerName: payload.managerName,
        managerContact: payload.managerContact,
      }),
    })
    return { data: data.branch, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function updateBranch(id, patch) {
  try {
    const data = await apiFetch(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return { data: data.branch, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function archiveBranch(id) {
  try {
    const data = await apiFetch(`/branches/${id}`, {
      method: 'DELETE',
    })
    return { data: data.branch, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}