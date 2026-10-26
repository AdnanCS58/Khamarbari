import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'

export default function ReportsPage() {
  const { t } = useTranslation()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.reports')}</h1>
      <div className="mt-6 bg-white rounded-2xl border border-forest-50">
        <EmptyState
          icon={BarChart3}
          title={t('placeholder.comingSoon')}
          description={t('placeholder.comingSoonDesc')}
        />
      </div>
    </div>
  )
}