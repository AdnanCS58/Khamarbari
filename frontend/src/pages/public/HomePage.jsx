import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowRight, Egg, FlaskConical, Leaf, LineChart, Package, Users, Warehouse, Tractor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AmbientFarm from '@/components/animations/AmbientFarm'

function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}>
      {children}
    </section>
  )
}

function Hero() {
  const { t } = useTranslation()
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sage/70 via-cream to-cream">
      <AmbientFarm />
      <Section className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-forest-100 px-3 py-1 text-xs font-medium text-forest-700 shadow-soft">
              <Leaf className="h-3.5 w-3.5" />
              {t('hero.badge')}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold text-forest-900 text-balance leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="mt-5 text-lg text-forest-700/80 max-w-xl">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  {t('hero.ctaPrimary')} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how">{t('hero.ctaSecondary')}</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </Section>
    </div>
  )
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto max-w-lg">
      <div className="aspect-[5/4] rounded-3xl bg-white shadow-card border border-forest-50 p-6 overflow-hidden">
        <svg viewBox="0 0 400 320" className="w-full h-full">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DCE9D8" />
              <stop offset="100%" stopColor="#F8F6EC" />
            </linearGradient>
          </defs>
          <rect width="400" height="320" fill="url(#sky)" />
          <circle cx="330" cy="70" r="26" fill="#FDE68A" opacity="0.9" />
          <ellipse cx="90" cy="70" rx="34" ry="14" fill="#fff" opacity="0.85" />
          <ellipse cx="120" cy="74" rx="26" ry="11" fill="#fff" opacity="0.85" />
          <path d="M0 220 Q100 160 200 210 T400 200 V320 H0 Z" fill="#65A765" opacity="0.55" />
          <path d="M0 250 Q100 200 200 240 T400 235 V320 H0 Z" fill="#245C3A" opacity="0.85" />
          <rect x="150" y="185" width="80" height="60" fill="#8B6A43" />
          <polygon points="145,185 190,150 235,185" fill="#573F27" />
          <rect x="180" y="215" width="20" height="30" fill="#F8F6EC" />
          {[40, 70, 100, 300, 330, 360].map((x) => (
            <rect key={x} x={x} y="250" width="4" height="24" fill="#8B6A43" />
          ))}
          <rect x="30" y="260" width="120" height="3" fill="#8B6A43" />
          <rect x="290" y="260" width="100" height="3" fill="#8B6A43" />
          <rect x="70" y="215" width="8" height="40" fill="#573F27" />
          <circle cx="74" cy="205" r="24" fill="#245C3A" />
          <circle cx="58" cy="215" r="16" fill="#65A765" />
          <circle cx="90" cy="215" r="16" fill="#65A765" />
        </svg>
      </div>

      <motion.div
        className="absolute -left-4 top-8 rounded-xl bg-white shadow-card border border-forest-50 px-3 py-2 text-xs"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2 text-forest-700">
          <Egg className="h-4 w-4 text-fresh" /> +128 eggs today
        </div>
      </motion.div>
      <motion.div
        className="absolute -right-3 bottom-10 rounded-xl bg-white shadow-card border border-forest-50 px-3 py-2 text-xs"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <div className="flex items-center gap-2 text-forest-700">
          <LineChart className="h-4 w-4 text-fresh" /> Profit ↑ 18%
        </div>
      </motion.div>
    </div>
  )
}

function Features() {
  const { t } = useTranslation()
  const items = [
    { key: 'animals', icon: Tractor },
    { key: 'finance', icon: FlaskConical },
    { key: 'production', icon: Egg },
    { key: 'inventory', icon: Warehouse },
    { key: 'branches', icon: Users },
    { key: 'reports', icon: LineChart },
  ]

  return (
    <Section id="features">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-forest-900">{t('features.title')}</h2>
        <p className="mt-3 text-forest-700/80">{t('features.subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="h-full hover:shadow-soft transition-shadow">
              <CardContent className="pt-5">
                <div className="h-11 w-11 rounded-xl bg-sage flex items-center justify-center">
                  <Icon className="h-5 w-5 text-forest-700" />
                </div>
                <h3 className="mt-4 font-semibold text-forest-900">{t(`features.items.${key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-forest-700/75">{t(`features.items.${key}.desc`)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    { key: 'one', icon: Tractor },
    { key: 'two', icon: Users },
    { key: 'three', icon: Package },
  ]

  return (
    <Section id="how" className="bg-sage/50 rounded-[2rem] my-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-forest-900">{t('how.title')}</h2>
        <p className="mt-3 text-forest-700/80">{t('how.subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="rounded-2xl bg-white p-6 shadow-card border border-forest-50 h-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-forest text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <Icon className="h-5 w-5 text-fresh" />
              </div>
              <h3 className="mt-4 font-semibold text-forest-900">{t(`how.steps.${key}.title`)}</h3>
              <p className="mt-1.5 text-sm text-forest-700/75">{t(`how.steps.${key}.desc`)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
    </>
  )
}