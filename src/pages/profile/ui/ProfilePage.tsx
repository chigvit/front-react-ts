'use client'

import { useState } from 'react'
import { useAuthStore } from '@/entities/user/model/userStore'
import { useRouter } from 'next/navigation'
import { GeneralTab } from './tabs/GeneralTab'
import { WorkTypesTab } from './tabs/WorkTypesTab'
import { PricesTab } from './tabs/PricesTab'
import { ChangePasswordTab } from './tabs/ChangePasswordTab'
import { LogoutButton } from '@/features/auth/logout'

type Tab = 'general' | 'work-types' | 'prices' | 'password'

export const ProfilePage = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('general')

  if (!isAuthenticated()) {
    router.push('/login')
    return null
  }

  const isMaster = user?.role === 'USER_TYPE_MASTER'

  const tabs = [
    { id: 'general' as Tab, label: 'Загальна інформація' },
    ...(isMaster ? [
      { id: 'work-types' as Tab, label: 'Типи робіт' },
      { id: 'prices' as Tab, label: 'Вартість робіт' },
    ] : []),
    { id: 'password' as Tab, label: 'Зміна паролю' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header профілю */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-orange-500">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400">
            {isMaster ? '🔧 Майстер' : '👤 Замовник'}
          </p>
        </div>
      </div>

      {/* Вкладки */}
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

      {/* Контент вкладки */}
      <div>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'work-types' && isMaster && <WorkTypesTab />}
        {activeTab === 'prices' && isMaster && <PricesTab />}
        {activeTab === 'password' && <ChangePasswordTab />}
      </div>

      {/* Вийти */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <LogoutButton />
      </div>
    </div>
  )
}
