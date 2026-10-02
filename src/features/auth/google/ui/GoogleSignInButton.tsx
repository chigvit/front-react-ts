'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userApi } from '@/entities/user/api/userApi'
import { useAuthStore } from '@/entities/user/model/userStore'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

interface GoogleSignInButtonProps {
  redirectTo?: string
}

export const GoogleSignInButton = ({ redirectTo = '/' }: GoogleSignInButtonProps) => {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!scriptLoaded || !GOOGLE_CLIENT_ID || !buttonRef.current) return
    const google = (window as any).google
    if (!google) return

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError(null)
        try {
          const authData = await userApi.oauthLoginGoogle(response.credential)
          localStorage.setItem('access_token', authData.accessToken)
          localStorage.setItem('refresh_token', authData.refreshToken)
          const profile = await userApi.getProfile(authData.accessToken)
          setAuth(profile, authData.accessToken, authData.refreshToken)
          router.push(redirectTo)
        } catch {
          setError('Google sign-in failed. Please try again.')
        }
      },
    })
    google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: buttonRef.current.offsetWidth || 320,
      text: 'continue_with',
    })
  }, [scriptLoaded])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonRef} className="flex w-full justify-center" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
