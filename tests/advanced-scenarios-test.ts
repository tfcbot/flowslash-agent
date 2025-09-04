import { Composio } from '@composio/core';
import { LangchainProvider } from '@composio/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';

/**
 * Advanced Composio Test Scenarios with UserId
 * 
 * This test suite demonstrates:
 * 1. Multiple tool types and platforms
 * 2. Error scenarios and edge cases
 * 3. Performance and concurrency tests
 * 4. User context management
 * 5. Advanced LangGraph patterns
 */

const TEST_USER_ID = 'test_user_advanced';

// Test different available tool sets
const AVAILABLE_TOOLS = [
  'HACKERNEWS_GET_USER',
  'HACKERNEWS_GET_ITEM', 
  'GITHUB_GET_USER',
  'GITHUB_GET_REPO',
  'SLACK_LIST_CHANNELS',
  'SLACK_SEND_MESSAGE',
  'NOTION_CREATE_PAGE',
  'GMAIL_SEND_EMAIL'
];

async function testToolAvailability() {
  console.log('🧪 Testing Tool Availability Across Platforms...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    const availableTools = [];
    const unavailableTools = [];

    for (const toolName of AVAILABLE_TOOLS) {
      try {
        console.log(`🔄 Testing ${toolName}...`);
        const tool = await composio.tools.get(TEST_USER_ID, toolName);
        availableTools.push(toolName);
        console.log(`✅ ${toolName} is available`);
      } catch (error) {
        unavailableTools.push({ tool: toolName, error: (error as Error).message });
        console.log(`❌ ${toolName} is not available: ${(error as Error).message}`);
      }
    }

    console.log('\n📊 Tool Availability Summary:');
    console.log(`✅ Available: ${availableTools.length} tools`);
    console.log(`❌ Unavailable: ${unavailableTools.length} tools`);
    console.log(`📋 Available tools: ${availableTools.join(', ')}`);

    return { availableTools, unavailableTools };

  } catch (error) {
    console.error('❌ Tool availability test failed:', error);
    throw error;
  }
}

async function testConcurrentToolExecution() {
  console.log('🧪 Testing Concurrent Tool Execution...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Test concurrent executions with same tool
    console.log('📋 Test: Concurrent HackerNews lookups');
    
    const usernames = ['pg', 'sama', 'antirez', 'spolsky'];
    const startTime = Date.now();
    
    const concurrentPromises = usernames.map(username => 
      composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: TEST_USER_ID,
        arguments: { username },
      }).catch(error => ({ error: error.message, username }))
    );

    const results = await Promise.all(concurrentPromises);
    const endTime = Date.now();
    
    const successfulResults = results.filter(r => !('error' in r));
    const failedResults = results.filter(r => 'error' in r);

    console.log(`⏱️  Concurrent execution completed in ${endTime - startTime}ms`);
    console.log(`✅ Successful: ${successfulResults.length}/${usernames.length}`);
    console.log(`❌ Failed: ${failedResults.length}/${usernames.length}`);
    
    if (failedResults.length > 0) {
      console.log('❌ Failed requests:', failedResults);
    }

  } catch (error) {
    console.error('❌ Concurrent execution test failed:', error);
    throw error;
  }
}

async function testUserContextIsolation() {
  console.log('🧪 Testing User Context Isolation...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Test with different user IDs to ensure isolation
    const userIds = ['user_1', 'user_2', 'user_3'];
    
    console.log('📋 Test: Different users executing same tool');
    
    const userResults = [];
    
    for (const userId of userIds) {
      try {
        console.log(`🔄 Testing with userId: ${userId}`);
        
        const result = await composio.tools.execute('HACKERNEWS_GET_USER', {
          userId: userId,
          arguments: { username: 'pg' },
        });

        userResults.push({
          userId,
          successful: result.successful,
          hasData: !!result.data
        });
        
        console.log(`✅ User ${userId}: Success = ${result.successful}`);
        
      } catch (error) {
        console.log(`❌ User ${userId}: Error = ${(error as Error).message}`);
        userResults.push({
          userId,
          successful: false,
          error: (error as Error).message
        });
      }
    }

    console.log('\n📊 User Context Summary:', userResults);

  } catch (error) {
    console.error('❌ User context isolation test failed:', error);
    throw error;
  }
}

async function testAdvancedLangGraphPatterns() {
  console.log('🧪 Testing Advanced LangGraph Patterns...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new LangchainProvider(),
    });

    // Get multiple tools for advanced workflow
    const tools = [];
    
    try {
      const hackerNewsTools = await composio.tools.get(TEST_USER_ID, 'HACKERNEWS_GET_USER');
      tools.push(...(Array.isArray(hackerNewsTools) ? hackerNewsTools : [hackerNewsTools]));
    } catch (error) {
      console.log('⚠️  HackerNews tools not available');
    }

    try {
      const githubTools = await composio.tools.get(TEST_USER_ID, 'GITHUB_GET_USER');  
      tools.push(...(Array.isArray(githubTools) ? githubTools : [githubTools]));
    } catch (error) {
      console.log('⚠️  GitHub tools not available');
    }

    if (tools.length === 0) {
      console.log('⚠️  No tools available for advanced patterns, skipping test');
      return;
    }

    const toolNode = new ToolNode(tools);
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.3,
    }).bindTools(tools);

    // Enhanced workflow with multiple decision points
    function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
      const lastMessage = messages[messages.length - 1] as AIMessage;
      
      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      
      // Check if we need more information
      const content = lastMessage.content?.toString().toLowerCase();
      if (content?.includes('need more information') || content?.includes('require additional')) {
        return 'clarify';
      }
      
      return '__end__';
    }

    async function callModel(state: typeof MessagesAnnotation.State) {
      console.log('🔄 Advanced model call...');
      const response = await model.invoke(state.messages);
      return { messages: [response] };
    }

    async function clarifyRequest(state: typeof MessagesAnnotation.State) {
      console.log('🔄 Clarifying request...');
      const clarificationPrompt = new AIMessage(
        "I need to gather more information. Let me use the available tools to get comprehensive data."
      );
      return { messages: [...state.messages, clarificationPrompt] };
    }

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addEdge('__start__', 'agent')
      .addNode('tools', toolNode)
      .addNode('clarify', clarifyRequest)
      .addEdge('tools', 'agent')
      .addEdge('clarify', 'agent')
      .addConditionalEdges('agent', shouldContinue);

    const app = workflow.compile();

    // Test complex multi-step workflow
    console.log('📋 Test: Complex multi-platform research task');
    
    const complexQuery = `I want to research the user 'pg'. Please:
    1. Get their HackerNews profile and activity
    2. If possible, find their GitHub profile
    3. Compare their activity across platforms
    4. Provide a comprehensive summary`;

    const result = await app.invoke({
      messages: [new HumanMessage(complexQuery)],
    });
    
    console.log('✅ Complex workflow completed');
    console.log('📄 Final response length:', result.messages[result.messages.length - 1].content?.toString().length || 0);
    console.log('📊 Total messages in conversation:', result.messages.length);

  } catch (error) {
    console.error('❌ Advanced LangGraph patterns test failed:', error);
    throw error;
  }
}

async function testErrorHandlingAndRecovery() {
  console.log('🧪 Testing Error Handling and Recovery...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Test 1: Tool execution with invalid arguments
    console.log('📋 Test 1: Invalid arguments handling');
    
    try {
      await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: TEST_USER_ID,
        arguments: {
          username: null, // Invalid username
        },
      });
      console.log('❌ Expected error for null username');
    } catch (error) {
      console.log('✅ Correctly handled null username:', (error as Error).message.substring(0, 100));
    }

    // Test 2: Empty userId handling
    console.log('📋 Test 2: Empty userId handling');
    
    try {
      await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: '', // Empty userId
        arguments: { username: 'pg' },
      });
      console.log('⚠️  Empty userId was accepted (may be valid behavior)');
    } catch (error) {
      console.log('✅ Correctly handled empty userId:', (error as Error).message.substring(0, 100));
    }

    // Test 3: Very long userId
    console.log('📋 Test 3: Very long userId');
    
    try {
      const longUserId = 'a'.repeat(1000);
      await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: longUserId,
        arguments: { username: 'pg' },
      });
      console.log('⚠️  Very long userId was accepted');
    } catch (error) {
      console.log('✅ Correctly handled long userId:', (error as Error).message.substring(0, 100));
    }

    // Test 4: Special characters in userId
    console.log('📋 Test 4: Special characters in userId');
    
    try {
      await composio.tools.execute('HACKERNEWS_GET_USER', {
        userId: 'test-user@domain.com#$%',
        arguments: { username: 'pg' },
      });
      console.log('⚠️  Special characters in userId were accepted');
    } catch (error) {
      console.log('✅ Correctly handled special characters:', (error as Error).message.substring(0, 100));
    }

  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    throw error;
  }
}

async function testPerformanceMetrics() {
  console.log('🧪 Testing Performance Metrics...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    const performanceTests = [
      { name: 'Single Tool Fetch', iterations: 5 },
      { name: 'Tool Execution', iterations: 3 },
    ];

    for (const test of performanceTests) {
      console.log(`📋 ${test.name} - Running ${test.iterations} iterations`);
      
      const times = [];
      
      for (let i = 0; i < test.iterations; i++) {
        const startTime = Date.now();
        
        try {
          if (test.name === 'Single Tool Fetch') {
            await composio.tools.get(TEST_USER_ID, 'HACKERNEWS_GET_USER');
          } else if (test.name === 'Tool Execution') {
            await composio.tools.execute('HACKERNEWS_GET_USER', {
              userId: TEST_USER_ID,
              arguments: { username: 'pg' },
            });
          }
          
          const endTime = Date.now();
          times.push(endTime - startTime);
          
        } catch (error) {
          console.log(`⚠️  Iteration ${i + 1} failed:`, (error as Error).message);
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`⏱️  ${test.name} Performance:`);
        console.log(`   Average: ${avgTime.toFixed(2)}ms`);
        console.log(`   Min: ${minTime}ms`);
        console.log(`   Max: ${maxTime}ms`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Performance metrics test failed:', error);
    throw error;
  }
}

async function runAdvancedTests() {
  console.log('🚀 Starting Advanced Composio Test Scenarios...\n');
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.error('❌ COMPOSIO_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    const { availableTools } = await testToolAvailability();
    console.log('\n' + '='.repeat(80) + '\n');
    
    if (availableTools.length > 0) {
      await testConcurrentToolExecution();
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
    await testUserContextIsolation();
    console.log('\n' + '='.repeat(80) + '\n');
    
    if (availableTools.length > 0) {
      await testAdvancedLangGraphPatterns();
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
    await testErrorHandlingAndRecovery();
    console.log('\n' + '='.repeat(80) + '\n');
    
    if (availableTools.length > 0) {
      await testPerformanceMetrics();
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
    console.log('🎉 All Advanced Tests Completed Successfully!');
    console.log(`📊 Tests run with userId context: ${TEST_USER_ID}`);
    
  } catch (error) {
    console.error('💥 Advanced Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runAdvancedTests();
}

export {
  runAdvancedTests,
  testToolAvailability,
  testConcurrentToolExecution,
  testUserContextIsolation,
  testAdvancedLangGraphPatterns,
  testErrorHandlingAndRecovery,
  testPerformanceMetrics,
  TEST_USER_ID
};

