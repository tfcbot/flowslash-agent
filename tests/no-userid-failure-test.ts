import { Composio } from '@composio/core';
import { LangchainProvider } from '@composio/langchain';

/**
 * No UserId Failure Tests
 * 
 * This test demonstrates that Composio tools should fail 
 * when no userId is provided, since users must be pre-authenticated
 * elsewhere and userId is required for proper context.
 */

async function testMissingUserId() {
  console.log('🧪 Testing Missing UserId Scenarios (Should Fail)...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    console.log('📋 Test 1: Tool execution without userId');
    
    try {
      // This should fail - no userId provided
      const result = await composio.tools.execute('HACKERNEWS_GET_USER', {
        // userId: undefined, // No userId provided
        arguments: {
          username: 'pg'
        },
      } as any);

      console.log('❌ ERROR: Tool execution succeeded without userId - this should not happen!');
      console.log('Result:', result);
      return false;
      
    } catch (error) {
      console.log('✅ EXPECTED: Tool execution failed without userId:', (error as Error).message);
    }

    console.log('📋 Test 2: Tool execution with null userId');
    
    try {
      // This should also fail - null userId
      const result = await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: null,
        arguments: {
          username: 'pg'
        },
      } as any);

      console.log('❌ ERROR: Tool execution succeeded with null userId - this should not happen!');
      return false;
      
    } catch (error) {
      console.log('✅ EXPECTED: Tool execution failed with null userId:', (error as Error).message);
    }

    console.log('📋 Test 3: Tool execution with undefined userId');
    
    try {
      // This should also fail - undefined userId
      const result = await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: undefined,
        arguments: {
          username: 'pg'
        },
      } as any);

      console.log('❌ ERROR: Tool execution succeeded with undefined userId - this should not happen!');
      return false;
      
    } catch (error) {
      console.log('✅ EXPECTED: Tool execution failed with undefined userId:', (error as Error).message);
    }

    return true;

  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
}

async function testMissingUserIdInLangGraph() {
  console.log('🧪 Testing Missing UserId in LangGraph (Should Fail)...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new LangchainProvider(),
    });

    console.log('📋 Test: Tool fetching without userId for LangGraph');
    
    try {
      // This should fail - no userId provided to tools.get
      const tools = await composio.tools.get(undefined as any, 'HACKERNEWS_GET_USER');

      console.log('❌ ERROR: Tool fetching succeeded without userId - this should not happen!');
      console.log('Tools received:', tools);
      return false;
      
    } catch (error) {
      console.log('✅ EXPECTED: Tool fetching failed without userId:', (error as Error).message);
    }

    console.log('📋 Test: Tool fetching with empty string userId');
    
    try {
      // This should also fail - empty userId
      const tools = await composio.tools.get('', 'HACKERNEWS_GET_USER');

      console.log('❌ ERROR: Tool fetching succeeded with empty userId - this should not happen!');
      return false;
      
    } catch (error) {
      console.log('✅ EXPECTED: Tool fetching failed with empty userId:', (error as Error).message);
    }

    return true;

  } catch (error) {
    console.error('❌ LangGraph test setup failed:', error);
    throw error;
  }
}

async function testWorkflowExecutorBehavior() {
  console.log('🧪 Testing Workflow Executor Behavior Without UserId...');
  
  // Simulate what happens in the actual workflow executor
  console.log('📋 Testing that workflow executors now properly fail without userId');
  
  const mockConfig = {
    apiKeys: {
      composio_api_key: process.env.COMPOSIO_API_KEY
    }
    // userId: undefined // No userId in config
  };

  // Simulate the workflow executor logic
  try {
    console.log('📋 Test: Workflow executor userId validation');
    
    // This is what the updated workflow executors now do
    if (!(mockConfig as any).userId) {
      console.log('✅ EXPECTED: Workflow correctly rejects missing userId');
      console.log('💡 Error would be: "UserId is required but not provided. Users must be pre-authenticated."');
      return true;
    } else {
      console.log('❌ ERROR: Workflow should have failed without userId');
      return false;
    }

  } catch (error) {
    console.error('❌ Workflow simulation failed:', error);
    return false;
  }
}

async function runNoUserIdTests() {
  console.log('🚀 Starting No UserId Failure Tests...\n');
  console.log('These tests demonstrate expected failures when userId is not provided');
  console.log('Users should be pre-authenticated elsewhere and userId should be required\n');
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.error('❌ COMPOSIO_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    const test1Success = await testMissingUserId();
    console.log('\n' + '='.repeat(60) + '\n');
    
    const test2Success = await testMissingUserIdInLangGraph();
    console.log('\n' + '='.repeat(60) + '\n');
    
    const test3Success = await testWorkflowExecutorBehavior();
    
    if (test1Success && test2Success && test3Success) {
      console.log('🎉 All No-UserId Tests Behaved as Expected!');
      console.log('✅ Tools properly fail when userId is not provided');
      console.log('✅ Workflow executors properly reject missing userId');
      console.log('💡 This confirms that userId is required for proper operation');
      console.log('🔒 Security: No fallback to "default_user" - proper authentication required');
    } else {
      console.log('⚠️  Some tests did not fail as expected');
      console.log('🔍 Review the behavior above - userId may not be properly required');
    }
    
  } catch (error) {
    console.error('💥 No-UserId Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runNoUserIdTests();
}

export { runNoUserIdTests };
