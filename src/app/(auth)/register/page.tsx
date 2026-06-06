import { RegisterForm } from '@/features/auth/register'
import Link from 'next/link'
import { Card } from '@/shared/ui/Card'

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Реєстрація</h1>
          <p className="mt-1 text-sm text-gray-600">
            Вже є акаунт?{' '}
            <Link href="/login" className="text-orange-500 hover:underline">
              Увійти
            </Link>
          </p>
        </div>
        <RegisterForm />
      </Card>
    </div>
  )
}
