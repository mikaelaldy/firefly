'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'

interface UserSettingsProps {
  loading?: boolean
}

export function UserSettings({ loading = false }: UserSettingsProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/user/delete-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete user data')
      }

      // Sign out after successful deletion
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error deleting user data:', error)
      alert('Failed to delete user data. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Account Settings
        </h3>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Account Information</h4>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Account ID:</strong> {user?.id}
            </p>
          </div>

          {/* Data Management */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Data Management</h4>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
              >
                Delete All My Data
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-red-800">
                    ⚠️ Confirm Data Deletion
                  </h5>
                  <p className="text-sm text-red-700">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside ml-2">
                    <li>All your focus sessions and timer history</li>
                    <li>All tasks and AI suggestions</li>
                    <li>Your profile and preferences</li>
                    <li>All analytics and personal records</li>
                  </ul>
                  <p className="text-sm text-red-700 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-red-800 mb-1">
                      Type &quot;DELETE&quot; to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="DELETE"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAllData}
                      disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete All Data'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
