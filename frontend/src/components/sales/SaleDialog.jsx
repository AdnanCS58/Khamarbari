import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SALE_ITEM_TYPES, PAYMENT_STATUSES, PAYMENT_METHODS_SALE } from '@/lib/saleOptions'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { listAnimals } from '@/services/animalsService'
import { createSale, updateSale } from '@/services/salesService'

export default function SaleDialog({ open, onOpenChange, editing, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [animals, setAnimals] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    itemType: z.string().min(1, t('errors.required')),
    animalId: z.string().optional(),
    description: z.string().optional(),
    date: z.string().min(1, t('errors.required')),
    quantity: z.coerce.number().positive(t('errors.required')),
    unit: z.string().min(1, t('errors.required')),
    unitPrice: z.coerce.number().nonnegative(t('errors.required')),
    paidAmount: z.coerce.number().nonnegative().optional(),
    buyer: z.string().min(2, t('errors.required')),
    buyerContact: z.string().optional(),
    paymentStatus: z.string().min(1, t('errors.required')),
    paymentMethod: z.string().min(1, t('errors.required')),
    branchId: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      itemType: 'milk', animalId: '', description: '',
      date: new Date().toISOString().slice(0, 10),
      quantity: '', unit: 'L', unitPrice: '', paidAmount: '',
      buyer: '', buyerContact: '', paymentStatus: 'unpaid', paymentMethod: 'cash',
      branchId: '', notes: '',
    },
  })

  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
    listAnimals({ farmId: farm.id }).then(({ data }) => {
      setAnimals((data || []).filter((a) => a.status !== 'sold'))
    })
  }, [farm])

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        itemType: editing.itemType,
        animalId: editing.animalId || '',
        description: editing.description || '',
        date: editing.date,
        quantity: editing.quantity,
        unit: editing.unit,
        unitPrice: editing.unitPrice,
        paidAmount: editing.paidAmount,
        buyer: editing.buyer || '',
        buyerContact: editing.buyerContact || '',
        paymentStatus: editing.paymentStatus,
        paymentMethod: editing.paymentMethod,
        branchId: editing.branchId || '',
        notes: editing.notes || '',
      })
    } else {
      reset({
        itemType: 'milk', animalId: '', description: '',
        date: new Date().toISOString().slice(0, 10),
        quantity: '', unit: 'L', unitPrice: '', paidAmount: '',
        buyer: '', buyerContact: '', paymentStatus: 'unpaid', paymentMethod: 'cash',
        branchId: selectedBranchId !== 'all' ? selectedBranchId : '',
        notes: '',
      })
    }
  }, [open, editing, selectedBranchId, reset])

  const itemType = watch('itemType')
  const quantity = watch('quantity')
  const unitPrice = watch('unitPrice')
  const paidAmount = watch('paidAmount')
  const computedTotal = Number(quantity || 0) * Number(unitPrice || 0)

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const payload = { ...values, farmId: farm.id }
    if (payload.paymentStatus === 'paid') payload.paidAmount = computedTotal
    if (payload.paymentStatus === 'unpaid') payload.paidAmount = 0
    const { error } = editing
      ? await updateSale(editing.id, payload)
      : await createSale(payload)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('sales.edit') : t('sales.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('sales.itemType')}</Label>
              <Select value={itemType} onValueChange={(v) => {
                setValue('itemType', v, { shouldValidate: true })
                const found = SALE_ITEM_TYPES.find((s) => s.id === v)
                setValue('unit', found?.unit || 'unit')
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SALE_ITEM_TYPES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('sales.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          {itemType === 'animal' && (
            <div>
              <Label>{t('sales.animal')}</Label>
              <Select value={watch('animalId') || 'none'} onValueChange={(v) => setValue('animalId', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('sales.noAnimal')}</SelectItem>
                  {animals.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name || a.tag} ({a.species || 'animal'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('sales.quantity')}</Label>
              <Input type="number" step="0.01" {...register('quantity')} className="mt-1.5" />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label>{t('sales.unit')}</Label>
              <Input {...register('unit')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('sales.unitPrice')} (৳)</Label>
              <Input type="number" step="0.01" {...register('unitPrice')} className="mt-1.5" />
              {errors.unitPrice && <p className="mt-1 text-xs text-red-600">{errors.unitPrice.message}</p>}
            </div>
          </div>

          <div className="rounded-xl bg-sage/40 px-3 py-2 text-sm">
            {t('sales.total')}: <b>৳{computedTotal.toLocaleString()}</b>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('sales.paymentStatus')}</Label>
              <Select value={watch('paymentStatus')} onValueChange={(v) => setValue('paymentStatus', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('sales.paymentMethod')}</Label>
              <Select value={watch('paymentMethod')} onValueChange={(v) => setValue('paymentMethod', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS_SALE.map((p) => (
                    <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {watch('paymentStatus') === 'partial' && (
            <div>
              <Label>{t('sales.paidAmount')} (৳)</Label>
              <Input type="number" step="0.01" {...register('paidAmount')} className="mt-1.5" />
              {paidAmount && (
                <p className="mt-1 text-xs text-forest-700/70">
                  {t('sales.outstanding')}: ৳{Math.max(0, computedTotal - Number(paidAmount)).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('sales.buyer')}</Label>
              <Input {...register('buyer')} className="mt-1.5" />
              {errors.buyer && <p className="mt-1 text-xs text-red-600">{errors.buyer.message}</p>}
            </div>
            <div>
              <Label>{t('sales.buyerContact')}</Label>
              <Input {...register('buyerContact')} className="mt-1.5" inputMode="tel" />
            </div>
          </div>

          <div>
            <Label>{t('sales.branch')}</Label>
            <Select value={watch('branchId') || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('sales.noBranch')}</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('sales.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : editing ? t('common.save') : t('sales.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}