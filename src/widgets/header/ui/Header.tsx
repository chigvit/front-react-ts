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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const Header = () => {
  const { isAuthenticated, user, _hasHydrated, logout, refreshToken } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<'create' | 'search' | null>(null)

  // The page matching the current route — used to highlight the nav item
  // when no dropdown menu is currently open.
  const activePage: 'create' | 'search' | 'categories' | 'masters' | null =
    pathname?.startsWith('/orders/create') ? 'create'
    : pathname?.startsWith('/orders/search') ? 'search'
    : pathname?.startsWith('/categories') ? 'categories'
    : pathname?.startsWith('/masters') ? 'masters'
    : null

  // Single source of truth for highlighting — an open menu takes priority
  // over the route, and only one item is ever highlighted at a time.
  const activeNav = openDropdown ?? activePage

  // Close the open menu when navigating to another page
  useEffect(() => {
    setOpenDropdown(null)
    setMobileMenuOpen(false)
  }, [pathname])

  // Stable callback references — so child dropdowns don't re-subscribe
  // their "click outside" listener on every Header re-render.
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

  // We compute the unread count here (not just on the "My Orders"/"Incoming
  // Orders" pages) so the badge in the header works on any page, instead of
  // disappearing as soon as you navigate elsewhere or reload.
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
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xl font-bold text-orange-500 sm:text-2xl">Master</span>
          <span className="text-xl font-bold text-gray-800 sm:text-2xl">Online</span>
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
            Categories
          </Link>
          <Link href="/masters" className={navLinkClass(activeNav === 'masters')}>
            Masters
          </Link>
        </nav>

        {/* Auth — desktop only, mobile has its own compact block below */}
        <div className="hidden md:flex items-center gap-3 min-w-[160px] justify-end">
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
        <img src={`${API_URL}${user.avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
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
                      👤 My Profile
                    </Link>

                    <Link
                      href="/orders/my"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      <span>📋 My Orders</span>
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
                        <span>📥 Incoming Orders</span>
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
                      🔍 Search Orders
                    </Link>

                    <Link
                      href="/notifications"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      🔔 Notifications
                    </Link>

                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      💬 Messages
                    </Link>

                    <Link
                      href="/balance"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      💰 Balance
                    </Link>

                    <Link
                      href="/support"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      🆘 Contact Support
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      🚪 Log out
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
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: compact avatar + hamburger instead of the full menu */}
        <div className="flex items-center gap-1 md:hidden">
          {_hasHydrated && isAuthenticated() && (
            <Link href="/profile" className="relative shrink-0" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex h-8 w-8 overflow-hidden rounded-full border border-gray-200">
                {user?.avatarUrl ? (
                  <img src={`${API_URL}${user.avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
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
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span className="text-xl leading-none">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu — all nav items in one list, without flyouts */}
      {mobileMenuOpen && (
        <nav className="border-t border-gray-200 bg-white md:hidden">
          <div className="flex flex-col divide-y divide-gray-100">
            <Link href="/orders/create" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50">
              🛠️ Create Order
            </Link>
            <Link href="/orders/search" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50">
              🔍 Search Orders
            </Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50">
              📂 Categories
            </Link>
            <Link href="/masters" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50">
              👷 Masters
            </Link>
            <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50">
              🆘 Contact Support
            </Link>

            {!_hasHydrated ? null : isAuthenticated() ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">
                  👤 My Profile
                </Link>
                <Link href="/orders/my" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">
                  <span>📋 My Orders</span>
                  {!isMaster && unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {isMaster && (
                  <Link href="/orders/incoming" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">
                    <span>📥 Incoming Orders</span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">
                  🔔 Notifications
                </Link>
                <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">
                  💬 Messages
                </Link>
                <Link href="/balance" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">
                  💰 Balance
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                  className="px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  🚪 Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 py-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-orange-600"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
