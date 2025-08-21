'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'

function AuthCodeErrorContent() {
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    setError(errorParam)
  }, [searchParams])

  // If user is actually logged in, redirect them home after a short delay
  useEffect(() => {
    if (!loading && user) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            window.location.href = '/'
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-green-800">Authentication Successful!</h1>
          <p className="text-gray-600 mb-6">
            You&apos;re now signed in as {user.email}. Redirecting you to Firefly in {countdown} seconds...
          </p>
          <a 
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Continue to Firefly
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was an error signing you in. Please try again.
          {error && (
            <span className="block text-sm text-red-600 mt-2">
              Error: {error}
            </span>
          )}
        </p>
        <div className="space-y-3">
          <a 
            href="/"
            className="block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Return Home
          </a>
          {error === 'no-code' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="text-blue-800 font-medium mb-2">Common causes:</p>
              <ul className="text-blue-700 space-y-1 text-left">
                <li>• Browser blocked the authentication popup</li>
                <li>• You may have closed the auth window too quickly</li>
                <li>• Network connectivity issues during sign-in</li>
              </ul>
              <p className="text-blue-600 mt-3">
                Try signing in again from the home page.
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Note: Your authentication might have worked despite this error. 
            Check if you&apos;re signed in on the home page.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCodeErrorContent />
    </Suspense>
  )
}