import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Upload, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/expenseCategories'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { createExpense, updateExpense } from '@/services/expensesService'

export default function ExpenseDialog({ open, onOpenChange, editing, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [receipt, setReceipt] = useState(null)

  const schema = z.object({
    title: z.string().min(2, t('errors.required')),
    category: z.string().min(1, t('errors.required')),
    amount: z.coerce.number().positive(t('errors.required')),
    date: z.string().min(1, t('errors.required')),
    paymentMethod: z.string().min(1, t('errors.required')),
    paidBy: z.string().optional(),
    branchId: z.string().optional(),
    supplier: z.string().optional(),
    description: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', category: 'feed', amount: '', date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'cash', paidBy: '', branchId: '', supplier: '', description: '',
    },
  })

  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
  }, [farm])

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        title: editing.title,
        category: editing.category,
        amount: editing.amount,
        date: editing.date,
        paymentMethod: editing.paymentMethod,
        paidBy: editing.paidBy || '',
        branchId: editing.branchId || '',
        supplier: editing.supplier || '',
        description: editing.description || '',
      })
      setReceipt(editing.receipt || null)
    } else {
      reset({
        title: '', category: 'feed', amount: '', date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'cash', paidBy: '',
        branchId: selectedBranchId !== 'all' ? selectedBranchId : '',
        supplier: '', description: '',
      })
      setReceipt(null)
    }
  }, [open, editing, selectedBranchId, reset])

  const onReceipt = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setServerError('Receipt must be under 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setReceipt(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const payload = { ...values, farmId: farm.id, receipt }
    const { error } = editing
      ? await updateExpense(editing.id, payload)
      : await createExpense(payload)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('expenses.edit') : t('expenses.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div>
            <Label>{t('expenses.title')}</Label>
            <Input {...register('title')} className="mt-1.5" placeholder={t('expenses.titlePlaceholder')} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('expenses.category')}</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v, { shouldValidate: true })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('expenses.amount')} (৳)</Label>
              <Input type="number" step="0.01" {...register('amount')} className="mt-1.5" />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>{t('expenses.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
            </div>
            <div>
              <Label>{t('expenses.paymentMethod')}</Label>
              <Select value={watch('paymentMethod')} onValueChange={(v) => setValue('paymentMethod', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((p) => (
                    <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('expenses.branch')}</Label>
              <Select
                value={watch('branchId') || 'none'}
                onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('expenses.noBranch')}</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('expenses.paidBy')}</Label>
              <Input {...register('paidBy')} className="mt-1.5" placeholder={t('expenses.paidByPlaceholder')} />
            </div>
          </div>

          <div>
            <Label>{t('expenses.supplier')}</Label>
            <Input {...register('supplier')} className="mt-1.5" placeholder={t('expenses.supplierPlaceholder')} />
          </div>

          <div>
            <Label>{t('expenses.description')}</Label>
            <Textarea rows={2} {...register('description')} className="mt-1.5" />
          </div>

          <div>
            <Label>{t('expenses.receipt')}</Label>
            <div className="mt-1.5 flex items-center gap-3">
              {receipt ? (
                <div className="relative h-16 w-16 rounded-xl border border-forest-100 overflow-hidden bg-sage">
                  <img src={receipt} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-forest-100 shadow flex items-center justify-center"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="h-16 w-16 rounded-xl border-2 border-dashed border-forest-100 bg-sage/40 flex items-center justify-center text-forest-700 hover:bg-sage cursor-pointer">
                  <Upload className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={onReceipt} />
                </label>
              )}
              <span className="text-xs text-forest-700/60">{t('expenses.receiptHint')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : editing ? t('common.save') : t('expenses.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}