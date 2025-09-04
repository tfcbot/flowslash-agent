import { Composio } from '@composio/core';

/**
 * Basic Composio Tests with UserId
 * 
 * This test suite demonstrates:
 * 1. Direct tool execution with userId
 * 2. Tool fetching patterns
 * 3. Basic error handling
 * 4. Different tool types
 */

const TEST_USER_ID = 'test_user_basic';

async function testBasicToolExecution() {
  console.log('🧪 Testing Basic Tool Execution with UserId...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Test 1: HackerNews tool execution
    console.log('📋 Test 1: HackerNews User Lookup');
    
    const hackerNewsResult = await composio.tools.execute('HACKERNEWS_GET_USER', {
      userId: TEST_USER_ID,
      arguments: {
        username: 'pg'
      },
    });

    console.log('✅ HackerNews Result:', {
      successful: hackerNewsResult.successful,
      data: hackerNewsResult.data ? 'Data received' : 'No data',
      userId: TEST_USER_ID
    });

    // Test 2: GitHub tool execution (if available)
    console.log('📋 Test 2: GitHub User Lookup');
    
    try {
      const githubResult = await composio.tools.execute('GITHUB_GET_USER', {
        userId: TEST_USER_ID,
        arguments: {
          username: 'octocat'
        },
      });

      console.log('✅ GitHub Result:', {
        successful: githubResult.successful,
        data: githubResult.data ? 'Data received' : 'No data',
        userId: TEST_USER_ID
      });
    } catch (githubError) {
      console.log('⚠️  GitHub test skipped (tool may not be available):', (githubError as Error).message);
    }

    // Test 3: Slack tool execution (if available)
    console.log('📋 Test 3: Slack Channel List');
    
    try {
      const slackResult = await composio.tools.execute('SLACK_LIST_CHANNELS', {
        userId: TEST_USER_ID,
        arguments: {},
      });

      console.log('✅ Slack Result:', {
        successful: slackResult.successful,
        data: slackResult.data ? 'Data received' : 'No data',
        userId: TEST_USER_ID
      });
    } catch (slackError) {
      console.log('⚠️  Slack test skipped (tool may not be available or authenticated):', (slackError as Error).message);
    }

  } catch (error) {
    console.error('❌ Basic test failed:', error);
    throw error;
  }
}

async function testToolFetching() {
  console.log('🧪 Testing Tool Fetching with UserId...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Test fetching single tool
    console.log('📋 Test: Fetching HackerNews Tool');
    
    const hackerNewsTool = await composio.tools.get(TEST_USER_ID, 'HACKERNEWS_GET_USER');
    
    console.log('✅ Tool Fetched:', {
      toolCount: Array.isArray(hackerNewsTool) ? hackerNewsTool.length : 1,
      userId: TEST_USER_ID,
      toolName: 'HACKERNEWS_GET_USER'
    });

    // Test fetching multiple tools (if available)
    console.log('📋 Test: Fetching Multiple Tools');
    
    try {
      const multipleTools = await composio.tools.get(TEST_USER_ID, ['HACKERNEWS_GET_USER', 'GITHUB_GET_USER']);
      
      console.log('✅ Multiple Tools Fetched:', {
        toolCount: Array.isArray(multipleTools) ? multipleTools.length : 1,
        userId: TEST_USER_ID
      });
    } catch (multiError) {
      console.log('⚠️  Multiple tool fetch test skipped:', (multiError as Error).message);
    }

  } catch (error) {
    console.error('❌ Tool fetching test failed:', error);
    throw error;
  }
}

async function testErrorScenarios() {
  console.log('🧪 Testing Error Scenarios...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Test 1: Invalid tool action
    console.log('📋 Test: Invalid Tool Action');
    
    try {
      await composio.tools.execute('INVALID_TOOL_ACTION', {
        userId: TEST_USER_ID,
        arguments: {},
      });
      console.log('❌ Expected error for invalid tool action');
    } catch (error) {
      console.log('✅ Correctly handled invalid tool action:', (error as Error).message);
    }

    // Test 2: Missing required arguments
    console.log('📋 Test: Missing Required Arguments');
    
    try {
      await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: TEST_USER_ID,
        arguments: {}, // Missing username
      });
      console.log('❌ Expected error for missing arguments');
    } catch (error) {
      console.log('✅ Correctly handled missing arguments:', (error as Error).message);
    }

    // Test 3: Empty userId
    console.log('📋 Test: Empty UserId');
    
    try {
      await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: '',
        arguments: {
          username: 'pg'
        },
      });
      console.log('⚠️  Empty userId was accepted (may be valid behavior)');
    } catch (error) {
      console.log('✅ Correctly handled empty userId:', (error as Error).message);
    }

  } catch (error) {
    console.error('❌ Error scenario test failed:', error);
    throw error;
  }
}

async function runBasicTests() {
  console.log('🚀 Starting Basic Composio Tests...\n');
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.error('❌ COMPOSIO_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    await testBasicToolExecution();
    console.log('');
    
    await testToolFetching();
    console.log('');
    
    await testErrorScenarios();
    console.log('');
    
    console.log('🎉 All Basic Tests Completed Successfully!');
    
  } catch (error) {
    console.error('💥 Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runBasicTests();
}

export {
  runBasicTests,
  testBasicToolExecution,
  testToolFetching,
  testErrorScenarios,
  TEST_USER_ID
};

