'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { initializeOfflineSync, syncOfflineData, getPendingSyncCount } from '@/lib/supabase/action-sessions'

interface OfflineSyncContextType {
  isOnline: boolean
  pendingSyncCount: number
  syncInProgress: boolean
  lastSyncTime: Date | null
  triggerSync: () => Promise<void>
}

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null)

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext)
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider')
  }
  return context
}

interface OfflineSyncProviderProps {
  children: React.ReactNode
}

export function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const updatePendingCount = () => {
    setPendingSyncCount(getPendingSyncCount())
  }

  const triggerSync = useCallback(async () => {
    if (syncInProgress || !isOnline) return

    setSyncInProgress(true)
    try {
      const result = await syncOfflineData()
      if (result.synced > 0) {
        console.log(`Successfully synced ${result.synced} operations`)
        setLastSyncTime(new Date())
        updatePendingCount()
      }
      if (result.errors.length > 0) {
        console.warn('Sync errors:', result.errors)
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error)
    } finally {
      setSyncInProgress(false)
    }
  }, [syncInProgress, isOnline])

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine)
    updatePendingCount()

    // Set up offline sync listeners
    const cleanup = initializeOfflineSync()

    // Custom event handlers for online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger sync after a short delay to ensure connection is stable
      setTimeout(triggerSync, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Listen for storage changes to update pending count
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('firefly_')) {
        updatePendingCount()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('storage', handleStorageChange)

    // Periodic sync check (every 5 minutes when online)
    const syncInterval = setInterval(() => {
      if (isOnline && !syncInProgress && getPendingSyncCount() > 0) {
        triggerSync()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      cleanup()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(syncInterval)
    }
  }, [isOnline, syncInProgress, triggerSync])

  const contextValue: OfflineSyncContextType = {
    isOnline,
    pendingSyncCount,
    syncInProgress,
    lastSyncTime,
    triggerSync
  }

  return (
    <OfflineSyncContext.Provider value={contextValue}>
      {children}
      
      {/* Sync status indicator */}
      {(pendingSyncCount > 0 || syncInProgress) && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 ${
            syncInProgress 
              ? 'bg-blue-600 text-white' 
              : isOnline 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {syncInProgress ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing data...</span>
                </>
              ) : isOnline ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{pendingSyncCount} items to sync</span>
                  <button
                    onClick={triggerSync}
                    className="ml-2 px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded text-xs"
                  >
                    Sync now
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Offline - {pendingSyncCount} items queued</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </OfflineSyncContext.Provider>
  )
}