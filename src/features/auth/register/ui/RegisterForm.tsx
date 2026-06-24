'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useRegister } from '../model/useRegister'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email обов\'язковий')
    .email('Невірний формат email')
    .refine((v) => v.includes('.'), 'Невірний формат email'),
  password: z
    .string()
    .min(8, 'Мінімум 8 символів')
    .regex(/[A-Z]/, 'Має містити хоча б одну велику літеру')
    .regex(/[0-9]/, 'Має містити хоча б одну цифру'),
  firstName: z.string().min(2, 'Мінімум 2 символи'),
  lastName: z.string().min(2, 'Мінімум 2 символи'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?[0-9]\d{6,14}$/.test(v), 'Невірний формат телефону'),
  userRole: z.enum(['USER_TYPE_CUSTOMER', 'USER_TYPE_MASTER']),
})

type FormData = z.infer<typeof schema>

export const RegisterForm = () => {
  const { mutate: register, isPending, error } = useRegister()

  const { register: formRegister, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { userRole: 'USER_TYPE_CUSTOMER' },
  })

  const onSubmit = (data: FormData) => register(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ім'я"
          autoComplete="given-name"
          placeholder="Іван"
          error={errors.firstName?.message}
          {...formRegister('firstName')}
        />
        <Input
          label="Прізвище"
          autoComplete="family-name"
          placeholder="Іванченко"
          error={errors.lastName?.message}
          {...formRegister('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...formRegister('email')}
      />

      <Input
        label="Телефон"
        type="tel"
        autoComplete="tel"
        placeholder="+380671234567"
        error={errors.phone?.message}
        {...formRegister('phone')}
      />

      <Input
        label="Пароль"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...formRegister('password')}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Я реєструюсь як</label>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors ${watch('userRole') === 'USER_TYPE_CUSTOMER' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-700'}`}>
            <input type="radio" value="USER_TYPE_CUSTOMER" className="hidden" {...formRegister('userRole')} />
            👤 Замовник
          </label>
          <label className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors ${watch('userRole') === 'USER_TYPE_MASTER' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-700'}`}>
            <input type="radio" value="USER_TYPE_MASTER" className="hidden" {...formRegister('userRole')} />
            🔧 Майстер
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.error || 'Помилка реєстрації. Спробуйте ще раз.'}
          </p>
        </div>
      )}

      <Button type="submit" loading={isPending} className="w-full">
        Зареєструватись
      </Button>
    </form>
  )
}