import { useEffect, useState } from 'react'
import { Check, ChevronDown, GitBranch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default function BranchSelector() {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const { selectedBranchId, setBranch } = useAppStore()
  const [branches, setBranches] = useState([])

  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
  }, [farm])

  const current = selectedBranchId === 'all'
    ? { name: t('branch.all') }
    : branches.find((b) => b.id === selectedBranchId) || { name: t('branch.all') }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 h-10 text-sm font-medium text-forest-800 hover:bg-sage/60">
          <GitBranch className="h-4 w-4 text-forest-700" />
          <span className="hidden sm:inline truncate max-w-[140px]">{current.name}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t('branch.select')}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setBranch('all')}>
          <Check className={cn('h-4 w-4', selectedBranchId === 'all' ? 'opacity-100' : 'opacity-0')} />
          <span className="font-medium">{t('branch.all')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {branches.map((b) => (
          <DropdownMenuItem key={b.id} onSelect={() => setBranch(b.id)}>
            <Check className={cn('h-4 w-4', selectedBranchId === b.id ? 'opacity-100' : 'opacity-0')} />
            <div className="flex flex-col">
              <span>{b.name}</span>
              <span className="text-xs text-forest-700/60">{b.location}</span>
            </div>
          </DropdownMenuItem>
        ))}
        {branches.length === 0 && (
          <div className="px-3 py-2 text-xs text-forest-700/60">{t('branch.none')}</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}