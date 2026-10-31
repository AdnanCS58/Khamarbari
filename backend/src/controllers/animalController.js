import { z } from 'zod'
import { Animal } from '../models/Animal.js'

const createSchema = z.object({
  tag: z.string().min(1),
  name: z.string().optional(),
  species: z.string().min(1),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  dob: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  health: z.enum(['healthy', 'watch', 'treatment', 'quarantine']).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional(),
})

const updateSchema = createSchema.partial().extend({
  status: z.enum(['active', 'sold', 'dead']).optional(),
})

// GET /api/animals
export async function listAnimals(req, res, next) {
  try {
    const { branchId, search, status } = req.query
    const filter = { farmId: req.user.farmId }

    // Branch scoping (from query param, or enforced by role)
    if (req.user.role === 'manager' && req.user.branchId) {
      filter.branchId = req.user.branchId
    } else if (branchId) {
      filter.branchId = branchId
    }

    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { tag: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { species: { $regex: search, $options: 'i' } },
      ]
    }

    const animals = await Animal.find(filter).sort({ createdAt: -1 })
    res.json({ animals })
  } catch (err) {
    next(err)
  }
}

// POST /api/animals
export async function createAnimal(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    
    const existing = await Animal.findOne({ farmId: req.user.farmId, tag: data.tag })
    if (existing) return res.status(409).json({ error: 'An animal with this tag already exists.' })

    const animal = await Animal.create({
      farmId: req.user.farmId,
      ...data,
    })
    res.status(201).json({ animal })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/animals/:id
export async function updateAnimal(req, res, next) {
  try {
    const data = updateSchema.parse(req.body)
    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!animal) return res.status(404).json({ error: 'Animal not found' })
    res.json({ animal })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/animals/:id
export async function deleteAnimal(req, res, next) {
  try {
    const animal = await Animal.findOneAndDelete({
      _id: req.params.id, farmId: req.user.farmId,
    })
    if (!animal) return res.status(404).json({ error: 'Animal not found' })
    res.json({ message: 'Animal deleted successfully' })
  } catch (err) {
    next(err)
  }
}