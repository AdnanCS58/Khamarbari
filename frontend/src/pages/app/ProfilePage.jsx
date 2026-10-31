import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Save, KeyRound, User, Building2, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { updateFarm, changePassword } from '@/services/profileService'
import { listBranches } from '@/services/branchService'

export default function ProfilePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const farm = useAuthStore((s) => s.farm)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const setBranch = useAppStore((s) => s.setBranch)

  const [branches, setBranches] = useState([])
  const [farmLogo, setFarmLogo] = useState(farm?.logo || null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingFarm, setSavingFarm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [farmMsg, setFarmMsg] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const logoRef = useRef(null)

  // Profile form
  const profileSchema = z.object({
    name: z.string().min(2, t('errors.required')),
    contact: z.string().regex(/^01[3-9]\d{8}$/, t('errors.mobile')),
    email: z.union([z.string().email(t('errors.email')), z.literal('')]).optional(),
  })
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', contact: user?.contact || '', email: user?.email || '' },
  })

  // Farm form
  const farmSchema = z.object({
    name: z.string().min(2, t('errors.required')),
    license: z.string().min(3, t('errors.required')),
    ownerName: z.string().min(2, t('errors.required')),
    address: z.string().min(5, t('errors.required')),
    contact: z.string().regex(/^01[3-9]\d{8}$/, t('errors.mobile')),
    email: z.union([z.string().email(t('errors.email')), z.literal('')]).optional(),
  })
  const farmForm = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: farm?.name || '',
      license: farm?.license || '',
      ownerName: farm?.ownerName || '',
      address: farm?.address || '',
      contact: farm?.contact || '',
      email: farm?.email || '',
    },
  })

  // Password form
  const pwSchema = z.object({
    current: z.string().min(1, t('errors.required')),
    next: z.string().min(6, t('errors.password')),
    confirm: z.string(),
  }).refine((d) => d.next === d.confirm, { path: ['confirm'], message: t('errors.passwordMatch') })
  const pwForm = useForm({ resolver: zodResolver(pwSchema), defaultValues: { current: '', next: '', confirm: '' } })

  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
  }, [farm])

  const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => setFarmLogo(reader.result)
    reader.readAsDataURL(file)
  }

  const saveProfile = async (values) => {
    setSavingProfile(true); setProfileMsg('')
    const { error } = await updateProfile(values)
    setSavingProfile(false)
    setProfileMsg(error || t('common.saved'))
  }

  const saveFarm = async (values) => {
    setSavingFarm(true); setFarmMsg('')
    const { data, error } = await updateFarm(farm.id, { ...values, logo: farmLogo })
    setSavingFarm(false)
    setFarmMsg(error || t('common.saved'))
    if (data) {
      useAuthStore.setState({ farm: data })
    }
  }

  const savePassword = async (values) => {
    setSavingPassword(true); setPwMsg(''); setPwError('')
    const { error } = await changePassword(user.id, {
      currentPassword: values.current, newPassword: values.next,
    })
    setSavingPassword(false)
    if (error) { setPwError(error); return }
    pwForm.reset()
    setPwMsg(t('profile.passwordChanged'))
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-forest-700/70">{t('profile.subtitle')}</p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-forest-700" /> {t('profile.accountInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div>
              <Label>{t('profile.name')}</Label>
              <Input {...profileForm.register('name')} className="mt-1.5" />
              {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label>{t('profile.contact')}</Label>
              <Input {...profileForm.register('contact')} className="mt-1.5" inputMode="tel" />
              {profileForm.formState.errors.contact && <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.contact.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>{t('profile.email')}</Label>
              <Input {...profileForm.register('email')} className="mt-1.5" type="email" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between">
              <span className="text-xs text-forest-700/70">
                {t('profile.role')}: <b className="capitalize">{user?.role}</b>
              </span>
              <div className="flex items-center gap-3">
                {profileMsg && <span className="text-xs text-fresh-600">{profileMsg}</span>}
                <Button type="submit" disabled={savingProfile}>
                  <Save className="h-4 w-4" /> {savingProfile ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Farm info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-forest-700" /> {t('profile.farmInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={farmForm.handleSubmit(saveFarm)} className="space-y-4" noValidate>
            <div>
              <Label>{t('profile.farmLogo')}</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {farmLogo ? (
                  <div className="relative h-16 w-16 rounded-xl border border-forest-100 overflow-hidden bg-sage">
                    <img src={farmLogo} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setFarmLogo(null)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-forest-100 shadow flex items-center justify-center">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => logoRef.current?.click()} className="h-16 w-16 rounded-xl border-2 border-dashed border-forest-100 bg-sage/40 flex items-center justify-center text-forest-700 hover:bg-sage">
                    <Upload className="h-5 w-5" />
                  </button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                  {t('profile.uploadLogo')}
                </Button>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogoChange} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('profile.farmName')}</Label>
                <Input {...farmForm.register('name')} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('profile.license')}</Label>
                <Input {...farmForm.register('license')} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('profile.ownerName')}</Label>
                <Input {...farmForm.register('ownerName')} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('profile.contact')}</Label>
                <Input {...farmForm.register('contact')} className="mt-1.5" inputMode="tel" />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('profile.email')}</Label>
                <Input {...farmForm.register('email')} className="mt-1.5" type="email" />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('profile.address')}</Label>
                <Input {...farmForm.register('address')} className="mt-1.5" />
              </div>
            </div>

            <div className="flex justify-end items-center gap-3">
              {farmMsg && <span className="text-xs text-fresh-600">{farmMsg}</span>}
              <Button type="submit" disabled={savingFarm}>
                <Save className="h-4 w-4" /> {savingFarm ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card id="password">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-forest-700" /> {t('profile.changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={pwForm.handleSubmit(savePassword)} className="space-y-4" noValidate>
            <div>
              <Label>{t('profile.currentPassword')}</Label>
              <Input type="password" {...pwForm.register('current')} className="mt-1.5" />
              {pwForm.formState.errors.current && <p className="mt-1 text-xs text-red-600">{pwForm.formState.errors.current.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('profile.newPassword')}</Label>
                <Input type="password" {...pwForm.register('next')} className="mt-1.5" />
                {pwForm.formState.errors.next && <p className="mt-1 text-xs text-red-600">{pwForm.formState.errors.next.message}</p>}
              </div>
              <div>
                <Label>{t('profile.confirmPassword')}</Label>
                <Input type="password" {...pwForm.register('confirm')} className="mt-1.5" />
                {pwForm.formState.errors.confirm && <p className="mt-1 text-xs text-red-600">{pwForm.formState.errors.confirm.message}</p>}
              </div>
            </div>
            {pwError && <p className="text-xs text-red-600">{pwError}</p>}
            <div className="flex justify-end items-center gap-3">
              {pwMsg && <span className="text-xs text-fresh-600">{pwMsg}</span>}
              <Button type="submit" disabled={savingPassword}>
                <Save className="h-4 w-4" /> {savingPassword ? t('common.loading') : t('profile.updatePassword')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}