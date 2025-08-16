// Utility functions and shared logic will be added here

// Supabase clients
export { supabase } from './supabase/client'
export { createServerClient } from './supabase/server'
export { isSupabaseConfigured, getSupabaseConfig, checkDatabaseSchema, testRLSPolicies } from './supabase/utils'

// Auth
export { AuthProvider, useAuth } from './auth/context'
export { useAuthenticatedOperations } from './auth/hooks'