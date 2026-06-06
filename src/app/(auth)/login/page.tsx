import { LoginForm } from '@/features/auth/login'
import Link from 'next/link'
import { Card } from '@/shared/ui/Card'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Вхід в акаунт</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ще немає акаунту?{' '}
            <Link href="/register" className="text-orange-500 hover:underline">
              Зареєструватись
            </Link>
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
}
