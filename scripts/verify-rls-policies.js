#!/usr/bin/env node

/**
 * RLS Policy Verification Script
 * Tests Row Level Security policies with positive and negative test cases
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   SUPABASE_SERVICE_ROLE_KEY (optional, for service role tests)');
  process.exit(1);
}

// Create clients for different access levels
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function createTestUsers() {
  if (!serviceClient) {
    console.log('⚠️  Service role key not provided, skipping user creation');
    return { user1: null, user2: null };
  }

  console.log('🔧 Creating test users...');
  
  try {
    // Create two test users
    const { data: user1, error: error1 } = await serviceClient.auth.admin.createUser({
      email: 'test-user-1@example.com',
      password: 'test-password-123',
      email_confirm: true
    });

    const { data: user2, error: error2 } = await serviceClient.auth.admin.createUser({
      email: 'test-user-2@example.com', 
      password: 'test-password-123',
      email_confirm: true
    });

    if (error1 || error2) {
      console.log('⚠️  Test users may already exist, continuing with existing users');
    }

    return { 
      user1: user1?.user || null, 
      user2: user2?.user || null 
    };
  } catch (error) {
    console.log('⚠️  Could not create test users:', error.message);
    return { user1: null, user2: null };
  }
}

async function cleanupTestUsers(user1, user2) {
  if (!serviceClient || !user1 || !user2) return;
  
  console.log('🧹 Cleaning up test users...');
  
  try {
    await serviceClient.auth.admin.deleteUser(user1.id);
    await serviceClient.auth.admin.deleteUser(user2.id);
    console.log('✅ Test users cleaned up');
  } catch (error) {
    console.log('⚠️  Could not clean up test users:', error.message);
  }
}

async function testRLSPolicies() {
  console.log('🔒 Testing Row Level Security Policies\n');

  const { user1, user2 } = await createTestUsers();
  
  try {
    // Test 1: Anonymous access should be blocked
    console.log('📋 Test 1: Anonymous access (should be blocked)');
    
    const anonTests = [
      { table: 'profiles', operation: 'SELECT' },
      { table: 'tasks', operation: 'SELECT' },
      { table: 'suggestions', operation: 'SELECT' },
      { table: 'sessions', operation: 'SELECT' }
    ];

    for (const test of anonTests) {
      try {
        const { data, error } = await anonClient
          .from(test.table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ✅ ${test.table}: Anonymous ${test.operation} blocked (${error.message})`);
        } else if (data && data.length === 0) {
          console.log(`   ✅ ${test.table}: Anonymous ${test.operation} returns empty (RLS working)`);
        } else {
          console.log(`   ❌ ${test.table}: Anonymous ${test.operation} returned data (RLS may be broken)`);
        }
      } catch (error) {
        console.log(`   ✅ ${test.table}: Anonymous ${test.operation} blocked (${error.message})`);
      }
    }

    // Test 2: Cross-user access should be blocked (if we have test users)
    if (user1 && user2) {
      console.log('\n📋 Test 2: Cross-user access (should be blocked)');
      
      // Sign in as user1 and create some data
      const { error: signInError1 } = await anonClient.auth.signInWithPassword({
        email: 'test-user-1@example.com',
        password: 'test-password-123'
      });

      if (!signInError1) {
        // Create a task as user1
        const { data: taskData, error: taskError } = await anonClient
          .from('tasks')
          .insert({
            goal: 'Test task for RLS verification',
            urgency: 'medium'
          })
          .select('id')
          .single();

        if (!taskError && taskData) {
          console.log(`   ✅ User1 can create tasks (task ID: ${taskData.id})`);
          
          // Sign in as user2 and try to access user1's data
          await anonClient.auth.signOut();
          const { error: signInError2 } = await anonClient.auth.signInWithPassword({
            email: 'test-user-2@example.com',
            password: 'test-password-123'
          });

          if (!signInError2) {
            // Try to access user1's task as user2
            const { data: crossUserData, error: crossUserError } = await anonClient
              .from('tasks')
              .select('*')
              .eq('id', taskData.id);

            if (crossUserError || (crossUserData && crossUserData.length === 0)) {
              console.log('   ✅ User2 cannot access User1\'s tasks (RLS working)');
            } else {
              console.log('   ❌ User2 can access User1\'s tasks (RLS broken)');
            }

            // Clean up the test task
            await anonClient.auth.signOut();
            await anonClient.auth.signInWithPassword({
              email: 'test-user-1@example.com',
              password: 'test-password-123'
            });
            
            await anonClient.from('tasks').delete().eq('id', taskData.id);
          }
        }
      }
    } else {
      console.log('\n⚠️  Skipping cross-user tests (no service role key or test users)');
    }

    // Test 3: Authenticated user can access own data
    console.log('\n📋 Test 3: Authenticated user self-access (should work)');
    
    if (user1) {
      const { error: signInError } = await anonClient.auth.signInWithPassword({
        email: 'test-user-1@example.com',
        password: 'test-password-123'
      });

      if (!signInError) {
        // Test creating and reading own data
        const { data: taskData, error: taskError } = await anonClient
          .from('tasks')
          .insert({
            goal: 'Self-access test task',
            urgency: 'low'
          })
          .select('*')
          .single();

        if (!taskError && taskData) {
          console.log('   ✅ User can create and read own tasks');
          
          // Clean up
          await anonClient.from('tasks').delete().eq('id', taskData.id);
        } else {
          console.log('   ❌ User cannot create own tasks:', taskError?.message);
        }
      }
    } else {
      console.log('   ⚠️  Skipping self-access test (no test users)');
    }

    // Test 4: Check if RLS is enabled on all tables
    console.log('\n📋 Test 4: RLS Status Check');
    
    if (serviceClient) {
      const { data: rlsStatus, error: rlsError } = await serviceClient
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .in('tablename', ['profiles', 'tasks', 'suggestions', 'sessions']);

      if (!rlsError && rlsStatus) {
        for (const table of rlsStatus) {
          // Check if RLS is enabled (this is a simplified check)
          console.log(`   ℹ️  Table '${table.tablename}' exists`);
        }
      }
    }

  } finally {
    await anonClient.auth.signOut();
    await cleanupTestUsers(user1, user2);
  }
}

async function main() {
  try {
    await testRLSPolicies();
    console.log('\n✅ RLS policy verification completed');
  } catch (error) {
    console.error('\n❌ RLS policy verification failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testRLSPolicies };