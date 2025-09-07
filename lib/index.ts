// Utility functions and shared logic will be added here

// Supabase clients
export { supabase } from './supabase/client'
export { createServerClient } from './supabase/server'
export { isSupabaseConfigured, getSupabaseConfig, checkDatabaseSchema, testRLSPolicies } from './supabase/utils'
export { saveSession, getRecentSessions } from './supabase/client-sessions'
export { getSessionStats } from './supabase/sessions'

// Action Sessions (V1 Feature)
export { 
  createActionSession, 
  markActionCompleted, 
  updateSessionProgress,
  getActionSession,
  getUserActionSessions,
  syncOfflineData,
  initializeOfflineSync,
  getPendingSyncCount,
  clearOfflineData
} from './supabase/action-sessions'

// Auth
export { AuthProvider, useAuth } from './auth/context'
export { useAuthenticatedOperations } from './auth/hooks'

// Preferences
export { PreferencesProvider, usePreferences } from './preferences'

// Action Sessions Context
export { ActionSessionProvider, useActionSession } from './action-sessions/context'

// Timer utilities
export * from './timer-utils'