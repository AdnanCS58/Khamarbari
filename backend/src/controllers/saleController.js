import { z } from 'zod'
import { Sale } from '../models/Sale.js'
import { Animal } from '../models/Animal.js'

const createSchema = z.object({
  itemType: z.string().min(1),
  animalId: z.string().optional().nullable(),
  date: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.coerce.number().nonnegative(),
  paidAmount: z.coerce.number().nonnegative().optional(),
  buyer: z.string().min(2),
  buyerContact: z.string().optional(),
  paymentStatus: z.enum(['paid', 'partial', 'unpaid']).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listSales(req, res, next) {
  try {
    const { branchId, itemType, paymentStatus, dateFrom, dateTo, search } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (itemType) filter.itemType = itemType
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = dateFrom
      if (dateTo) filter.date.$lte = dateTo
    }
    if (search) {
      filter.$or = [
        { buyer: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
      ]
    }

    const sales = await Sale.find(filter).sort({ date: -1 })
    res.json({ sales })
  } catch (err) { next(err) }
}

export async function createSale(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const total = data.quantity * data.unitPrice
    const paidAmount = data.paymentStatus === 'paid' ? total : (data.paidAmount || 0)
    const outstanding = Math.max(0, total - paidAmount)
    
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`

    const sale = await Sale.create({
      farmId: req.user.farmId,
      invoiceNo,
      ...data,
      total,
      paidAmount,
      outstanding,
    })

    // Link animal sale
    if (data.itemType === 'animal' && data.animalId) {
      await Animal.findOneAndUpdate(
        { _id: data.animalId, farmId: req.user.farmId },
        { status: 'sold' }
      )
    }

    res.status(201).json({ sale })
  } catch (err) { next(err) }
}

export async function updateSale(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    
    const existing = await Sale.findOne({ _id: req.params.id, farmId: req.user.farmId })
    if (!existing) return res.status(404).json({ error: 'Sale not found' })

    const quantity = data.quantity ?? existing.quantity
    const unitPrice = data.unitPrice ?? existing.unitPrice
    const total = quantity * unitPrice
    const paidAmount = data.paidAmount ?? existing.paidAmount
    const outstanding = Math.max(0, total - paidAmount)

    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      { ...data, total, paidAmount, outstanding },
      { new: true, runValidators: true }
    )
    res.json({ sale })
  } catch (err) { next(err) }
}

export async function deleteSale(req, res, next) {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!sale) return res.status(404).json({ error: 'Sale not found' })
    
    // Revert animal status if applicable
    if (sale.itemType === 'animal' && sale.animalId) {
      await Animal.findOneAndUpdate(
        { _id: sale.animalId, farmId: req.user.farmId },
        { status: 'active' }
      )
    }
    res.json({ message: 'Sale deleted' })
  } catch (err) { next(err) }
}