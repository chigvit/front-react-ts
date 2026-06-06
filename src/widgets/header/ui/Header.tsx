'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'

export const Header = () => {
  const { isAuthenticated, user, _hasHydrated, logout, refreshToken } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
          <Link href="/categories" className="text-sm text-gray-600 hover:text-orange-500">
            Категорії
          </Link>
          <Link href="/masters" className="text-sm text-gray-600 hover:text-orange-500">
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
  <div className="flex h-8 w-8 overflow-hidden rounded-full border border-gray-200">
  {user?.avatarUrl ? (
    <img src={`http://localhost:8080${user.avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-orange-100 text-sm font-bold text-orange-500">
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  )}
</div>
                <span>{user?.firstName} {user?.lastName}</span>
                <span className="text-gray-400">▾</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
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
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      📋 Мої замовлення
                    </Link>

                    {isMaster && (
                      <Link
                        href="/orders/incoming"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      >
                        📥 Вхідні замовлення
                      </Link>
                    )}

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
