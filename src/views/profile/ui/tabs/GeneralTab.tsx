'use client'

//import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { AvatarUpload } from './AvatarUpload'
import { useState, useEffect } from 'react'

const LANGUAGES = [
  'English',
  'Welsh / Cymraeg',
  'Scottish Gaelic / Gàidhlig',
  'Irish / Gaeilge',
  'Українська / Ukrainian',
  'Polski / Polish',
  'Română / Romanian',
  'Magyar / Hungarian',
  'Български / Bulgarian',
  'Qırımtatar / Crimean Tatar',
  'Deutsch / German',
  'Français / French',
  'Español / Spanish',
  'Italiano / Italian',
  'Português / Portuguese',
  'العربية / Arabic',
  '中文 / Chinese',
  '日本語 / Japanese',
  '한국어 / Korean',
  'Türkçe / Turkish',
  'हिन्दी / Hindi',
  'فارسی / Persian',
  'Русский / Russian',
]

const RADIUS_OPTIONS = [5, 10, 20, 50, 100]

const schema = z.object({
  firstName: z.string().min(2, 'Minimum 2 characters'),
  lastName: z.string().min(2, 'Minimum 2 characters'),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().optional(),
  radiusMiles: z.number().optional(),
  languages: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

export const GeneralTab = () => {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])




  const isMaster = user?.role === 'USER_TYPE_MASTER'

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile(),
  })

  useEffect(() => {
  if (profile?.languages && profile.languages.length > 0) {
    setSelectedLanguages(profile.languages)
  } else {
    setSelectedLanguages(['English'])
  }
}, [profile])

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: FormData) => userApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      phone: profile?.phone ?? '',
      postcode: profile?.postcode ?? '',
      bio: profile?.masterProfile?.bio ?? '',
      experienceYears: profile?.masterProfile?.experienceYears ?? 0,
      radiusMiles: 10,
      languages: selectedLanguages,
    },
  })
  

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((data) => updateProfile({ ...data, languages: selectedLanguages }))} className="flex flex-col gap-6">

      {/* Avatar */}
<div className="rounded-xl border border-gray-200 bg-white p-6">
  <h2 className="mb-4 font-semibold text-gray-800">Profile Photo</h2>
  <AvatarUpload />
</div>

{/* Contact details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-800">Contact Details</h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              value={profile?.email ?? ''}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          <Input
            label="Phone"
            placeholder="+447911123456"
            {...register('phone')}
          />
        </div>
      </div>

      {/* Languages */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-800">Languages Spoken</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedLanguages.includes(lang)
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-300 text-gray-600 hover:border-orange-300'
              }`}
            >
              {selectedLanguages.includes(lang) && '✓ '}{lang}
            </button>
          ))}
        </div>
      </div>

      {/* Address & Location */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-800">Address & Location</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Postcode / City"
            placeholder="SW1A 1AA or London"
            {...register('postcode')}
          />

          {isMaster && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Work Radius (miles)
              </label>
              <div className="flex gap-2">
                {RADIUS_OPTIONS.map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setValue('radiusMiles', radius)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      watch('radiusMiles') === radius
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-300 text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {radius} miles
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About (master) */}
      {isMaster && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-800">About</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Service Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                rows={4}
                placeholder="Tell us about your experience and services..."
                {...register('bio')}
              />
            </div>

            <Input
              label="Years of Experience"
              type="number"
              {...register('experienceYears', { valueAsNumber: true })}
            />

            {profile?.masterProfile && profile.masterProfile.reviewsCount > 0 && (
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="text-sm text-orange-800">
                  ⭐ Rating: <strong>{profile.masterProfile.rating}</strong> ({profile.masterProfile.reviewsCount} reviews)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-800">Notification Settings</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Email notifications about order status changes' },
            { label: 'New order notifications' },
            { label: 'SMS notifications about important events' },
          ].map((item, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {saved && (
        <p className="text-sm text-green-600">✅ Profile saved!</p>
      )}

      <Button type="submit" loading={isPending} className="w-full md:w-auto">
        Save Changes
      </Button>
    </form>
  )
}
