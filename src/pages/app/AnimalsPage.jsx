import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Beef, Warehouse, Waves, Rows3, Plus, Search, Filter, LayoutGrid, List,
  ChevronRight, MoreVertical, X, Bird, Fish, Rabbit, Milk, Egg, Weight,
  Thermometer, Droplets, Activity, HeartPulse, CalendarDays, Users,
  MapPin, Pencil, Trash2, Check, AlertTriangle, TrendingUp, Baby, Skull,
  ClipboardList, Syringe, Ruler, Boxes, Wheat,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────────
   Domain model / constants
──────────────────────────────────────────────────────────── */
const ENCLOSURE_TYPES = [
  {
    id: 'room',
    icon: Warehouse,
    label: 'Room',
    hint: 'Housing for poultry, rabbits, etc.',
    sizeLabel: 'Floor area',
    sizeUnit: 'm²',
    capacityLabel: 'Max headcount',
    accent: 'var(--color-forest-500)',
  },
  {
    id: 'line',
    icon: Rows3,
    label: 'Line',
    hint: 'Tether/stanchion line for cattle, goats, sheep',
    sizeLabel: 'Line length',
    sizeUnit: 'm',
    capacityLabel: 'Seats on line',
    accent: 'var(--color-warn-500)',
  },
  {
    id: 'pond',
    icon: Waves,
    label: 'Pond',
    hint: 'Water body for fish, shrimp, ducks',
    sizeLabel: 'Surface area',
    sizeUnit: 'm²',
    capacityLabel: 'Stocking density (max)',
    accent: 'var(--color-info-500)',
  },
]

const SPECIES = [
  { id: 'chicken',  label: 'Chicken',      icon: Bird,    enclosure: 'room', defaultBreed: 'Broiler / Layer' },
  { id: 'duck',     label: 'Duck',         icon: Bird,    enclosure: 'pond', defaultBreed: 'Khaki Campbell' },
  { id: 'cow',      label: 'Cow',          icon: Beef,    enclosure: 'line', defaultBreed: 'Holstein Friesian' },
  { id: 'goat',     label: 'Goat',         icon: Beef,    enclosure: 'line', defaultBreed: 'Black Bengal' },
  { id: 'sheep',    label: 'Sheep',        icon: Beef,    enclosure: 'line', defaultBreed: 'Garole' },
  { id: 'fish',     label: 'Fish',         icon: Fish,    enclosure: 'pond', defaultBreed: 'Tilapia / Rohu' },
  { id: 'shrimp',   label: 'Shrimp',       icon: Fish,    enclosure: 'pond', defaultBreed: 'Bagda' },
  { id: 'rabbit',   label: 'Rabbit',       icon: Rabbit,  enclosure: 'room', defaultBreed: 'New Zealand' },
]

const HEALTH_STATES = [
  { id: 'healthy',   label: 'Healthy',   color: 'var(--color-forest-500)' },
  { id: 'watch',     label: 'Watch',     color: 'var(--color-warn-500)' },
  { id: 'treatment', label: 'Treatment', color: 'var(--color-alert-500)' },
  { id: 'quarantine',label: 'Quarantine',color: 'var(--color-info-500)' },
]

/* Demo seed — replace with real data source */
const SEED = [
  {
    id: 'r1', type: 'room', name: 'Broiler House A', speciesId: 'chicken',
    speciesNote: 'Cobb 500', size: 240, capacity: 5000, occupied: 4820,
    health: 'healthy', temp: 27.5, humidity: 62, ageDays: 21, lastCheck: '2h ago',
    barnId: 'Barn 1', feed: 'Starter', eggToday: 0, mortality7d: 12,
  },
  {
    id: 'l1', type: 'line', name: 'Dairy Line 1', speciesId: 'cow',
    speciesNote: 'Holstein × Friesian', size: 60, capacity: 40, occupied: 32,
    health: 'watch', temp: 38.4, humidity: 55, ageDays: 1240, lastCheck: '30m ago',
    barnId: 'Barn 2', milkToday: 412, milkTarget: 460, mortality7d: 0,
  },
  {
    id: 'p1', type: 'pond', name: 'North Pond', speciesId: 'fish',
    speciesNote: 'Nile Tilapia', size: 900, capacity: 4500, occupied: 4200,
    health: 'healthy', temp: 28.1, ph: 7.4, do: 6.2, ageDays: 60, lastCheck: '1h ago',
    barnId: 'Field 3', feed: 'Grower pellet', mortality7d: 34,
  },
  {
    id: 'r2', type: 'room', name: 'Layer House B', speciesId: 'chicken',
    speciesNote: 'Lohmann Brown', size: 300, capacity: 6000, occupied: 5870,
    health: 'healthy', temp: 24.0, humidity: 58, ageDays: 180, lastCheck: '15m ago',
    barnId: 'Barn 1', eggToday: 5410, eggTarget: 5700, mortality7d: 6,
  },
  {
    id: 'l2', type: 'line', name: 'Goat Line West', speciesId: 'goat',
    speciesNote: 'Black Bengal', size: 45, capacity: 60, occupied: 48,
    health: 'watch', temp: 39.1, humidity: 60, ageDays: 420, lastCheck: '2h ago',
    barnId: 'Barn 3', mortality7d: 1,
  },
]

/* ────────────────────────────────────────────────────────────
   Small UI atoms
──────────────────────────────────────────────────────────── */
const Chip = ({ children, color, soft, icon: Icon, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    style={{
      color: soft ? color : '#fff',
      background: soft ? `${color}1A` : color,
    }}
  >
    {Icon && <Icon size={11} />}
    {children}
  </span>
)

const Stat = ({ icon: Icon, label, value, sub, color }) => (
  <div className="flex items-center gap-2.5 rounded-lg border border-cream-200 bg-white px-3 py-2">
    <div
      className="flex h-8 w-8 items-center justify-center rounded-md"
      style={{ background: `${color ?? 'var(--color-forest-500)'}15` }}
    >
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
  const color =
    pct >= 95 ? 'var(--color-alert-500)'
    : pct >= 80 ? 'var(--color-warn-500)'
    : 'var(--color-forest-500)'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-10 text-right text-[11px] font-semibold tabular-nums text-slate-soft">
        {pct}%
      </span>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Enclosure card
──────────────────────────────────────────────────────────── */
const EnclosureCard = ({ enc, onOpen }) => {
  const type = ENCLOSURE_TYPES.find((t) => t.id === enc.type)
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
      {/* Type ribbon */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: type.accent }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${type.accent}15` }}
          >
            <TypeIcon size={18} style={{ color: type.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: type.accent }}>
              {type.label}
            </p>
            <h3 className="text-[15px] font-bold leading-tight text-slate-ink">{enc.name}</h3>
          </div>
        </div>
        <MoreVertical size={16} className="text-slate-soft opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Species row */}
      <div className="mt-3 flex items-center gap-2">
        <SpeciesIcon size={14} className="text-slate-soft" />
        <span className="text-[12px] font-medium text-slate-ink">{species?.label}</span>
        <span className="text-[11px] text-slate-soft">· {enc.speciesNote}</span>
      </div>

      {/* Occupancy */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-slate-soft">Occupancy</span>
          <span className="text-[12px] font-semibold tabular-nums text-slate-ink">
            {enc.occupied.toLocaleString()}
            <span className="text-slate-soft"> / {enc.capacity.toLocaleString()}</span>
          </span>
        </div>
        <OccupancyBar occupied={enc.occupied} capacity={enc.capacity} />
      </div>

      {/* Meta chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Chip color={health.color} soft icon={HeartPulse}>{health.label}</Chip>
        <Chip color="var(--color-slate-soft)" soft icon={Ruler}>
          {enc.size} {type.sizeUnit}
        </Chip>
        <Chip color="var(--color-slate-soft)" soft icon={CalendarDays}>
          {enc.ageDays}d
        </Chip>
        <Chip color="var(--color-slate-soft)" soft icon={MapPin}>
          {enc.barnId}
        </Chip>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
        <span className="text-[10px] text-slate-soft">Checked {enc.lastCheck}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: type.accent }}>
          Manage <ChevronRight size={12} />
        </span>
      </div>
    </button>
  )
}

/* ────────────────────────────────────────────────────────────
   Create enclosure modal
──────────────────────────────────────────────────────────── */
function CreateEnclosureModal({ open, onClose, onCreate }) {
  const [type, setType] = useState('room')
  const [speciesId, setSpeciesId] = useState('chicken')
  const [name, setName] = useState('')
  const [barnId, setBarnId] = useState('')
  const [speciesNote, setSpeciesNote] = useState('')
  const [size, setSize] = useState('')
  const [capacity, setCapacity] = useState('')
  const [notes, setNotes] = useState('')

  if (!open) return null
  const cfg = ENCLOSURE_TYPES.find((t) => t.id === type)
  const allowedSpecies = SPECIES.filter((s) => s.enclosure === type)

  const valid = name && size && capacity && speciesId

  const submit = () => {
    if (!valid) return
    onCreate({
      id: `e${Date.now()}`,
      type,
      name,
      barnId: barnId || '—',
      speciesId,
      speciesNote: speciesNote || SPECIES.find((s) => s.id === speciesId)?.defaultBreed || '',
      size: Number(size),
      capacity: Number(capacity),
      occupied: 0,
      health: 'healthy',
      lastCheck: 'just now',
      notes,
      ageDays: 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-ink/40 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: '1px solid var(--color-cream-200)' }}
      >
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-ink">New Enclosure</h2>
            <p className="text-[11px] text-slate-soft">Define a space, its size, and its species.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-soft hover:bg-cream-100">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {/* Type */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
              Enclosure type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ENCLOSURE_TYPES.map((t) => {
                const Icon = t.icon
                const active = type === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setType(t.id)
                      const first = SPECIES.find((s) => s.enclosure === t.id)
                      setSpeciesId(first?.id)
                    }}
                    className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all"
                    style={{
                      borderColor: active ? t.accent : 'var(--color-cream-200)',
                      background: active ? `${t.accent}10` : '#fff',
                    }}
                  >
                    <Icon size={18} style={{ color: active ? t.accent : 'var(--color-slate-soft)' }} />
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: active ? t.accent : 'var(--color-slate-ink)' }}
                    >
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-soft">{cfg.hint}</p>
          </div>

          {/* Name + Barn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${type === 'room' ? 'Broiler House A' : type === 'line' ? 'Dairy Line 1' : 'North Pond'}`}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                Location / Barn
              </label>
              <input
                value={barnId}
                onChange={(e) => setBarnId(e.target.value)}
                placeholder="Barn 1 / Field 2"
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
              Species
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allowedSpecies.map((s) => {
                const Icon = s.icon
                const active = speciesId === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSpeciesId(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                    style={{
                      borderColor: active ? 'var(--color-forest-500)' : 'var(--color-cream-200)',
                      background: active ? 'var(--color-forest-50)' : '#fff',
                      color: active ? 'var(--color-forest-700)' : 'var(--color-slate-mid)',
                    }}
                  >
                    <Icon size={13} />
                    {s.label}
                  </button>
                )
              })}
            </div>
            <input
              value={speciesNote}
              onChange={(e) => setSpeciesNote(e.target.value)}
              placeholder={SPECIES.find((s) => s.id === speciesId)?.defaultBreed || 'Breed / strain note'}
              className="mt-2 w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          {/* Size + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                {cfg.sizeLabel} ({cfg.sizeUnit})
              </label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder={type === 'line' ? '60' : type === 'pond' ? '900' : '240'}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] tabular-nums outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                {cfg.capacityLabel}
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder={type === 'line' ? '40' : '5000'}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] tabular-nums outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ventilation, water source, feed schedule…"
              className="w-full resize-none rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-cream-200 bg-cream-50 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-soft hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="rounded-lg bg-forest-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-forest-700 disabled:opacity-40"
          >
            Create enclosure
          </button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Main page
──────────────────────────────────────────────────────────── */
export default function AnimalsPage() {
  const { t } = useTranslation()
  const [enclosures, setEnclosures] = useState(SEED)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [openCreate, setOpenCreate] = useState(false)

  const filtered = useMemo(() => {
    return enclosures.filter((e) => {
      if (filter !== 'all' && e.type !== filter) return false
      if (query && !`${e.name} ${e.speciesNote}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [enclosures, filter, query])

  const totals = useMemo(() => {
    const head = enclosures.reduce((s, e) => s + e.occupied, 0)
    const cap  = enclosures.reduce((s, e) => s + e.capacity, 0)
    const atRisk = enclosures.filter((e) => e.health !== 'healthy').length
    return { head, cap, atRisk }
  }, [enclosures])

  return (
    <div className="space-y-5 p-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Animals & Habitats</h1>
          <p className="mt-1 text-[13px] text-slate-soft">
            Enclosures, occupancy, and per-species management across the farm.
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-forest-700 hover:shadow-md"
        >
          <Plus size={16} /> New enclosure
        </button>
      </div>

      {/* ── Aggregate stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Boxes} label="Enclosures" value={enclosures.length} sub="active" color="var(--color-forest-500)" />
        <Stat icon={Users} label="Head count" value={totals.head.toLocaleString()} sub={`/ ${totals.cap.toLocaleString()}`} color="var(--color-info-500)" />
        <Stat icon={TrendingUp} label="Utilization" value={`${Math.round((totals.head / Math.max(totals.cap,1)) * 100)}%`} color="var(--color-forest-500)" />
        <Stat icon={AlertTriangle} label="Needs attention" value={totals.atRisk} sub={totals.atRisk ? 'enclosures' : 'all clear'} color={totals.atRisk ? 'var(--color-alert-500)' : 'var(--color-forest-500)'} />
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-cream-200 bg-white p-1">
          {[{ id: 'all', label: 'All', icon: LayoutGrid },
            ...ENCLOSURE_TYPES.map((t) => ({ id: t.id, label: `${t.label}s`, icon: t.icon }))].map((f) => {
            const Icon = f.icon
            const active = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
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
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search enclosures, species, breeds…"
            className="w-full rounded-xl border border-cream-200 bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        <div className="flex rounded-xl border border-cream-200 bg-white p-1">
          <button
            onClick={() => setView('grid')}
            className={`rounded-lg p-1.5 ${view === 'grid' ? 'bg-forest-50 text-forest-700' : 'text-slate-soft'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-lg p-1.5 ${view === 'list' ? 'bg-forest-50 text-forest-700' : 'text-slate-soft'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-200 bg-white p-12 text-center">
          <Warehouse size={28} className="mx-auto text-slate-soft" />
          <p className="mt-3 text-[14px] font-semibold text-slate-ink">No enclosures match</p>
          <p className="mt-1 text-[12px] text-slate-soft">Adjust filters or create a new enclosure.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((enc) => (
            <EnclosureCard key={enc.id} enc={enc} onOpen={() => {}} />
          ))}
        </div>
      ) : (
        <EnclosureTable rows={filtered} />
      )}

      <CreateEnclosureModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={(e) => {
          setEnclosures((prev) => [e, ...prev])
          setOpenCreate(false)
        }}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   List/table view
──────────────────────────────────────────────────────────── */
function EnclosureTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-cream-50 text-[10px] uppercase tracking-wider text-slate-soft">
          <tr>
            <th className="px-4 py-3 font-semibold">Enclosure</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Species</th>
            <th className="px-4 py-3 font-semibold">Occupancy</th>
            <th className="px-4 py-3 font-semibold">Health</th>
            <th className="px-4 py-3 font-semibold">Size</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const type = ENCLOSURE_TYPES.find((t) => t.id === e.type)
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
                <td className="px-4 py-3 tabular-nums text-slate-mid">
                  {e.size} {type.sizeUnit}
                </td>
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