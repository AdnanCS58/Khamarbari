import { z } from 'zod'
import { Production } from '../models/Production.js'

const createSchema = z.object({
  type: z.string().min(1),
  animalId: z.string().optional().nullable(),
  animalName: z.string().optional(),
  date: z.string().min(1),
  session: z.string().optional().nullable(),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  quality: z.string().optional(),
  recorder: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listProduction(req, res, next) {
  try {
    const { branchId, type, dateFrom, dateTo } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (type) filter.type = type
    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = dateFrom
      if (dateTo) filter.date.$lte = dateTo
    }

    const production = await Production.find(filter).sort({ date: -1 })
    res.json({ production })
  } catch (err) { next(err) }
}

export async function createProduction(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const record = await Production.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ production: record })
  } catch (err) { next(err) }
}

export async function updateProduction(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const record = await Production.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!record) return res.status(404).json({ error: 'Record not found' })
    res.json({ production: record })
  } catch (err) { next(err) }
}

export async function deleteProduction(req, res, next) {
  try {
    const record = await Production.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!record) return res.status(404).json({ error: 'Record not found' })
    res.json({ message: 'Record deleted' })
  } catch (err) { next(err) }
}