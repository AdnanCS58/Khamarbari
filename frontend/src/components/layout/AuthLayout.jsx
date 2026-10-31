import { Link } from 'react-router-dom'
import AmbientFarm from '@/components/animations/AmbientFarm'
import { Leaf } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle, side = 'illustration' }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-cream">
      {/* Left Side - Fixed / Sticky */}
      <div className="hidden lg:flex sticky top-0 h-dvh flex-col justify-between bg-gradient-to-br from-forest-900 via-forest-800 to-fresh-700 text-white p-12 overflow-hidden">
        <AmbientFarm />
        
        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2 w-fit">
          <img src="/sprout.svg" alt="" className="h-9 w-9 brightness-0 invert" />
          <span className="text-2xl font-bold tracking-tight">Khamar</span>
        </Link>

        {/* Marketing Text */}
        <div className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-lime-200 backdrop-blur-sm mb-6 border border-white/10">
            <Leaf className="h-3.5 w-3.5" />
            The modern farm OS
          </div>
          <h2 className="text-4xl font-bold leading-tight max-w-md text-white">
            {side === 'illustration'
              ? 'Grow with numbers you can actually trust.'
              : 'Welcome back to your farm.'}
          </h2>
          <p className="mt-4 text-emerald-50/80 max-w-md text-lg leading-relaxed">
            Animals, expenses, production, and workers — all in one clean dashboard for every branch of your farm.
          </p>
        </div>

        {/* Footer Text */}
        <p className="relative z-10 text-xs text-emerald-100/50">
          © {new Date().getFullYear()} Khamar. Built for farmers in Bangladesh.
        </p>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-8 lg:px-12 min-h-dvh">
        <div className="w-full max-w-xl">
          {/* Mobile Logo (visible only on small screens) */}
          <div className="mb-8 lg:hidden flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/sprout.svg" alt="" className="h-10 w-10" />
              <span className="text-2xl font-bold text-forest-800">Khamar</span>
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-forest-900">{title}</h1>
            {subtitle && <p className="mt-2 text-forest-600">{subtitle}</p>}
          </div>

          {/* The Form Container */}
          <div className="bg-white rounded-3xl shadow-xl border border-forest-100/50 p-6 sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}