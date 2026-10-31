import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Menu, Plus, User, Settings as Cog, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LanguageToggle from '@/components/common/LanguageToggle'
import BranchSelector from './BranchSelector'
import CreateBranchDialog from '@/components/branch/CreateBranchDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

export default function AppTopbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const farm = useAuthStore((s) => s.farm)
  const logout = useAuthStore((s) => s.logout)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const [branchOpen, setBranchOpen] = useState(false)

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-forest-50 bg-white/90 backdrop-blur">
      <div className="h-full px-4 flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-sage" onClick={toggleSidebar} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          {farm?.logo ? (
            <img src={farm.logo} alt="" className="h-8 w-8 rounded-lg object-cover border border-forest-50" />
          ) : (
            <img src="/sprout.svg" alt="" className="h-8 w-8" />
          )}
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-semibold text-forest-900 truncate max-w-[180px]">{farm?.name}</p>
            <p className="text-[11px] text-forest-700/60 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block"><BranchSelector /></div>

          <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => setBranchOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">{t('branch.new')}</span>
          </Button>

          <LanguageToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-forest text-white text-xs font-semibold flex items-center justify-center hover:opacity-90">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm text-forest-900 font-semibold normal-case">{user?.name}</span>
                  <span className="text-[11px] text-forest-700/60 normal-case">{user?.contact}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> {t('profile.title')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile#password" className="flex items-center gap-2 cursor-pointer">
                  <KeyRound className="h-4 w-4" /> {t('profile.changePassword')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <Cog className="h-4 w-4" /> {t('sidebar.settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogout} className="text-red-600 focus:bg-red-50">
                <LogOut className="h-4 w-4" /> {t('dashboard.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CreateBranchDialog open={branchOpen} onOpenChange={setBranchOpen} />
    </header>
  )
}