'use client'

import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/lib/auth/context'

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {/* Auth button in top right */}
        <div className="flex justify-end mb-8">
          <AuthButton />
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            Firefly
          </h1>
          <p className="text-lg mb-6">
            ADHD Focus App - Coming Soon
          </p>
          
          {!loading && (
            <div className="text-sm text-gray-600">
              {user ? (
                <p>✅ Signed in - Your data will be saved across sessions</p>
              ) : (
                <p>⚡ App works without signing in - Timer and local state available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}