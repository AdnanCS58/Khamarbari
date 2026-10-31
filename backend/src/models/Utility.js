import mongoose from 'mongoose'

const utilitySchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    type: { type: String, required: true },
    billingPeriod: { type: String, required: true }, // YYYY-MM
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    dueDate: { type: String },
    paidDate: { type: String },
    provider: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true }
)
export const Utility = mongoose.model('Utility', utilitySchema)