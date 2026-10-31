import { z } from 'zod'
import { Utility } from '../models/Utility.js'

const createSchema = z.object({
  type: z.string().min(1),
  billingPeriod: z.string().min(1),
  amount: z.coerce.number().positive(),
  status: z.enum(['paid', 'pending', 'overdue']).optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  provider: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listUtilities(req, res, next) {
  try {
    const { branchId, type, status } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (type) filter.type = type
    if (status) filter.status = status

    const utilities = await Utility.find(filter).sort({ billingPeriod: -1 })
    res.json({ utilities })
  } catch (err) { next(err) }
}

export async function createUtility(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const util = await Utility.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ utility: util })
  } catch (err) { next(err) }
}

export async function updateUtility(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const util = await Utility.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!util) return res.status(404).json({ error: 'Utility not found' })
    res.json({ utility: util })
  } catch (err) { next(err) }
}

export async function deleteUtility(req, res, next) {
  try {
    const util = await Utility.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!util) return res.status(404).json({ error: 'Utility not found' })
    res.json({ message: 'Utility deleted' })
  } catch (err) { next(err) }
}