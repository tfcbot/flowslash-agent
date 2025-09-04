#!/usr/bin/env bun

import { runBasicTests } from './basic-composio-test';
import { runLangGraphTests } from './langgraph-integration-test';
import { runAdvancedTests } from './advanced-scenarios-test';
import { runNoUserIdTests } from './no-userid-failure-test';

/**
 * Comprehensive Test Runner for Composio UserId Integration
 * 
 * This script runs all test suites in sequence and provides
 * comprehensive reporting on Composio tool usage with userId.
 */

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: Error;
}

async function runTestSuite(name: string, testFunction: () => Promise<void>): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n${'🧪'.repeat(3)} STARTING ${name.toUpperCase()} ${'🧪'.repeat(3)}`);
    await testFunction();
    const duration = Date.now() - startTime;
    console.log(`\n${'✅'.repeat(3)} COMPLETED ${name.toUpperCase()} (${duration}ms) ${'✅'.repeat(3)}`);
    return { name, success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n${'❌'.repeat(3)} FAILED ${name.toUpperCase()} (${duration}ms) ${'❌'.repeat(3)}`);
    console.error(error);
    return { name, success: false, duration, error: error as Error };
  }
}

async function checkPrerequisites() {
  console.log('🔍 Checking Prerequisites...');
  
  const issues = [];
  
  if (!process.env.COMPOSIO_API_KEY) {
    issues.push('❌ COMPOSIO_API_KEY environment variable is not set');
  } else {
    console.log('✅ COMPOSIO_API_KEY is configured');
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OPENAI_API_KEY is not set (will use default for LangGraph tests)');
  } else {
    console.log('✅ OPENAI_API_KEY is configured');
  }
  
  if (issues.length > 0) {
    console.error('\n💥 Prerequisites not met:');
    issues.forEach(issue => console.error(issue));
    console.error('\nPlease check your .env.local file and ensure required environment variables are set.');
    return false;
  }
  
  console.log('✅ All prerequisites met!\n');
  return true;
}

function printTestSummary(results: TestResult[]) {
  console.log('\n' + '='.repeat(100));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(100));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => r.success === false);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n📈 Overall Results:`);
  console.log(`   Total Test Suites: ${results.length}`);
  console.log(`   Successful: ${successful.length}`);
  console.log(`   Failed: ${failed.length}`);
  console.log(`   Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
  console.log(`   Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
  
  console.log(`\n📋 Individual Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    console.log(`   ${status} ${result.name.padEnd(25)} ${duration.padStart(8)}`);
    
    if (!result.success && result.error) {
      console.log(`      Error: ${result.error.message.substring(0, 80)}...`);
    }
  });
  
  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} test suite(s) failed. Check the logs above for details.`);
  }
  
  console.log('\n🔧 Test Configuration:');
  console.log(`   COMPOSIO_API_KEY: ${process.env.COMPOSIO_API_KEY ? 'Set' : 'Not Set'}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not Set'}`);
  console.log(`   Node Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log('\n👥 User Context Testing:');
  console.log(`   test_user_basic - Basic Composio operations`);
  console.log(`   test_user_langgraph - LangGraph integration`);
  console.log(`   test_user_advanced - Advanced scenarios`);
  console.log(`   Multiple user IDs tested for context isolation`);
  
  console.log('='.repeat(100));
}

async function main() {
  console.log('🚀 FLOWSLASH AGENT - COMPOSIO USERID INTEGRATION TEST SUITE');
  console.log('='.repeat(70));
  console.log('Testing comprehensive userId integration with Composio tools');
  console.log('Including LangGraph patterns and advanced scenarios');
  console.log('='.repeat(70));
  
  // Check prerequisites
  const prerequisitesMet = await checkPrerequisites();
  if (!prerequisitesMet) {
    process.exit(1);
  }
  
  const testSuites = [
    { name: 'No UserId Failures', func: runNoUserIdTests },
    { name: 'Basic Composio Tests', func: runBasicTests },
    { name: 'LangGraph Integration', func: runLangGraphTests },
    { name: 'Advanced Scenarios', func: runAdvancedTests },
  ];
  
  const results: TestResult[] = [];
  
  for (const suite of testSuites) {
    const result = await runTestSuite(suite.name, suite.func);
    results.push(result);
    
    // Add a small delay between test suites to avoid rate limiting
    if (suite !== testSuites[testSuites.length - 1]) {
      console.log('\n⏳ Waiting 2 seconds before next test suite...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  printTestSummary(results);
  
  // Exit with appropriate code
  const hasFailures = results.some(r => !r.success);
  if (hasFailures) {
    console.log('\n💥 Some tests failed. Check the summary above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All test suites completed successfully!');
    console.log('✅ UserId integration with Composio tools is working correctly.');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test execution interrupted by user');
  console.log('📋 Partial results may be available above');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Test execution terminated');
  process.exit(1);
});

// Run the main function
if (import.meta.main) {
  main().catch(error => {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  });
}
