import { Link } from 'react-router-dom'
import AmbientFarm from '@/components/animations/AmbientFarm'

export default function AuthLayout({ children, title, subtitle, side = 'illustration' }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-cream">
      {/* Left: illustration */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-forest-900 via-forest-700 to-fresh-600 text-white p-12 overflow-hidden">
        <AmbientFarm />
        <Link to="/" className="relative flex items-center gap-2">
          <img src="/sprout.svg" alt="" className="h-9 w-9 brightness-0 invert" />
          <span className="text-xl font-bold">Khamar</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight max-w-md">
            {side === 'illustration'
              ? 'Grow with numbers you can trust.'
              : 'Welcome to your farm, digitised.'}
          </h2>
          <p className="mt-3 text-white/80 max-w-md">
            Animals, expenses, production and workers — one clean dashboard for every branch.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Khamar. Built in Bangladesh.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img src="/sprout.svg" alt="" className="h-8 w-8" />
              <span className="text-lg font-bold text-forest-800">Khamar</span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-forest-900">{title}</h1>
            {subtitle && <p className="mt-2 text-forest-700/80">{subtitle}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}