import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Beef, Wallet, ShoppingCart, Milk, Package,
  Zap, Users, BarChart3, Settings, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

const NAV = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/animals', key: 'animals', icon: Beef },
  { to: '/dashboard/expenses', key: 'expenses', icon: Wallet },
  { to: '/dashboard/sales', key: 'sales', icon: ShoppingCart },
  { to: '/dashboard/production', key: 'production', icon: Milk },
  { to: '/dashboard/inventory', key: 'inventory', icon: Package },
  { to: '/dashboard/utilities', key: 'utilities', icon: Zap },
  { to: '/dashboard/workers', key: 'workers', icon: Users },
  { to: '/dashboard/reports', key: 'reports', icon: BarChart3 },
  { to: '/dashboard/settings', key: 'settings', icon: Settings },
]

export default function AppSidebar() {
  const { t } = useTranslation()
  const { sidebarOpen, closeSidebar } = useAppStore()

  const Body = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-4 border-b border-forest-50">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src="/sprout.svg" alt="" className="h-7 w-7" />
          <span className="text-base font-bold text-forest-800">{t('brand.name')}</span>
        </NavLink>
        <button className="md:hidden p-1.5 rounded-lg hover:bg-sage" onClick={closeSidebar}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeSidebar}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-forest text-white shadow-soft'
                  : 'text-forest-800 hover:bg-sage'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t(`sidebar.${key}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-forest-50">
        <p className="text-[11px] text-forest-700/50">© {new Date().getFullYear()} Khamar</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-forest-50 bg-white">
        {Body}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeSidebar} />
          <aside className="fixed left-0 top-0 z-50 h-dvh w-64 bg-white shadow-card md:hidden">
            {Body}
          </aside>
        </>
      )}
    </>
  )
}