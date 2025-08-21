'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthDebugPage() {
  const [urlInfo, setUrlInfo] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Capture URL info immediately
    setUrlInfo({
      fullUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      searchParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      hashParams: window.location.hash.startsWith('#')
        ? Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)))
        : {}
    })
  }, [])

  const handleProcessAuth = async () => {
    setProcessing(true)
    try {
      const next = urlInfo?.searchParams?.next ?? '/'

      // Prefer PKCE flow if a `code` param exists
      const code = urlInfo?.searchParams?.code
      if (code) {
        console.log('Debug - Found code, exchanging for session...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        if (data.session) {
          console.log('Debug - Session established, redirecting to:', next)
          router.replace(next)
          return
        }
      }

      // Handle implicit flow tokens present in the URL hash
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        console.log('Debug - Setting session with tokens...')
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) throw error
        console.log('Debug - Session set successfully, redirecting to:', next)
        router.replace(next)
        return
      }

      alert('No tokens or codes found to process!')
    } catch (error) {
      console.error('Debug - Auth processing error:', error)
      alert(`Auth processing failed: ${error}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Auth Debug Information</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Full URL</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {urlInfo?.fullUrl || 'Loading...'}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Search Parameters</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(urlInfo?.searchParams, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Hash Parameters</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(urlInfo?.hashParams, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Raw Hash</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto break-all">
              {urlInfo?.hash || 'No hash'}
            </pre>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Copy this information and share it to help debug the OAuth flow issue.
            </p>
            <button
              onClick={handleProcessAuth}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-medium"
            >
              {processing ? 'Processing...' : 'Process Auth Tokens'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
