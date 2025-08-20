'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { UserPreferences } from '@/types'

interface PreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  loading: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultTimerDuration: 25,
  soundEnabled: false,
  tickSoundEnabled: false,
  highContrastMode: false,
  reducedMotion: true, // Default to reduced motion for ADHD users
  bufferPercentage: 25
}

const STORAGE_KEY = 'firefly-user-preferences'

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as UserPreferences
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.warn('Failed to save preferences to localStorage:', error)
      }
    }
  }, [preferences, loading])

  // Apply CSS classes based on preferences
  useEffect(() => {
    const root = document.documentElement
    
    // High contrast mode
    if (preferences.highContrastMode) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [preferences.highContrastMode, preferences.reducedMotion])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const toggleHighContrast = () => {
    setPreferences(prev => ({ ...prev, highContrastMode: !prev.highContrastMode }))
  }

  const toggleReducedMotion = () => {
    setPreferences(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))
  }

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    toggleHighContrast,
    toggleReducedMotion,
    loading
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}