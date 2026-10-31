import { z } from 'zod'
import { Inventory } from '../models/Inventory.js'

const createSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  category: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.coerce.number().nonnegative().optional(),
  minimumThreshold: z.coerce.number().nonnegative().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  supplier: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
})

export async function listInventory(req, res, next) {
  try {
    const { branchId, category, search } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (category) filter.category = category
    if (search) filter.name = { $regex: search, $options: 'i' }

    const inventory = await Inventory.find(filter).sort({ name: 1 })
    res.json({ inventory })
  } catch (err) { next(err) }
}

export async function createInventory(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const item = await Inventory.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ inventory: item })
  } catch (err) { next(err) }
}

export async function updateInventory(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json({ inventory: item })
  } catch (err) { next(err) }
}

export async function deleteInventory(req, res, next) {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Item deleted' })
  } catch (err) { next(err) }
}