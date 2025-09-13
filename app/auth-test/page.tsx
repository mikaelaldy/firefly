'use client'

import { useAuth } from '@/lib/auth/context'
import { AuthStatus } from '@/components/AuthStatus'

export default function AuthTestPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
        
        <AuthStatus />
        
        <div className="mt-6 space-y-4">
          {!user ? (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-medium"
            >
              {loading ? 'Loading...' : 'Sign In with Google'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-semibold text-green-800">Signed In Successfully!</h3>
                <p className="text-green-700">Email: {user.email}</p>
                <p className="text-green-700">ID: {user.id}</p>
              </div>
              
              <div className="space-x-4">
                <a 
                  href="/dashboard"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium inline-block"
                >
                  Go to Dashboard
                </a>
                
                <button
                  onClick={signOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}