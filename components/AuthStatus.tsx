'use client'

import { useAuth } from '@/lib/auth/context'

export function AuthStatus() {
  const { user, loading, session } = useAuth()

  if (loading) {
    return <div className="text-sm text-gray-500">Loading auth...</div>
  }

  return (
    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
      <div><strong>Auth Status:</strong></div>
      <div>User: {user ? user.email : 'Not logged in'}</div>
      <div>Session: {session ? 'Active' : 'None'}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
    </div>
  )
}