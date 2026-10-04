'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Home Master': 'Plumbers, electricians, handymen and locksmiths for everyday fixes.',
  'Appliance Repair': 'Fast, reliable repair for large and small home appliances.',
  'Finishing Works': 'Renovation, tiling, plastering and painting done right.',
  'Construction Works': 'General labor, welding and metalwork for any build.',
  'Furniture Works': 'Custom furniture making, repair and assembly.',
  'Cleaning Services': 'Professional cleaning for apartments, offices and any space.',
  'Energy Saving': 'Energy audits and efficient device installation.',
  'Transport & Storage': 'Freight transport and help moving or loading anything.',
  'Household Services': 'Garden, yard and babysitting help around the house.',
  'Auto Repair': 'Trusted mechanics for repairs and maintenance.',
  'Courier Services': 'Fast local delivery of documents and parcels.',
  'Digital Marketing': 'SEO, ads and social media growth for your business.',
  'Design': 'Graphic, UI and brand design from skilled creatives.',
  'Tutoring': 'Online courses and tutoring for kids and adults.',
  'Web & App Dev': 'Custom websites and mobile apps built to spec.',
  'Online Work': 'Remote freelance help for any digital task.',
  'Photo & Video': 'Professional photography and videography services.',
  'Business Services': 'Accounting, legal and consulting support.',
  'Pet Services': 'Walking, grooming and care for your pets.',
  'Beauty & Health': 'Beauty treatments and wellness professionals.',
  'Event Planning': 'Full-service planning for any occasion.',
  'Translation': 'Accurate translation and interpreting services.',
  'Coaching': 'Personal and professional coaching to help you grow.',
  'AI Services': 'AI consulting and custom automation solutions.',
  'Volunteering': 'Connect with volunteer opportunities near you.',
}

const CATEGORY_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-slate-100', text: 'text-slate-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-lime-100', text: 'text-lime-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-sky-100', text: 'text-sky-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
]

export const HomePage = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories-with-work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/categories')
      const categories = res.data.categories ?? []
      const withWorkTypes = await Promise.all(
        categories.map(async (cat: any) => {
          const wtRes = await apiClient.get(`/api/v1/categories/${cat.id}/work-types`)
          return { ...cat, workTypes: wtRes.data.work_types ?? [] }
        })
      )
      return withWorkTypes
    },
  })

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/categories?search=${encodeURIComponent(search)}`)
    }
  }

  const filtered = categoriesData?.filter((cat: any) =>
    !search ||
    cat.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    cat.name?.toLowerCase().includes(search.toLowerCase()) ||
    cat.workTypes.some((wt: any) => wt.name.toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden bg-blue-50/60 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Every service you need<br />— in one place
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-500">
              Home repair &bull; Cleaning &bull; Design &bull; Tutoring &bull; Moving
              and 20+ more categories for your home, business and everyday life.
            </p>

            <div className="mt-8 flex max-w-xl gap-2">
              <input
                type="text"
                placeholder="What do you need done?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Button size="lg" onClick={handleSearch}>
                🔍 Search
              </Button>
            </div>

            <div className="mt-4">
              <Link href="/orders/create">
                <Button size="lg" variant="outline">
                  Create Order →
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative illustration */}
          <div className="relative hidden h-72 lg:block">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-orange-100 via-blue-100 to-purple-100" />
            <span className="absolute left-6 top-6 text-6xl drop-shadow-sm">🔧</span>
            <span className="absolute right-10 top-10 text-7xl drop-shadow-sm">🚚</span>
            <span className="absolute bottom-10 left-16 text-7xl drop-shadow-sm">🧹</span>
            <span className="absolute bottom-6 right-6 text-6xl drop-shadow-sm">🎨</span>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl drop-shadow-sm">📚</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-orange-500">
            Services
          </p>
          <h2 className="mt-1 text-center text-3xl font-bold text-gray-900">
            Choose the service you need
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((category: any, index: number) => {
                const name = category.name_en || category.name
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                const description = CATEGORY_DESCRIPTIONS[name]
                  ?? `${category.workTypes.length} service types available.`

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="rounded-2xl border border-gray-100 p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color.bg} text-2xl`}>
                      <span className={color.text}>{category.icon ?? '🔨'}</span>
                    </div>
                    <h3 className="mt-4 font-bold text-gray-900">{name}</h3>
                    <p className="mt-1.5 text-sm text-gray-500">{description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-500">
                      Learn more →
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: '📝', title: 'Create an order', desc: 'Describe what needs to be done and set your budget' },
              { icon: '👷', title: 'Get responses', desc: 'Masters will respond and offer their price' },
              { icon: '✅', title: 'Choose a master', desc: 'Select the best one and get the result' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mb-4 text-5xl">{step.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/orders/create">
              <Button size="lg">Create Order</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
