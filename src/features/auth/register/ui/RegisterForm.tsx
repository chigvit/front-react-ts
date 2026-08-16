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
    .min(1, 'Email is required')
    .email('Invalid email format')
    .refine((v) => v.includes('.'), 'Invalid email format'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
  firstName: z.string().min(2, 'Minimum 2 characters'),
  lastName: z.string().min(2, 'Minimum 2 characters'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?[0-9]\d{6,14}$/.test(v), 'Invalid phone number format'),
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
          label="First name"
          autoComplete="given-name"
          placeholder="John"
          error={errors.firstName?.message}
          {...formRegister('firstName')}
        />
        <Input
          label="Last name"
          autoComplete="family-name"
          placeholder="Smith"
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
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="+447911123456"
        error={errors.phone?.message}
        {...formRegister('phone')}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...formRegister('password')}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">I&apos;m signing up as</label>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors ${watch('userRole') === 'USER_TYPE_CUSTOMER' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-700'}`}>
            <input type="radio" value="USER_TYPE_CUSTOMER" className="hidden" {...formRegister('userRole')} />
            👤 Customer
          </label>
          <label className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors ${watch('userRole') === 'USER_TYPE_MASTER' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-700'}`}>
            <input type="radio" value="USER_TYPE_MASTER" className="hidden" {...formRegister('userRole')} />
            🔧 Master
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.error || 'Registration failed. Please try again.'}
          </p>
        </div>
      )}

      <Button type="submit" loading={isPending} className="w-full">
        Sign up
      </Button>
    </form>
  )
}