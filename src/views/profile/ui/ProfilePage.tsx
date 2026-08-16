'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'
import { useRouter, useSearchParams } from 'next/navigation'
import { GeneralTab } from './tabs/GeneralTab'
import { WorkTypesTab } from './tabs/WorkTypesTab'
import { PricesTab } from './tabs/PricesTab'
import { ChangePasswordTab } from './tabs/ChangePasswordTab'
import { LogoutButton } from '@/features/auth/logout'

type Tab = 'general' | 'work-types' | 'prices' | 'password'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const ProfilePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, setUser } = useAuthStore()

  const isMaster = user?.role === 'USER_TYPE_MASTER'
  const [activeTab, setActiveTabState] = useState<Tab>(
    (searchParams.get('tab') as Tab) ?? 'general'
  )

  // If email is not yet verified in the store — silently check the fresh state from the API
  useEffect(() => {
    if (!user?.isEmailVerified) {
      userApi.getProfile().then(setUser).catch(() => {})
    }
  }, [])

  if (!isAuthenticated()) {
    router.push('/login')
    return null
  }

  const tabs = [
    { id: 'general' as Tab, label: 'General Information' },
    ...(isMaster ? [
      { id: 'work-types' as Tab, label: 'Work Types' },
      { id: 'prices' as Tab, label: 'Work Prices' },
    ] : []),
    { id: 'password' as Tab, label: 'Change Password' },
  ]

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab)
    window.history.replaceState(null, '', `/profile?tab=${tab}`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Unverified email banner */}
      {user && !user.isEmailVerified && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Your email is not verified. Check your inbox and follow the link in the email to activate your account.
          </p>
        </div>
      )}

      {/* Profile header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 overflow-hidden rounded-full border border-gray-200">
          {user?.avatarUrl ? (
            <img
              src={`${API_URL}${user.avatarUrl}`}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange-100 text-3xl font-bold text-orange-500">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {user?.firstName} {user?.lastName?.[0]}.
          </h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400">
            {isMaster ? '🔧 Master' : '👤 Customer'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        <div className={activeTab !== 'general' ? 'hidden' : ''}><GeneralTab /></div>
        {isMaster && (
          <>
            <div className={activeTab !== 'work-types' ? 'hidden' : ''}><WorkTypesTab /></div>
            <div className={activeTab !== 'prices' ? 'hidden' : ''}><PricesTab /></div>
          </>
        )}
        <div className={activeTab !== 'password' ? 'hidden' : ''}><ChangePasswordTab /></div>
      </div>

      {/* Logout */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <LogoutButton />
      </div>
    </div>
  )
}
