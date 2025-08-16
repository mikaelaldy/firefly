/**
 * Verification script for authentication setup
 * Run with: node scripts/verify-auth.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Simple .env.local parser
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    })
  } catch (error) {
    console.error('Could not load .env.local file:', error.message)
  }
}

loadEnvFile()

async function verifyAuthSetup() {
  console.log('🔍 Verifying authentication setup...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required variables:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return false
  }

  console.log('✅ Environment variables configured')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)

  // Test Supabase connection
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful')

    // Check if required tables exist
    const tables = ['profiles', 'tasks', 'suggestions', 'sessions']
    let allTablesExist = true

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('id').limit(1)
        if (tableError && tableError.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`)
          allTablesExist = false
        } else {
          console.log(`✅ Table '${table}' exists`)
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message)
        allTablesExist = false
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  Some database tables are missing.')
      console.log('Run the database setup script: bun run db:setup')
      return false
    }

    console.log('\n🎉 Authentication setup verification complete!')
    console.log('\nNext steps:')
    console.log('1. Configure Google OAuth in Supabase Dashboard')
    console.log('2. Start development server: bun run dev')
    console.log('3. Test authentication at http://localhost:3001')
    
    return true

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

verifyAuthSetup().then(success => {
  process.exit(success ? 0 : 1)
})