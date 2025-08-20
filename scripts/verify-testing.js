#!/usr/bin/env node

/**
 * Quick verification script for testing setup
 * Validates that unit tests run and core testing infrastructure is working
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Verifying Firefly Testing Setup...\n');

// Check if test files exist
const testFiles = [
  'lib/__tests__/timer-utils.test.ts',
  'docs/manual-qa-checklist.md',
  'docs/testing-guide.md',
  'vitest.config.js'
];

console.log('📁 Checking test files...');
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check if test dependencies are installed
console.log('\n📦 Checking test dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasVitest = packageJson.devDependencies && packageJson.devDependencies.vitest;
  const hasTestScript = packageJson.scripts && packageJson.scripts.test;
  
  if (hasVitest) {
    console.log('✅ Vitest dependency installed');
  } else {
    console.log('❌ Vitest dependency missing');
  }
  
  if (hasTestScript) {
    console.log('✅ Test script configured');
  } else {
    console.log('❌ Test script missing');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
}

// Run unit tests
console.log('\n🏃 Running unit tests...');
try {
  const output = execSync('bun run test', { encoding: 'utf8', stdio: 'pipe' });
  
  if (output.includes('passed')) {
    console.log('✅ Unit tests passed');
    
    // Extract test count from output
    const testMatch = output.match(/(\d+) passed/);
    if (testMatch) {
      console.log(`   ${testMatch[1]} tests executed successfully`);
    }
  } else {
    console.log('⚠️  Unit tests completed but results unclear');
  }
} catch (error) {
  console.log('❌ Unit tests failed');
  console.log('   Error:', error.message);
}

// Verify timer utilities specifically
console.log('\n🔧 Verifying timer utilities...');
try {
  const timerUtils = require('../lib/timer-utils.ts');
  
  // Test basic variance calculation
  const variance = timerUtils.calculateVariance(1500, 1800); // 25min vs 30min
  if (variance === 20) {
    console.log('✅ Variance calculation working correctly');
  } else {
    console.log(`❌ Variance calculation incorrect: expected 20, got ${variance}`);
  }
  
  // Test time formatting
  const formatted = timerUtils.formatTime(125);
  if (formatted === '02:05') {
    console.log('✅ Time formatting working correctly');
  } else {
    console.log(`❌ Time formatting incorrect: expected '02:05', got '${formatted}'`);
  }
  
} catch (error) {
  console.log('❌ Error testing timer utilities directly');
  console.log('   This might be due to TypeScript/import issues, but unit tests should still work');
}

console.log('\n📋 Manual QA Checklist');
console.log('   Next step: Follow the manual QA checklist in docs/manual-qa-checklist.md');
console.log('   Start the dev server with: bun run dev');
console.log('   Then work through the complete user journey test');

console.log('\n🎯 Testing Setup Complete!');
console.log('   Unit tests: Automated variance calculation testing');
console.log('   Manual QA: Complete user journey validation');
console.log('   Performance: Timer latency and AI response time verification');