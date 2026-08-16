'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

const supportSchema = z.object({
  name: z.string().min(2, 'Minimum 2 characters'),
  email: z.string().email('Invalid email'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Minimum 10 characters'),
})

type SupportFormData = z.infer<typeof supportSchema>

export const SupportPage = () => {
  const { user } = useAuthStore()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<SupportFormData>({ resolver: zodResolver(supportSchema) })

  useEffect(() => {
    if (user) {
      form.setValue('name', `${user.firstName} ${user.lastName}`.trim())
      form.setValue('email', user.email)
    }
  }, [user])

  const { mutate: submitMessage, isPending, error } = useMutation({
    mutationFn: async (data: SupportFormData) => {
      await apiClient.post('/api/v1/support', {
        user_id: user?.id ?? '',
        name: data.name,
        email: data.email,
        subject: data.subject ?? '',
        message: data.message,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      form.reset()
    },
  })

  const handleSubmit = async () => {
    const valid = await form.trigger()
    if (!valid) return
    submitMessage(form.getValues())
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Contact Support</h1>
      <p className="mb-6 text-gray-500">
        Have a question or ran into a problem? Send us a message and we'll get back to you.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mb-3 text-5xl">✅</div>
            <h2 className="mb-1 text-lg font-semibold text-gray-800">Message sent</h2>
            <p className="mb-4 text-sm text-gray-500">
              Thanks for reaching out — we'll reply to your email as soon as we can.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              label="Your name"
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />
            <Input
              label="Subject — optional"
              placeholder="What's this about?"
              {...form.register('subject')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                rows={6}
                placeholder="Describe your question or issue..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                {...form.register('message')}
              />
              {form.formState.errors.message && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.message.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500">Failed to send your message. Please try again.</p>
            )}

            <Button onClick={handleSubmit} loading={isPending} className="w-full">
              Send Message
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
