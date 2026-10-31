export const SALE_ITEM_TYPES = [
  { id: 'animal',   label: 'Animal',    labelBn: 'পশু',     unit: 'head' },
  { id: 'milk',     label: 'Milk',      labelBn: 'দুধ',     unit: 'L' },
  { id: 'egg',      label: 'Eggs',      labelBn: 'ডিম',     unit: 'pcs' },
  { id: 'fish',     label: 'Fish',      labelBn: 'মাছ',     unit: 'kg' },
  { id: 'crop',     label: 'Crop',      labelBn: 'ফসল',     unit: 'kg' },
  { id: 'manure',   label: 'Manure',    labelBn: 'গোবর',    unit: 'kg' },
  { id: 'other',    label: 'Other',     labelBn: 'অন্যান্য', unit: 'unit' },
]

export const PAYMENT_STATUSES = [
  { id: 'paid',    label: 'Paid',    labelBn: 'পরিশোধিত',  color: '#65A765' },
  { id: 'partial', label: 'Partial', labelBn: 'আংশিক',    color: '#F59E0B' },
  { id: 'unpaid',  label: 'Unpaid',  labelBn: 'অপরিশোধিত', color: '#DC2626' },
]

export const PAYMENT_METHODS_SALE = ['cash', 'bkash', 'nagad', 'rocket', 'bank', 'card', 'credit', 'other']