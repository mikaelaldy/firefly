'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function CallbackClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('Completing sign-in...')

  useEffect(() => {
    const run = async () => {
      try {
        const next = searchParams.get('next') ?? '/'

        // Prefer PKCE flow if a `code` param exists
        const code = searchParams.get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (data.session) {
            router.replace(next)
            return
          }
        }

        // Handle implicit flow tokens present in the URL hash
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token') ?? undefined
        const refresh_token = params.get('refresh_token') ?? undefined

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          router.replace(next)
          return
        }

        // If we get here, no tokens/codes were present
        router.replace(`/auth/auth-code-error?error=no-code`)
      } catch (err) {
        setMessage('Authentication failed. Redirecting...')
        router.replace(`/auth/auth-code-error?error=callback-client&description=${encodeURIComponent(String(err))}`)
      }
    }

    run()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}


