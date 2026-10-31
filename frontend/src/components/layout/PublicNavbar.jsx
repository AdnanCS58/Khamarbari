import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LanguageToggle from '@/components/common/LanguageToggle'
import { cn } from '@/lib/utils'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/sprout.svg" alt="" className="h-8 w-8" />
      <span className="text-lg font-bold text-forest-800">Khamar</span>
    </Link>
  )
}

export default function PublicNavbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-forest-50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-forest-800 bg-sage' : 'text-forest-700 hover:bg-sage/60'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">{t('nav.signup')}</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-sage"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-forest-50 bg-white">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium',
                    isActive ? 'text-forest-800 bg-sage' : 'text-forest-700 hover:bg-sage/60'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-forest-50">
              <LanguageToggle />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">{t('nav.signup')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}