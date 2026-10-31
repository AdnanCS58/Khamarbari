import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Upload, X, Building2, UserCircle, MapPin, ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { buildSignupSchema } from '@/lib/validators/authSchemas'
import { DIVISIONS, getDistricts, getUpazilas } from '@/lib/bd-geo'
import { useAuthStore } from '@/store/authStore'

export default function SignupPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const register_ = useAuthStore((s) => s.register)
  const schema = useMemo(() => buildSignupSchema(t), [i18n.language])

  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      farmName: '', license: '', division: '', district: '', zilla: '', upazila: '',
      address: '', ownerName: '', nid: '', email: '', contact: '', password: '', confirm: '',
      terms: false,
    },
    mode: 'onBlur',
  })

  const division = watch('division')
  const district = watch('district')

  useEffect(() => { setValue('district', ''); setValue('zilla', ''); setValue('upazila', '') }, [division, setValue])
  useEffect(() => { setValue('zilla', district); setValue('upazila', '') }, [district, setValue])

  const districts = getDistricts(division)
  const upazilas = getUpazilas(division, district)

  const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      setServerError('Logo must be under 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const { error } = await register_({ ...values, logo: logoDataUrl })
    setSubmitting(false)
    if (error) {
      setServerError(error)
      return
    }
    navigate('/login?registered=1')
  }

  return (
    <AuthLayout title="Create your farm account" subtitle="Join Khamar and digitize your operations today." side="illustration">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {serverError}
          </div>
        )}

        {/* SECTION 1: Farm Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-forest-100 pb-2 mb-4">
            <Building2 className="h-5 w-5 text-forest-600" />
            <h3 className="text-lg font-semibold text-forest-900">Farm Details</h3>
          </div>

          <div className="flex items-center gap-4">
            {logoDataUrl ? (
              <div className="relative h-20 w-20 rounded-2xl border border-forest-100 overflow-hidden bg-sage shadow-sm">
                <img src={logoDataUrl} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => { setLogoDataUrl(null); if (fileRef.current) fileRef.current.value = '' }} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 shadow flex items-center justify-center text-red-600 hover:bg-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="h-20 w-20 rounded-2xl border-2 border-dashed border-forest-200 bg-forest-50/50 flex flex-col items-center justify-center text-forest-500 hover:bg-forest-50 hover:border-forest-300 transition-colors">
                <Upload className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-medium">Upload</span>
              </button>
            )}
            <div>
              <Label className="text-forest-900 font-semibold">Farm Logo <span className="text-forest-400 font-normal">(Optional)</span></Label>
              <p className="text-xs text-forest-500 mt-1">PNG or JPG, max 1MB. Helps identify your farm.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogoChange} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Farm Name" error={errors.farmName?.message}>
              <Input {...register('farmName')} placeholder="e.g. Green Valley Farm" className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
            <Field label="Govt. License Number" error={errors.license?.message}>
              <Input {...register('license')} placeholder="e.g. BD-FARM-2024-00123" className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
          </div>
        </div>

        {/* SECTION 2: Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-forest-100 pb-2 mb-4">
            <MapPin className="h-5 w-5 text-forest-600" />
            <h3 className="text-lg font-semibold text-forest-900">Location</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Division" error={errors.division?.message}>
              <Select value={division} onValueChange={(v) => setValue('division', v, { shouldValidate: true })}>
                <SelectTrigger className="h-11 bg-forest-50/30"><SelectValue placeholder="Select Division" /></SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="District" error={errors.district?.message}>
              <Select value={district} onValueChange={(v) => setValue('district', v, { shouldValidate: true })} disabled={!division}>
                <SelectTrigger className="h-11 bg-forest-50/30"><SelectValue placeholder="Select District" /></SelectTrigger>
                <SelectContent>
                  {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Zilla" error={errors.zilla?.message}>
              <Input {...register('zilla')} placeholder="Auto-filled" className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
            <Field label="Upazila" error={errors.upazila?.message}>
              <Select value={watch('upazila')} onValueChange={(v) => setValue('upazila', v, { shouldValidate: true })} disabled={!district}>
                <SelectTrigger className="h-11 bg-forest-50/30"><SelectValue placeholder="Select Upazila" /></SelectTrigger>
                <SelectContent>
                  {upazilas.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Office Address" error={errors.address?.message}>
            <Textarea rows={2} {...register('address')} placeholder="Full street address" className="bg-forest-50/30 focus:bg-white resize-none" />
          </Field>
        </div>

        {/* SECTION 3: Owner Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-forest-100 pb-2 mb-4">
            <UserCircle className="h-5 w-5 text-forest-600" />
            <h3 className="text-lg font-semibold text-forest-900">Owner Details</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Owner Name" error={errors.ownerName?.message}>
              <Input {...register('ownerName')} className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
            <Field label="Owner NID" error={errors.nid?.message}>
              <Input {...register('nid')} inputMode="numeric" placeholder="10, 13, or 17 digits" className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
            <Field label="Email Address" error={errors.email?.message}>
              <Input type="email" {...register('email')} placeholder="you@example.com" className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
            <Field label="Contact Number" error={errors.contact?.message}>
              <Input {...register('contact')} inputMode="tel" placeholder="01712345678" className="h-11 bg-forest-50/30 focus:bg-white" />
            </Field>
          </div>
        </div>

        {/* SECTION 4: Security */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-forest-100 pb-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-forest-600" />
            <h3 className="text-lg font-semibold text-forest-900">Security</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} {...register('password')} placeholder="••••••••" className="h-11 bg-forest-50/30 focus:bg-white" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-forest-400 hover:text-forest-700">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" error={errors.confirm?.message}>
              <div className="relative">
                <Input type={showConfirm ? 'text' : 'password'} {...register('confirm')} placeholder="••••••••" className="h-11 bg-forest-50/30 focus:bg-white" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-forest-400 hover:text-forest-700">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 text-sm text-forest-700 cursor-pointer">
            <Checkbox onCheckedChange={(v) => setValue('terms', v === true, { shouldValidate: true })} className="mt-0.5" />
            <span className="leading-relaxed">I agree to the <a href="#" className="text-forest-600 font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-forest-600 font-medium hover:underline">Privacy Policy</a>.</span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-red-600">{errors.terms.message}</p>}
        </div>

        <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-forest-600/20" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Farm Account'}
        </Button>

        <p className="text-sm text-center text-forest-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-forest-800 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <Label className="text-forest-900 font-semibold mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}