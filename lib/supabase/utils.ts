import { createServerClient } from './server'

/**
 * Utility functions for Supabase configuration and health checks
 */

/**
 * Check if Supabase environment variables are properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(url && key && url !== 'your_supabase_project_url_here' && key !== 'your_supabase_anon_key_here')
}

/**
 * Get Supabase configuration status for debugging
 */
export const getSupabaseConfig = () => {
  return {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    isConfigured: isSupabaseConfigured(),
  }
}

/**
 * Check if database schema is properly set up
 */
export const checkDatabaseSchema = async (): Promise<{
  isSetup: boolean;
  missingTables: string[];
  error?: string;
}> => {
  try {
    const supabase = createServerClient()
    
    // Check if required tables exist by trying to query them
    const requiredTables = ['profiles', 'tasks', 'suggestions', 'sessions']
    const missingTables: string[] = []
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1)
        if (error && error.code === '42P01') { // Table does not exist
          missingTables.push(table)
        }
      } catch (err) {
        missingTables.push(table)
      }
    }
    
    return {
      isSetup: missingTables.length === 0,
      missingTables,
    }
  } catch (error) {
    return {
      isSetup: false,
      missingTables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test RLS policies by attempting to access data
 */
export const testRLSPolicies = async (userId: string): Promise<{
  profileAccess: boolean;
  taskAccess: boolean;
  suggestionAccess: boolean;
  sessionAccess: boolean;
  error?: string;
}> => {
  try {
    const supabase = createServerClient()
    
    // Test profile access
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .limit(1)
    
    // Test task access
    const { error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    // Test suggestion access
    const { error: suggestionError } = await supabase
      .from('suggestions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    // Test session access
    const { error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    
    return {
      profileAccess: !profileError,
      taskAccess: !taskError,
      suggestionAccess: !suggestionError,
      sessionAccess: !sessionError,
    }
  } catch (error) {
    return {
      profileAccess: false,
      taskAccess: false,
      suggestionAccess: false,
      sessionAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}