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
import { PRODUCTION_TYPES, SESSIONS, QUALITY_GRADES } from '@/lib/productionTypes'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { listAnimals } from '@/services/animalsService'
import { createProduction, updateProduction } from '@/services/productionService'

export default function ProductionDialog({ open, onOpenChange, editing, onSaved, defaultType = 'milk' }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [animals, setAnimals] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    type: z.string().min(1, t('errors.required')),
    animalId: z.string().optional(),
    animalName: z.string().optional(),
    date: z.string().min(1, t('errors.required')),
    session: z.string().optional(),
    quantity: z.coerce.number().nonnegative(t('errors.required')),
    unit: z.string().min(1, t('errors.required')),
    quality: z.string().optional(),
    recorder: z.string().optional(),
    branchId: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType, animalId: '', animalName: '',
      date: new Date().toISOString().slice(0, 10),
      session: 'morning', quantity: '', unit: 'L', quality: '',
      recorder: '', branchId: '', notes: '',
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
        type: editing.type,
        animalId: editing.animalId || '',
        animalName: editing.animalName || '',
        date: editing.date,
        session: editing.session || 'morning',
        quantity: editing.quantity,
        unit: editing.unit,
        quality: editing.quality || '',
        recorder: editing.recorder || '',
        branchId: editing.branchId || '',
        notes: editing.notes || '',
      })
    } else {
      const tCfg = PRODUCTION_TYPES.find((p) => p.id === defaultType)
      reset({
        type: defaultType,
        animalId: '',
        animalName: '',
        date: new Date().toISOString().slice(0, 10),
        session: 'morning',
        quantity: '',
        unit: tCfg?.unit || 'L',
        quality: '',
        recorder: '',
        branchId: selectedBranchId !== 'all' ? selectedBranchId : '',
        notes: '',
      })
    }
  }, [open, editing, selectedBranchId, reset, defaultType])

  const type = watch('type')
  const typeCfg = PRODUCTION_TYPES.find((p) => p.id === type)

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const payload = { ...values, farmId: farm.id }
    const { error } = editing
      ? await updateProduction(editing.id, payload)
      : await createProduction(payload)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('production.edit') : t('production.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('production.type')}</Label>
              <Select value={type} onValueChange={(v) => {
                setValue('type', v, { shouldValidate: true })
                const cfg = PRODUCTION_TYPES.find((p) => p.id === v)
                setValue('unit', cfg?.unit || 'unit')
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCTION_TYPES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('production.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          {/* Animal picker — optional, useful for milk/weight/birth/death */}
          <div>
            <Label>{t('production.animal')}</Label>
            <Select value={watch('animalId') || 'none'} onValueChange={(v) => {
              const id = v === 'none' ? '' : v
              setValue('animalId', id)
              const found = animals.find((a) => a.id === id)
              setValue('animalName', found?.name || found?.tag || '')
            }}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('production.noAnimal')}</SelectItem>
                {animals.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name || a.tag} ({a.species || 'animal'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('production.quantity')}</Label>
              <Input type="number" step="0.01" {...register('quantity')} className="mt-1.5" />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label>{t('production.unit')}</Label>
              <Input {...register('unit')} className="mt-1.5" />
            </div>
            {typeCfg?.hasSession && (
              <div>
                <Label>{t('production.session')}</Label>
                <Select value={watch('session') || 'morning'} onValueChange={(v) => setValue('session', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {type === 'milk' || type === 'egg' ? (
            <div>
              <Label>{t('production.quality')}</Label>
              <Select value={watch('quality') || 'none'} onValueChange={(v) => setValue('quality', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('production.noQuality')}</SelectItem>
                  {QUALITY_GRADES.map((q) => (
                    <SelectItem key={q} value={q}>{q.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('production.recorder')}</Label>
              <Input {...register('recorder')} className="mt-1.5" placeholder={t('production.recorderPlaceholder')} />
            </div>
            <div>
              <Label>{t('production.branch')}</Label>
              <Select value={watch('branchId') || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('production.noBranch')}</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('production.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : editing ? t('common.save') : t('production.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}