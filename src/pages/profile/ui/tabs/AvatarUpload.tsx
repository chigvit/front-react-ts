'use client'

import { useState, useRef } from 'react'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'

export const AvatarUpload = () => {
  const { user, setUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    // Показуємо preview одразу
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      await apiClient.post('/api/v1/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Оновлюємо профіль
      const profile = await userApi.getProfile()
      setUser(profile)

    } catch (err: any) {
      setPreviewUrl(null)
      setError(err.response?.data?.error ?? 'Помилка завантаження')
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = previewUrl
    ?? (user?.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : null)

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-2 border-gray-200 hover:border-orange-400"
        onClick={() => fileInputRef.current?.click()}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-orange-100 text-2xl font-bold text-orange-500">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-medium text-orange-500 hover:underline"
        >
          {uploading ? 'Завантаження...' : 'Змінити фото'}
        </button>
        <p className="text-xs text-gray-400">JPEG, PNG, WebP до 5MB</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
