import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'

export default function ExpensesPage() {
  const { t } = useTranslation()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.expenses')}</h1>
      <div className="mt-6 bg-white rounded-2xl border border-forest-50">
        <EmptyState icon={Wallet} title={t('placeholder.comingSoon')} description={t('placeholder.expensesDesc')} />
      </div>
    </div>
  )
}