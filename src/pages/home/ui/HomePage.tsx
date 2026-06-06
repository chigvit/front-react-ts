'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { categoryApi } from '@/entities/category/api/categoryApi'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

export const HomePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  return (
    <div>
      {/* Hero секція */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Знайдіть майстра для будь-якої роботи
          </h1>
          <p className="mb-8 text-lg text-orange-100">
            Тисячі перевірених фахівців готові вам допомогти
          </p>

          {/* Пошук */}
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              type="text"
              placeholder="Що потрібно зробити?"
              className="flex-1 rounded-lg px-4 py-3 text-gray-800 focus:outline-none"
            />
            <Button size="lg" variant="secondary">
              🔍 Знайти
            </Button>
          </div>
        </div>
      </section>

      {/* Категорії */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-2xl font-bold text-gray-800">
            Популярні категорії
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data?.categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="mb-2 text-3xl">🔧</span>
                  <span className="text-sm font-medium text-gray-800">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/categories">
              <Button variant="outline">Всі категорії</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Як це працює */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
            Як це працює
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: '📝', title: 'Створіть замовлення', desc: 'Опишіть що потрібно зробити і вкажіть бюджет' },
              { icon: '👷', title: 'Отримайте відгуки', desc: 'Майстри відгукнуться і запропонують свою ціну' },
              { icon: '✅', title: 'Виберіть майстра', desc: 'Оберіть найкращого і отримайте результат' },
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
              <Button size="lg">Створити замовлення</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
