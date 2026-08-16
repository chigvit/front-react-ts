'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'
import { CreateOrderDropdown } from './CreateOrderDropdown'
import { SearchOrdersDropdown } from './SearchOrdersDropdown'
import { useUnreadStore } from '@/shared/model/unreadStore'
import { useUnreadMessages } from '@/shared/hooks/useUnreadMessages'

export const Header = () => {
  const { isAuthenticated, user, _hasHydrated, logout, refreshToken } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<'create' | 'search' | null>(null)

  // Сторінка, що відповідає поточному маршруту — використовується для
  // підсвітки пункту меню, коли жодне випадне меню не відкрите.
  const activePage: 'create' | 'search' | 'categories' | 'masters' | null =
    pathname?.startsWith('/orders/create') ? 'create'
    : pathname?.startsWith('/orders/search') ? 'search'
    : pathname?.startsWith('/categories') ? 'categories'
    : pathname?.startsWith('/masters') ? 'masters'
    : null

  // Єдине джерело правди для підсвітки — відкрите меню має пріоритет над
  // маршрутом, і завжди підсвічений лише один пункт одночасно.
  const activeNav = openDropdown ?? activePage

  // Закриваємо відкрите меню при переході на іншу сторінку
  useEffect(() => {
    setOpenDropdown(null)
  }, [pathname])

  // Стабільні посилання на колбеки — щоб дочірні дропдауни не перепідписували
  // свій "клік поза межами" листенер на кожен ре-рендер Header.
  const handleCreateOpenChange = useCallback((open: boolean) => setOpenDropdown(open ? 'create' : null), [])
  const handleSearchOpenChange = useCallback((open: boolean) => setOpenDropdown(open ? 'search' : null), [])

  const navLinkClass = (active: boolean) =>
    `rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'border-orange-500 bg-orange-50 text-orange-600'
        : 'border-transparent text-gray-600 hover:text-orange-500'
    }`

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await userApi.logout(refreshToken)
      }
    } finally {
      logout()
      router.push('/login')
    }
  }

  const isMaster = user?.role === 'USER_TYPE_MASTER'
  const unreadCount = useUnreadStore((s) => s.unreadOrderIds.size)

  // Лічильник непрочитаних рахуємо тут (а не лише на сторінках "Мої
  // замовлення"/"Вхідні замовлення"), щоб бейдж у шапці працював на будь-якій
  // сторінці, а не зникав одразу після заходу деінде чи перезавантаження.
  const { data: myOrdersForUnread } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders/my')
      return res.data.orders ?? []
    },
    enabled: _hasHydrated && isAuthenticated(),
    staleTime: 15_000,
  })
  useUnreadMessages(myOrdersForUnread ?? [], 'customer')

  const { data: incomingOrdersForUnread } = useQuery({
    queryKey: ['incoming-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders/incoming')
      return res.data.orders ?? []
    },
    enabled: _hasHydrated && isAuthenticated(),
    staleTime: 15_000,
  })
  useUnreadMessages(incomingOrdersForUnread ?? [], 'master')

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-orange-500">Майстер</span>
          <span className="text-2xl font-bold text-gray-800">Онлайн</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <CreateOrderDropdown
            isOpen={openDropdown === 'create'}
            onOpenChange={handleCreateOpenChange}
            isActive={activeNav === 'create'}
          />
          <SearchOrdersDropdown
            isOpen={openDropdown === 'search'}
            onOpenChange={handleSearchOpenChange}
            isActive={activeNav === 'search'}
          />
          <Link href="/categories" className={navLinkClass(activeNav === 'categories')}>
            Категорії
          </Link>
          <Link href="/masters" className={navLinkClass(activeNav === 'masters')}>
            Майстри
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3 min-w-[160px] justify-end">
          {!_hasHydrated ? (
            <div className="h-8 w-32 rounded-lg bg-gray-100" />
          ) : isAuthenticated() ? (
            <div className="relative" ref={menuRef}>
              <button
                onMouseEnter={() => setMenuOpen(true)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-500"
              >
  <div className="relative">
    <div className="flex h-8 w-8 overflow-hidden rounded-full border border-gray-200">
      {user?.avatarUrl ? (
        <img src={`http://localhost:8080${user.avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-orange-100 text-sm font-bold text-orange-500">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      )}
    </div>
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </div>
                <span>{user?.firstName} {user?.lastName?.[0]}.</span>
                <span className="text-gray-400">▾</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName?.[0]}.</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      👤 Мій профіль
                    </Link>

                    <Link
                      href="/orders/my"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      <span>📋 Мої замовлення</span>
                      {!isMaster && unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>

                    {isMaster && (
                      <Link
                        href="/orders/incoming"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      >
                        <span>📥 Вхідні замовлення</span>
                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    )}

                    <Link
                      href="/orders/search"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      🔍 Пошук замовлень
                    </Link>

                    <Link
                      href="/notifications"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      🔔 Сповіщення
                    </Link>

                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      💬 Особисті повідомлення
                    </Link>

                    <Link
                      href="/balance"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      💰 Баланс
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      🚪 Вихід
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Увійти
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
