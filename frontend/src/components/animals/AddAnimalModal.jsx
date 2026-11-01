import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { createAnimal } from '@/services/animalsService'
import { useAuthStore } from '@/store/authStore'

export default function AddAnimalModal({ open, onOpenChange, enclosure, onSaved }) {
  const farm = useAuthStore((s) => s.farm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tag: '', species: 'cow', gender: 'female', weight: '', count: 1
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // We loop to create multiple animals at once
    for (let i = 0; i < Number(form.count); i++) {
      const uniqueTag = `${form.tag}-${i + 1}`
      const { error } = await createAnimal({
        ...form,
        tag: uniqueTag,
        enclosureId: enclosure.id,
        branchId: enclosure.branchId,
        farmId: farm.id || farm._id,
      })
      if (error) {
        setError(error)
        setSubmitting(false)
        return
      }
    }

    setSubmitting(false)
    onOpenChange(false)
    onSaved?.()
  }

  if (!enclosure) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Animals to {enclosure.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <Label>Species</Label>
            <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cow">Cow</SelectItem>
                <SelectItem value="goat">Goat</SelectItem>
                <SelectItem value="chicken">Chicken</SelectItem>
                <SelectItem value="duck">Duck</SelectItem>
                <SelectItem value="fish">Fish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>How many?</Label>
              <Input type="number" min="1" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>ID Tag (e.g. C-100)</Label>
            <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="mt-1.5" required />
          </div>

          <div>
            <Label>Average Weight (kg)</Label>
            <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Animals'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}