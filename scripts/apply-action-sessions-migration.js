#!/usr/bin/env node

/**
 * Apply Action Sessions Migration Script
 * 
 * This script applies the 003_action_sessions_schema.sql migration
 * to your Supabase database. Use this if you have service role access.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.log('');
  console.log('To apply this migration automatically, you need the service role key.');
  console.log('');
  console.log('Alternative options:');
  console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
  console.log('2. Apply manually via Supabase Dashboard SQL Editor');
  console.log('3. Use Supabase CLI: supabase db push');
  console.log('');
  console.log('Migration file: supabase/migrations/003_action_sessions_schema.sql');
  console.log('Documentation: supabase/migrations/README_003_action_sessions.md');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying Action Sessions Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_action_sessions_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📏 SQL length:', migrationSQL.length, 'characters\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('🔧 Executing', statements.length, 'SQL statements...\n');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`   ${i + 1}/${statements.length}: Executing statement...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
        return false;
      }
    }

    console.log('\n✅ Migration applied successfully!');
    
    // Verify the tables were created
    console.log('\n🔍 Verifying migration...');
    
    const { data: sessionTest, error: sessionError } = await supabase
      .from('action_sessions')
      .select('*')
      .limit(0);

    const { data: actionsTest, error: actionsError } = await supabase
      .from('editable_actions')
      .select('*')
      .limit(0);

    if (sessionError || actionsError) {
      console.log('⚠️  Tables may not be accessible (this could be due to RLS)');
    } else {
      console.log('✅ Tables created and accessible');
    }

    console.log('\n🎉 Action Sessions Migration Complete!');
    console.log('\nNext steps:');
    console.log('1. Run: bun run scripts/verify-action-sessions-schema.js');
    console.log('2. Add demo data if needed');
    console.log('3. Start implementing V1 features');

    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Note: This approach might not work with all Supabase setups
// The exec_sql RPC function may not be available
console.log('⚠️  Note: This script requires service role access and may not work');
console.log('   with all Supabase configurations. If it fails, use manual application.\n');

applyMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });