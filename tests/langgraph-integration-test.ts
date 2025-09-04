import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { Composio } from '@composio/core';
import { LangchainProvider } from '@composio/langchain';

/**
 * LangGraph Integration Tests with UserId
 * 
 * This test suite demonstrates:
 * 1. LangGraph StateGraph with Composio tools and userId
 * 2. Multi-turn conversations with tool usage
 * 3. Tool chaining with userId context
 * 4. Different conversation patterns
 */

const TEST_USER_ID = 'test_user_langgraph';

async function testBasicLangGraphIntegration() {
  console.log('🧪 Testing Basic LangGraph Integration (Based on Provided Example)...');
  
  try {
    // Initialize composio with LangchainProvider
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new LangchainProvider(),
    });

    // Fetch the tool with userId
    console.log('🔄 Fetching HackerNews tool with userId...');
    const tools = await composio.tools.get(TEST_USER_ID, 'HACKERNEWS_GET_USER');

    // Define the tools for the agent to use
    const toolNode = new ToolNode(tools);

    // Create a model and give it access to the tools
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    }).bindTools(tools);

    // Define the function that determines whether to continue or not
    function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
      const lastMessage = messages[messages.length - 1] as AIMessage;

      // If the LLM makes a tool call, then we route to the "tools" node
      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      // Otherwise, we stop (reply to the user) using the special "__end__" node
      return '__end__';
    }

    // Define the function that calls the model
    async function callModel(state: typeof MessagesAnnotation.State) {
      console.log('🔄 Calling the model...');
      const response = await model.invoke(state.messages);

      // We return a list, because this will get added to the existing list
      return { messages: [response] };
    }

    // Define a new graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addEdge('__start__', 'agent') // __start__ is a special name for the entrypoint
      .addNode('tools', toolNode)
      .addEdge('tools', 'agent')
      .addConditionalEdges('agent', shouldContinue);

    // Finally, we compile it into a LangChain Runnable.
    const app = workflow.compile();

    // Test 1: Use the agent (following exact example pattern)
    console.log('📋 Test 1: Single user lookup');
    const finalState = await app.invoke({
      messages: [new HumanMessage('Find the details of the user `pg` on HackerNews')],
    });
    
    console.log('✅ Message received from the model');
    console.log('📄 Response:', finalState.messages[finalState.messages.length - 1].content);
    
    // Test 2: Multi-turn conversation (following exact example pattern)
    console.log('\n📋 Test 2: Multi-turn conversation');
    const nextState = await app.invoke({
      // Including the messages from the previous run gives the LLM context.
      messages: [...finalState.messages, new HumanMessage('what about haxzie')],
    });
    
    console.log('✅ Message received from the model');
    console.log('📄 Response:', nextState.messages[nextState.messages.length - 1].content);

    console.log(`\n✅ LangGraph integration test completed successfully with userId: ${TEST_USER_ID}`);

  } catch (error) {
    console.error('❌ LangGraph integration test failed:', error);
    throw error;
  }
}

async function testMultipleToolTypes() {
  console.log('🧪 Testing Multiple Tool Types in LangGraph...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new LangchainProvider(),
    });

    // Fetch multiple different tool types
    console.log('🔄 Fetching multiple tools with userId...');
    
    const toolSets = [];
    
    // Try to get HackerNews tools
    try {
      const hackerNewsTools = await composio.tools.get(TEST_USER_ID, 'HACKERNEWS_GET_USER');
      toolSets.push(...(Array.isArray(hackerNewsTools) ? hackerNewsTools : [hackerNewsTools]));
      console.log('✅ Added HackerNews tools');
    } catch (error) {
      console.log('⚠️  HackerNews tools not available:', (error as Error).message);
    }

    // Try to get GitHub tools  
    try {
      const githubTools = await composio.tools.get(TEST_USER_ID, 'GITHUB_GET_USER');
      toolSets.push(...(Array.isArray(githubTools) ? githubTools : [githubTools]));
      console.log('✅ Added GitHub tools');
    } catch (error) {
      console.log('⚠️  GitHub tools not available:', (error as Error).message);
    }

    if (toolSets.length === 0) {
      console.log('⚠️  No tools available, skipping multi-tool test');
      return;
    }

    const toolNode = new ToolNode(toolSets);
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    }).bindTools(toolSets);

    function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
      const lastMessage = messages[messages.length - 1] as AIMessage;
      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      return '__end__';
    }

    async function callModel(state: typeof MessagesAnnotation.State) {
      console.log('🔄 Calling model with multiple tools...');
      const response = await model.invoke(state.messages);
      return { messages: [response] };
    }

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addEdge('__start__', 'agent')
      .addNode('tools', toolNode)
      .addEdge('tools', 'agent')
      .addConditionalEdges('agent', shouldContinue);

    const app = workflow.compile();

    // Test with multi-platform query
    console.log('📋 Test: Multi-platform user lookup');
    const result = await app.invoke({
      messages: [new HumanMessage('Look up information about the user `pg` on available platforms')],
    });
    
    console.log('✅ Multi-tool response received');
    console.log('📄 Response:', result.messages[result.messages.length - 1].content);

    console.log(`\n✅ Multiple tool types test completed with userId: ${TEST_USER_ID}`);

  } catch (error) {
    console.error('❌ Multiple tool types test failed:', error);
    throw error;
  }
}

async function testConversationFlow() {
  console.log('🧪 Testing Extended Conversation Flow...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new LangchainProvider(),
    });

    const tools = await composio.tools.get(TEST_USER_ID, 'HACKERNEWS_GET_USER');
    const toolNode = new ToolNode(tools);
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    }).bindTools(tools);

    function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
      const lastMessage = messages[messages.length - 1] as AIMessage;
      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      return '__end__';
    }

    async function callModel(state: typeof MessagesAnnotation.State) {
      const response = await model.invoke(state.messages);
      return { messages: [response] };
    }

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addEdge('__start__', 'agent')
      .addNode('tools', toolNode)
      .addEdge('tools', 'agent')
      .addConditionalEdges('agent', shouldContinue);

    const app = workflow.compile();

    // Multi-step conversation
    const conversations = [
      'Find the details of the user `pg` on HackerNews',
      'What is their karma score?',
      'Now look up the user `antirez`',
      'Compare their karma scores'
    ];

    let currentState = null;

    for (let i = 0; i < conversations.length; i++) {
      console.log(`📋 Conversation Step ${i + 1}: ${conversations[i]}`);
      
      const messages = currentState ? 
        [...currentState.messages, new HumanMessage(conversations[i])] : 
        [new HumanMessage(conversations[i])];

      currentState = await app.invoke({ messages });
      
      console.log('📄 Response:', currentState.messages[currentState.messages.length - 1].content);
      console.log('');
    }

    console.log(`✅ Extended conversation flow completed with userId: ${TEST_USER_ID}`);

  } catch (error) {
    console.error('❌ Conversation flow test failed:', error);
    throw error;
  }
}

async function runLangGraphTests() {
  console.log('🚀 Starting LangGraph Integration Tests...\n');
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.error('❌ COMPOSIO_API_KEY environment variable is required');
    process.exit(1);
  }

  // Check for OpenAI API key (optional, will use default if not provided)
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OPENAI_API_KEY not set, using default configuration');
  }

  try {
    await testBasicLangGraphIntegration();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await testMultipleToolTypes();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await testConversationFlow();
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🎉 All LangGraph Tests Completed Successfully!');
    
  } catch (error) {
    console.error('💥 LangGraph Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runLangGraphTests();
}

export {
  runLangGraphTests,
  testBasicLangGraphIntegration,
  testMultipleToolTypes,
  testConversationFlow,
  TEST_USER_ID
};

