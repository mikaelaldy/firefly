#!/usr/bin/env node

/**
 * Diagnostic script to check Supabase authentication configuration
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function diagnoseAuth() {
  console.log('🔍 Diagnosing Supabase Authentication Setup...\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`  SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing required environment variables')
    console.log('Please check your .env.local file')
    return
  }
  
  // Test Supabase connection
  console.log('\n🔗 Testing Supabase Connection:')
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.log(`  ❌ Connection failed: ${error.message}`)
    } else {
      console.log('  ✅ Connection successful')
    }
    
    // Check if Google OAuth is configured
    console.log('\n🔐 Checking OAuth Providers:')
    try {
      // This will fail if Google OAuth isn't configured
      const { data: providers, error: providerError } = await supabase.auth.getOAuthProviders()
      if (providerError) {
        console.log(`  ❌ OAuth check failed: ${providerError.message}`)
      } else {
        console.log('  ✅ OAuth providers accessible')
      }
    } catch (err) {
      console.log(`  ⚠️  OAuth provider check not available: ${err.message}`)
    }
    
  } catch (error) {
    console.log(`  ❌ Supabase client error: ${error.message}`)
  }
  
  console.log('\n📝 Next Steps:')
  console.log('1. Ensure your Supabase project is active')
  console.log('2. Configure Google OAuth in Supabase Dashboard > Authentication > Providers')
  console.log('3. Set Site URL to http://localhost:3000 in Supabase Dashboard')
  console.log('4. Add redirect URL: http://localhost:3000/auth/callback')
  console.log('5. Update .env.local with correct values if needed')
}

diagnoseAuth().catch(console.error)