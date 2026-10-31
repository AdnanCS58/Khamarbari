import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/uiStore'
import { resetAllData } from '@/services/profileService'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Globe, Palette, AlertTriangle, Languages, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import ConfirmDialog from '@/components/common/ConfirmDialog'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const setLang = useUIStore((s) => s.setLang)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState({ open: false, loading: false })

  const onReset = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    await resetAllData()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.settings')}</h1>
        <p className="mt-1 text-sm text-forest-700/70">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-forest-700" /> {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-forest-700/70 mb-3">{t('settings.languageDesc')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setLang('en')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${i18n.language === 'en' ? 'bg-forest text-white' : 'bg-sage text-forest-800'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${i18n.language === 'bn' ? 'bg-forest text-white' : 'bg-sage text-forest-800'}`}
            >
              বাংলা
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-forest-700" /> {t('settings.regional')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-forest-800">{t('settings.currency')}</span>
            <span className="text-sm font-semibold">BDT (৳)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-forest-800">{t('settings.timezone')}</span>
            <span className="text-sm font-semibold">Asia/Dhaka (GMT+6)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-forest-800">{t('settings.dateFormat')}</span>
            <span className="text-sm font-semibold">DD/MM/YYYY</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-forest-700" /> {t('settings.theme')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-forest-700/70">
            {t('settings.themeDesc')}
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" /> {t('settings.dangerZone')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-forest-700/70 mb-3">{t('settings.resetDesc')}</p>
          <Button variant="destructive" onClick={() => setConfirm({ open: true, loading: false })}>
            {t('settings.resetData')}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('settings.resetTitle')}
        description={t('settings.resetConfirm')}
        confirmLabel={t('settings.resetData')}
        destructive
        loading={confirm.loading}
        onConfirm={onReset}
      />
    </div>
  )
}