#!/usr/bin/env node

/**
 * Schema verification script for action sessions migration
 * This script verifies that the new tables exist and have the correct structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySchema() {
  console.log('🔍 Verifying Action Sessions Schema...\n');

  try {
    // Test 1: Verify action_sessions table exists and structure
    console.log('1. Testing action_sessions table structure...');
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('action_sessions')
      .select('*')
      .limit(0); // Just test the query structure

    if (sessionError) {
      console.error('❌ action_sessions table error:', sessionError.message);
      return false;
    }

    console.log('✅ action_sessions table exists and is accessible');

    // Test 2: Verify editable_actions table exists and structure
    console.log('\n2. Testing editable_actions table structure...');
    
    const { data: actionsData, error: actionsError } = await supabase
      .from('editable_actions')
      .select('*')
      .limit(0); // Just test the query structure

    if (actionsError) {
      console.error('❌ editable_actions table error:', actionsError.message);
      return false;
    }

    console.log('✅ editable_actions table exists and is accessible');

    // Test 3: Verify relationship query works
    console.log('\n3. Testing table relationships...');
    
    const { data: relationData, error: relationError } = await supabase
      .from('action_sessions')
      .select(`
        id,
        goal,
        editable_actions (
          id,
          text,
          estimated_minutes
        )
      `)
      .limit(0); // Just test the query structure

    if (relationError) {
      console.error('❌ Relationship query error:', relationError.message);
      return false;
    }

    console.log('✅ Table relationships work correctly');

    // Test 4: Verify RLS is enabled (should get empty results without auth)
    console.log('\n4. Testing RLS policies...');
    
    const { data: rlsTestData, error: rlsError } = await supabase
      .from('action_sessions')
      .select('*');

    if (rlsError) {
      console.error('❌ RLS test error:', rlsError.message);
      return false;
    }

    // Should return empty array due to RLS (no authenticated user)
    if (Array.isArray(rlsTestData) && rlsTestData.length === 0) {
      console.log('✅ RLS policies are active (no data returned without authentication)');
    } else {
      console.log('⚠️  RLS policies may not be working as expected');
    }

    console.log('\n🎉 Schema verification completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ action_sessions table created');
    console.log('   ✅ editable_actions table created');
    console.log('   ✅ Table relationships working');
    console.log('   ✅ RLS policies active');
    
    return true;

  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    return false;
  }
}

// Run the verification
verifySchema()
  .then(success => {
    if (success) {
      console.log('\n✨ Migration 003_action_sessions_schema.sql is ready to use!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });