import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Beef, Warehouse, Waves, Rows3, Plus, Search, LayoutGrid, List,
  ChevronRight, MoreVertical, X, Bird, Fish, Rabbit, HeartPulse,
  CalendarDays, Users, MapPin, Ruler, AlertTriangle, TrendingUp, Boxes,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listEnclosures, createEnclosure } from '@/services/enclosuresService'
import SproutLoader from '@/components/common/SproutLoader'

const useEnclosureTypes = () => {
  const { t } = useTranslation()
  return [
    { id: 'room', icon: Warehouse, label: t('animalsPage.typeRoom'), hint: t('animalsPage.typeRoomHint'),
      sizeLabel: t('animalsPage.modalSizeRoom'), sizeUnit: 'm²', capacityLabel: t('animalsPage.modalCapacityRoom'),
      accent: 'var(--color-forest-500)' },
    { id: 'line', icon: Rows3, label: t('animalsPage.typeLine'), hint: t('animalsPage.typeLineHint'),
      sizeLabel: t('animalsPage.modalSizeLine'), sizeUnit: 'm', capacityLabel: t('animalsPage.modalCapacityLine'),
      accent: 'var(--color-warn-500)' },
    { id: 'pond', icon: Waves, label: t('animalsPage.typePond'), hint: t('animalsPage.typePondHint'),
      sizeLabel: t('animalsPage.modalSizePond'), sizeUnit: 'm²', capacityLabel: t('animalsPage.modalCapacityPond'),
      accent: 'var(--color-info-500)' },
  ]
}

const useSpecies = () => {
  const { t } = useTranslation()
  return [
    { id: 'chicken', label: t('animalsPage.speciesChicken'), icon: Bird,   enclosure: 'room', defaultBreed: 'Broiler / Layer' },
    { id: 'duck',    label: t('animalsPage.speciesDuck'),    icon: Bird,   enclosure: 'pond', defaultBreed: 'Khaki Campbell' },
    { id: 'cow',     label: t('animalsPage.speciesCow'),     icon: Beef,   enclosure: 'line', defaultBreed: 'Holstein Friesian' },
    { id: 'goat',    label: t('animalsPage.speciesGoat'),    icon: Beef,   enclosure: 'line', defaultBreed: 'Black Bengal' },
    { id: 'sheep',   label: t('animalsPage.speciesSheep'),   icon: Beef,   enclosure: 'line', defaultBreed: 'Garole' },
    { id: 'fish',    label: t('animalsPage.speciesFish'),    icon: Fish,   enclosure: 'pond', defaultBreed: 'Tilapia / Rohu' },
    { id: 'shrimp',  label: t('animalsPage.speciesShrimp'),  icon: Fish,   enclosure: 'pond', defaultBreed: 'Bagda' },
    { id: 'rabbit',  label: t('animalsPage.speciesRabbit'),  icon: Rabbit, enclosure: 'room', defaultBreed: 'New Zealand' },
  ]
}

const useHealthStates = () => {
  const { t } = useTranslation()
  return [
    { id: 'healthy',    label: t('animalsPage.healthHealthy'),    color: 'var(--color-forest-500)' },
    { id: 'watch',      label: t('animalsPage.healthWatch'),      color: 'var(--color-warn-500)' },
    { id: 'treatment',  label: t('animalsPage.healthTreatment'),  color: 'var(--color-alert-500)' },
    { id: 'quarantine', label: t('animalsPage.healthQuarantine'), color: 'var(--color-info-500)' },
  ]
}

const Chip = ({ children, color, soft, icon: Icon, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    style={{ color: soft ? color : '#fff', background: soft ? `${color}1A` : color }}
  >
    {Icon && <Icon size={11} />}
    {children}
  </span>
)

const Stat = ({ icon: Icon, label, value, sub, color }) => (
  <div className="flex items-center gap-2.5 rounded-lg border border-cream-200 bg-white px-3 py-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-md"
      style={{ background: `${color ?? 'var(--color-forest-500)'}15` }}>
      <Icon size={15} style={{ color: color ?? 'var(--color-forest-500)' }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-soft">{label}</p>
      <p className="text-[13px] font-bold tabular-nums text-slate-ink leading-tight">
        {value}
        {sub && <span className="ml-1 text-[10px] font-medium text-slate-soft">{sub}</span>}
      </p>
    </div>
  </div>
)

const OccupancyBar = ({ occupied, capacity }) => {
  const pct = Math.min(100, Math.round((occupied / Math.max(capacity, 1)) * 100))
  const color = pct >= 95 ? 'var(--color-alert-500)' : pct >= 80 ? 'var(--color-warn-500)' : 'var(--color-forest-500)'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-10 text-right text-[11px] font-semibold tabular-nums text-slate-soft">{pct}%</span>
    </div>
  )
}

const EnclosureCard = ({ enc, onOpen }) => {
  const { t } = useTranslation()
  const ENCLOSURE_TYPES = useEnclosureTypes()
  const SPECIES = useSpecies()
  const HEALTH_STATES = useHealthStates()
  const type = ENCLOSURE_TYPES.find((tt) => tt.id === enc.type)
  const species = SPECIES.find((s) => s.id === enc.speciesId)
  const health = HEALTH_STATES.find((h) => h.id === enc.health)
  const TypeIcon = type.icon
  const SpeciesIcon = species?.icon ?? Beef

  return (
    <button
      onClick={() => onOpen(enc)}
      className="group relative overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(6,28,21,0.10)]"
      style={{ borderColor: 'var(--color-cream-200)' }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: type.accent }} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${type.accent}15` }}>
            <TypeIcon size={18} style={{ color: type.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: type.accent }}>{type.label}</p>
            <h3 className="text-[15px] font-bold leading-tight text-slate-ink">{enc.name}</h3>
          </div>
        </div>
        <MoreVertical size={16} className="text-slate-soft opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <SpeciesIcon size={14} className="text-slate-soft" />
        <span className="text-[12px] font-medium text-slate-ink">{species?.label}</span>
        <span className="text-[11px] text-slate-soft">· {enc.speciesNote}</span>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-slate-soft">{t('animalsPage.occupancy')}</span>
          <span className="text-[12px] font-semibold tabular-nums text-slate-ink">
            {enc.occupied.toLocaleString()}<span className="text-slate-soft"> / {enc.capacity.toLocaleString()}</span>
          </span>
        </div>
        <OccupancyBar occupied={enc.occupied} capacity={enc.capacity} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Chip color={health.color} soft icon={HeartPulse}>{health.label}</Chip>
        <Chip color="var(--color-slate-soft)" soft icon={Ruler}>{enc.size} {type.sizeUnit}</Chip>
        <Chip color="var(--color-slate-soft)" soft icon={CalendarDays}>{enc.ageDays}d</Chip>
        <Chip color="var(--color-slate-soft)" soft icon={MapPin}>{enc.barnId}</Chip>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
        <span className="text-[10px] text-slate-soft">{t('animalsPage.checkedPrefix')} {enc.lastCheck}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: type.accent }}>
          {t('animalsPage.manage')} <ChevronRight size={12} />
        </span>
      </div>
    </button>
  )
}

function CreateEnclosureModal({ open, onClose, onCreate }) {
  const { t } = useTranslation()
  const ENCLOSURE_TYPES = useEnclosureTypes()
  const SPECIES = useSpecies()
  const [type, setType] = useState('room')
  const [speciesId, setSpeciesId] = useState('chicken')
  const [name, setName] = useState('')
  const [barnId, setBarnId] = useState('')
  const [speciesNote, setSpeciesNote] = useState('')
  const [size, setSize] = useState('')
  const [capacity, setCapacity] = useState('')
  const [notes, setNotes] = useState('')

  if (!open) return null
  const cfg = ENCLOSURE_TYPES.find((x) => x.id === type)
  const allowedSpecies = SPECIES.filter((s) => s.enclosure === type)
  const valid = name && size && capacity && speciesId

  const submit = () => {
    if (!valid) return
    onCreate({
      type, name, barnId: barnId || '—', speciesId,
      speciesNote: speciesNote || SPECIES.find((s) => s.id === speciesId)?.defaultBreed || '',
      size: Number(size), capacity: Number(capacity), occupied: 0,
      health: 'healthy', lastCheck: 'just now', notes, ageDays: 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ border: '1px solid var(--color-cream-200)' }}>
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-ink">{t('animalsPage.modalTitle')}</h2>
            <p className="text-[11px] text-slate-soft">{t('animalsPage.modalSubtitle')}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-soft hover:bg-cream-100"><X size={16} /></button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{t('animalsPage.modalType')}</label>
            <div className="grid grid-cols-3 gap-2">
              {ENCLOSURE_TYPES.map((tt) => {
                const Icon = tt.icon
                const active = type === tt.id
                return (
                  <button key={tt.id}
                    onClick={() => { setType(tt.id); const first = SPECIES.find((s) => s.enclosure === tt.id); setSpeciesId(first?.id) }}
                    className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all"
                    style={{ borderColor: active ? tt.accent : 'var(--color-cream-200)', background: active ? `${tt.accent}10` : '#fff' }}
                  >
                    <Icon size={18} style={{ color: active ? tt.accent : 'var(--color-slate-soft)' }} />
                    <span className="text-[12px] font-semibold" style={{ color: active ? tt.accent : 'var(--color-slate-ink)' }}>{tt.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-soft">{cfg.hint}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{t('animalsPage.modalName')}</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder={type === 'room' ? t('animalsPage.modalNamePlaceholderRoom') : type === 'line' ? t('animalsPage.modalNamePlaceholderLine') : t('animalsPage.modalNamePlaceholderPond')}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{t('animalsPage.modalLocation')}</label>
              <input value={barnId} onChange={(e) => setBarnId(e.target.value)} placeholder={t('animalsPage.modalLocationPlaceholder')}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{t('animalsPage.modalSpecies')}</label>
            <div className="flex flex-wrap gap-1.5">
              {allowedSpecies.map((s) => {
                const Icon = s.icon
                const active = speciesId === s.id
                return (
                  <button key={s.id} onClick={() => setSpeciesId(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                    style={{
                      borderColor: active ? 'var(--color-forest-500)' : 'var(--color-cream-200)',
                      background: active ? 'var(--color-forest-50)' : '#fff',
                      color: active ? 'var(--color-forest-700)' : 'var(--color-slate-mid)',
                    }}
                  >
                    <Icon size={13} />{s.label}
                  </button>
                )
              })}
            </div>
            <input value={speciesNote} onChange={(e) => setSpeciesNote(e.target.value)}
              placeholder={SPECIES.find((s) => s.id === speciesId)?.defaultBreed || t('animalsPage.modalBreedNotePlaceholder')}
              className="mt-2 w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{cfg.sizeLabel} ({cfg.sizeUnit})</label>
              <input type="number" value={size} onChange={(e) => setSize(e.target.value)}
                placeholder={type === 'line' ? '60' : type === 'pond' ? '900' : '240'}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] tabular-nums outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{cfg.capacityLabel}</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                placeholder={type === 'line' ? '40' : '5000'}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] tabular-nums outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">{t('animalsPage.modalNotes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder={t('animalsPage.modalNotesPlaceholder')}
              className="w-full resize-none rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-cream-200 bg-cream-50 px-5 py-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-soft hover:bg-cream-100">
            {t('animalsPage.modalCancel')}
          </button>
          <button onClick={submit} disabled={!valid}
            className="rounded-lg bg-forest-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-forest-700 disabled:opacity-40"
          >
            {t('animalsPage.modalSubmit')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AnimalsPage() {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [enclosures, setEnclosures] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [openCreate, setOpenCreate] = useState(false)

  const loadEnclosures = async () => {
    if (!farm) return
    setLoading(true)
    const { data } = await listEnclosures({
      farmId: farm.id, branchId: selectedBranchId, type: filter, search: query,
    })
    setEnclosures(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEnclosures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm?.id, selectedBranchId, filter, query])

  const totals = useMemo(() => {
    const head = enclosures.reduce((s, e) => s + (e.occupied || 0), 0)
    const cap = enclosures.reduce((s, e) => s + (e.capacity || 0), 0)
    const atRisk = enclosures.filter((e) => e.health !== 'healthy').length
    return { head, cap, atRisk }
  }, [enclosures])

  const filterChips = [
    { id: 'all', label: t('animalsPage.filterAll'), icon: LayoutGrid },
    { id: 'room', label: t('animalsPage.filterRooms'), icon: Warehouse },
    { id: 'line', label: t('animalsPage.filterLines'), icon: Rows3 },
    { id: 'pond', label: t('animalsPage.filterPonds'), icon: Waves },
  ]

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('animalsPage.title')}</h1>
          <p className="mt-1 text-[13px] text-slate-soft">{t('animalsPage.subtitle')}</p>
        </div>
        <button onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-forest-700 hover:shadow-md"
        >
          <Plus size={16} /> {t('animalsPage.newEnclosure')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Boxes} label={t('animalsPage.statEnclosures')} value={enclosures.length} sub={t('animalsPage.statEnclosuresSub')} color="var(--color-forest-500)" />
        <Stat icon={Users} label={t('animalsPage.statHead')} value={totals.head.toLocaleString()} sub={`/ ${totals.cap.toLocaleString()}`} color="var(--color-info-500)" />
        <Stat icon={TrendingUp} label={t('animalsPage.statUtilization')} value={`${Math.round((totals.head / Math.max(totals.cap, 1)) * 100)}%`} color="var(--color-forest-500)" />
        <Stat icon={AlertTriangle} label={t('animalsPage.statAttention')} value={totals.atRisk}
          sub={totals.atRisk ? t('animalsPage.statAttentionSub') : t('animalsPage.statAttentionSubClear')}
          color={totals.atRisk ? 'var(--color-alert-500)' : 'var(--color-forest-500)'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-cream-200 bg-white p-1">
          {filterChips.map((f) => {
            const Icon = f.icon
            const active = filter === f.id
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
                style={{
                  background: active ? 'var(--color-forest-600)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-slate-mid)',
                }}
              >
                <Icon size={13} /> {f.label}
              </button>
            )
          })}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('animalsPage.searchPlaceholder')}
            className="w-full rounded-xl border border-cream-200 bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        <div className="flex rounded-xl border border-cream-200 bg-white p-1">
          <button onClick={() => setView('grid')}
            className={`rounded-lg p-1.5 ${view === 'grid' ? 'bg-forest-50 text-forest-700' : 'text-slate-soft'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setView('list')}
            className={`rounded-lg p-1.5 ${view === 'list' ? 'bg-forest-50 text-forest-700' : 'text-slate-soft'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-cream-200 bg-white">
          <SproutLoader label={t('common.loading')} />
        </div>
      ) : enclosures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-200 bg-white p-12 text-center">
          <Warehouse size={28} className="mx-auto text-slate-soft" />
          <p className="mt-3 text-[14px] font-semibold text-slate-ink">{t('animalsPage.emptyTitle')}</p>
          <p className="mt-1 text-[12px] text-slate-soft">{t('animalsPage.emptyDesc')}</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {enclosures.map((enc) => (
            <EnclosureCard key={enc.id} enc={enc} onOpen={() => {}} />
          ))}
        </div>
      ) : (
        <EnclosureTable rows={enclosures} />
      )}

      <CreateEnclosureModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={async (e) => {
          await createEnclosure({ ...e, farmId: farm.id, branchId: selectedBranchId !== 'all' ? selectedBranchId : null })
          setOpenCreate(false)
          await loadEnclosures()
        }}
      />
    </div>
  )
}

function EnclosureTable({ rows }) {
  const { t } = useTranslation()
  const ENCLOSURE_TYPES = useEnclosureTypes()
  const SPECIES = useSpecies()
  const HEALTH_STATES = useHealthStates()

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-cream-50 text-[10px] uppercase tracking-wider text-slate-soft">
          <tr>
            <th className="px-4 py-3 font-semibold">{t('animalsPage.tableEnclosure')}</th>
            <th className="px-4 py-3 font-semibold">{t('animalsPage.tableType')}</th>
            <th className="px-4 py-3 font-semibold">{t('animalsPage.tableSpecies')}</th>
            <th className="px-4 py-3 font-semibold">{t('animalsPage.tableOccupancy')}</th>
            <th className="px-4 py-3 font-semibold">{t('animalsPage.tableHealth')}</th>
            <th className="px-4 py-3 font-semibold">{t('animalsPage.tableSize')}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const type = ENCLOSURE_TYPES.find((tt) => tt.id === e.type)
            const species = SPECIES.find((s) => s.id === e.speciesId)
            const health = HEALTH_STATES.find((h) => h.id === e.health)
            const TypeIcon = type.icon
            return (
              <tr key={e.id} className="border-t border-cream-200 hover:bg-cream-50">
                <td className="px-4 py-3 font-semibold text-slate-ink">{e.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: type.accent }}>
                    <TypeIcon size={13} /> {type.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-mid">
                  {species?.label} <span className="text-slate-soft">· {e.speciesNote}</span>
                </td>
                <td className="w-48 px-4 py-3">
                  <OccupancyBar occupied={e.occupied} capacity={e.capacity} />
                </td>
                <td className="px-4 py-3">
                  <Chip color={health.color} soft>{health.label}</Chip>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-mid">{e.size} {type.sizeUnit}</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-md p-1.5 text-slate-soft hover:bg-cream-100">
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}