#!/usr/bin/env node

/**
 * Database setup script for Firefly ADHD Focus App
 * 
 * This script helps apply the database migrations to your Supabase project.
 * It reads the SQL files and provides instructions for applying them.
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const SEED_FILE = path.join(__dirname, '..', 'supabase', 'seed.sql');

function readMigrationFiles() {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => ({
        name: file,
        path: path.join(MIGRATIONS_DIR, file),
        content: fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      }));
    
    return sqlFiles;
  } catch (error) {
    console.error('Error reading migration files:', error.message);
    return [];
  }
}

function displayInstructions() {
  console.log('🔥 Firefly Database Setup');
  console.log('========================\n');
  
  console.log('This script will help you set up the database schema for your Firefly app.\n');
  
  console.log('📋 Prerequisites:');
  console.log('- Supabase project created');
  console.log('- Environment variables set in .env.local');
  console.log('- Supabase CLI installed (optional but recommended)\n');
  
  const migrations = readMigrationFiles();
  
  if (migrations.length === 0) {
    console.log('❌ No migration files found!');
    return;
  }
  
  console.log('📁 Found migration files:');
  migrations.forEach((migration, index) => {
    console.log(`  ${index + 1}. ${migration.name}`);
  });
  
  console.log('\n🚀 Setup Options:\n');
  
  console.log('Option 1: Supabase CLI (Recommended)');
  console.log('-------------------------------------');
  console.log('If you have Supabase CLI installed:');
  console.log('  supabase link --project-ref YOUR_PROJECT_REF');
  console.log('  supabase db push\n');
  
  console.log('Option 2: Supabase Dashboard');
  console.log('----------------------------');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Apply each migration in order:\n');
  
  migrations.forEach((migration, index) => {
    console.log(`   Step ${index + 1}: Apply ${migration.name}`);
    console.log('   Copy and paste the following SQL:\n');
    console.log('   ```sql');
    console.log(migration.content.split('\n').slice(0, 5).join('\n') + '...');
    console.log('   ```\n');
  });
  
  console.log('Option 3: Manual SQL Execution');
  console.log('------------------------------');
  console.log('Connect to your database and execute the files in this order:');
  migrations.forEach((migration, index) => {
    console.log(`  ${index + 1}. ${migration.path}`);
  });
  
  console.log('\n🌱 Optional: Demo Data');
  console.log('----------------------');
  console.log('After applying migrations, you can add demo data:');
  console.log('1. Authenticate a user in your app');
  console.log('2. Get the user UUID from auth.users table');
  console.log('3. Run: SELECT public.create_demo_data(\'USER_UUID_HERE\');\n');
  
  console.log('✅ After setup, your database will have:');
  console.log('- User profiles with preferences');
  console.log('- Tasks table for user goals');
  console.log('- Suggestions table for AI responses');
  console.log('- Sessions table for timer tracking');
  console.log('- Row Level Security policies');
  console.log('- Automatic profile creation on signup\n');
  
  console.log('🔒 Security Features:');
  console.log('- All tables protected by Row Level Security');
  console.log('- Users can only access their own data');
  console.log('- Automatic user isolation');
  console.log('- Secure authentication flow\n');
  
  console.log('Need help? Check supabase/README.md for detailed instructions.');
}

// Run the script
displayInstructions();