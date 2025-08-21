'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function CallbackClientContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('Completing sign-in...')

  useEffect(() => {
    const run = async () => {
      try {
        const next = searchParams.get('next') ?? '/'

        console.log('Callback client - Current URL:', window.location.href)
        console.log('Callback client - Hash:', window.location.hash)
        console.log('Callback client - Search params:', window.location.search)

        // Wait a moment for the hash to be properly set
        await new Promise(resolve => setTimeout(resolve, 200))

        // Prefer PKCE flow if a `code` param exists
        const code = searchParams.get('code')
        if (code) {
          console.log('Callback client - Found code, exchanging for session...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Callback client - Code exchange error:', error)
            throw error
          }
          if (data.session) {
            console.log('Callback client - Session established, redirecting to:', next)
            router.replace(next)
            return
          }
        }

        // Handle implicit flow tokens present in the URL hash
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
        console.log('Callback client - Processing hash:', hash)

        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        const expires_at = params.get('expires_at')

        console.log('Callback client - Extracted tokens:', {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          expires_at
        })

        if (access_token && refresh_token) {
          console.log('Callback client - Setting session with tokens...')
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('Callback client - Set session error:', error)
            throw error
          }
          console.log('Callback client - Session set successfully, redirecting to:', next)
          router.replace(next)
          return
        }

        // If we get here, no tokens/codes were present
        console.error('Callback client - No tokens or codes found')
        router.replace(`/auth/auth-code-error?error=no-tokens-found&hash=${encodeURIComponent(hash)}`)
      } catch (err) {
        console.error('Callback client - Exception:', err)
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

export default function CallbackClientPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackClientContent />
    </Suspense>
  )
}


