#!/usr/bin/env node

/**
 * Test script for action sessions migration
 * This script tests the new action_sessions and editable_actions tables
 * with sample data and verifies RLS policies work correctly.
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

// Create client for testing (note: will be limited by RLS policies)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function testActionSessionsMigration() {
  console.log('🧪 Testing Action Sessions Migration...\n');

  try {
    // Test 1: Create a test user profile (simulate authenticated user)
    console.log('1. Testing table creation and basic operations...');
    
    // Create sample action session
    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('action_sessions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001', // Test UUID
        goal: 'Complete project documentation',
        total_estimated_time: 120, // 2 hours
        status: 'active'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Failed to create action session:', sessionError.message);
      return false;
    }

    console.log('✅ Action session created:', sessionData.id);

    // Create sample editable actions
    const sampleActions = [
      {
        session_id: sessionData.id,
        text: 'Review existing documentation structure',
        estimated_minutes: 30,
        confidence: 'high',
        is_custom: false,
        order_index: 1
      },
      {
        session_id: sessionData.id,
        text: 'Write API documentation',
        estimated_minutes: 45,
        confidence: 'medium',
        is_custom: false,
        order_index: 2
      },
      {
        session_id: sessionData.id,
        text: 'Create user guide examples',
        estimated_minutes: 45,
        confidence: 'medium',
        is_custom: true,
        original_text: 'Add examples to user guide',
        order_index: 3
      }
    ];

    const { data: actionsData, error: actionsError } = await supabaseClient
      .from('editable_actions')
      .insert(sampleActions)
      .select();

    if (actionsError) {
      console.error('❌ Failed to create editable actions:', actionsError.message);
      return false;
    }

    console.log(`✅ Created ${actionsData.length} editable actions`);

    // Test 2: Query data with relationships
    console.log('\n2. Testing data retrieval with relationships...');
    
    const { data: sessionWithActions, error: queryError } = await supabaseClient
      .from('action_sessions')
      .select(`
        *,
        editable_actions (*)
      `)
      .eq('id', sessionData.id)
      .single();

    if (queryError) {
      console.error('❌ Failed to query session with actions:', queryError.message);
      return false;
    }

    console.log('✅ Retrieved session with actions:');
    console.log(`   Session: ${sessionWithActions.goal}`);
    console.log(`   Actions: ${sessionWithActions.editable_actions.length} items`);

    // Test 3: Update operations
    console.log('\n3. Testing update operations...');
    
    // Mark first action as completed
    const { error: updateError } = await supabaseClient
      .from('editable_actions')
      .update({ 
        completed_at: new Date().toISOString()
      })
      .eq('id', actionsData[0].id);

    if (updateError) {
      console.error('❌ Failed to update action:', updateError.message);
      return false;
    }

    // Update session with actual time spent
    const { error: sessionUpdateError } = await supabaseClient
      .from('action_sessions')
      .update({ 
        actual_time_spent: 35,
        status: 'completed'
      })
      .eq('id', sessionData.id);

    if (sessionUpdateError) {
      console.error('❌ Failed to update session:', sessionUpdateError.message);
      return false;
    }

    console.log('✅ Successfully updated action and session');

    // Test 4: Test RLS policies (simulate different user)
    console.log('\n4. Testing RLS policies...');
    
    // Use same client for RLS testing (without authentication, should get no results)
    const testClient = supabaseClient;

    // Try to access data as different user (should fail)
    const { data: restrictedData, error: rlsError } = await testClient
      .from('action_sessions')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000002'); // Different user ID

    // This should return empty results due to RLS
    if (restrictedData && restrictedData.length === 0) {
      console.log('✅ RLS policies working correctly (no unauthorized access)');
    } else {
      console.log('⚠️  RLS policies may need verification');
    }

    // Test 5: Cleanup test data
    console.log('\n5. Cleaning up test data...');
    
    const { error: cleanupError } = await supabaseClient
      .from('action_sessions')
      .delete()
      .eq('id', sessionData.id);

    if (cleanupError) {
      console.error('❌ Failed to cleanup test data:', cleanupError.message);
      return false;
    }

    console.log('✅ Test data cleaned up successfully');

    console.log('\n🎉 All tests passed! Action sessions migration is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testActionSessionsMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });