'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useRegister } from '../model/useRegister'

const schema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Мінімум 8 символів'),
  firstName: z.string().min(2, 'Мінімум 2 символи'),
  lastName: z.string().min(2, 'Мінімум 2 символи'),
  phone: z.string().optional(),
  userRole: z.enum(['USER_TYPE_CUSTOMER', 'USER_TYPE_MASTER']),
})

type FormData = z.infer<typeof schema>

export const RegisterForm = () => {
  const { mutate: register, isPending, error } = useRegister()

  const { register: formRegister, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userRole: 'USER_TYPE_CUSTOMER' },
  })

  const onSubmit = (data: FormData) => register(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ім'я"
          placeholder="Іван"
          error={errors.firstName?.message}
          {...formRegister('firstName')}
        />
        <Input
          label="Прізвище"
          placeholder="Іванченко"
          error={errors.lastName?.message}
          {...formRegister('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...formRegister('email')}
      />

      <Input
        label="Телефон"
        type="tel"
        placeholder="+380671234567"
        {...formRegister('phone')}
      />

      <Input
        label="Пароль"
        type="password"
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
        <p className="text-sm text-red-500">Помилка реєстрації. Спробуйте ще раз.</p>
      )}

      <Button type="submit" loading={isPending} className="w-full">
        Зареєструватись
      </Button>
    </form>
  )
}