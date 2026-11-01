import { apiFetch } from '@/lib/api'

export async function listAnimals({ enclosureId } = {}) {
  try {
    const url = enclosureId ? `/animals?enclosureId=${enclosureId}` : '/animals'
    const data = await apiFetch(url)
    return { data: data.animals, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

export async function createAnimal(payload) {
  try {
    const data = await apiFetch('/animals', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { data: data.animal, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}