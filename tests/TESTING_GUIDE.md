# Composio UserId Integration - Testing Guide

This comprehensive test suite validates the integration of Composio tools with userId context, following the patterns established in the main codebase and the provided LangGraph example.

## 🎯 What We Test

### Core Functionality
- ✅ **userId Parameter Usage**: All tools properly receive and use userId context
- ✅ **Tool Execution**: Direct tool execution with userId parameters
- ✅ **Tool Fetching**: Retrieving tools with userId context for LangGraph integration
- ✅ **User Isolation**: Different users can use tools independently

### Integration Patterns
- ✅ **LangGraph Integration**: Full workflow using the provided example pattern
- ✅ **Multi-turn Conversations**: Context preservation across tool calls
- ✅ **Tool Chaining**: Multiple tools working together with userId context
- ✅ **Error Handling**: Graceful failure and recovery scenarios

### Advanced Scenarios  
- ✅ **Concurrent Execution**: Multiple tool calls with different users
- ✅ **Performance Testing**: Latency and throughput measurements
- ✅ **Edge Cases**: Invalid inputs, malformed userIds, etc.
- ✅ **Multiple Platforms**: HackerNews, GitHub, Slack, etc.

## 🚀 Quick Start

1. **Setup Environment**:
   ```bash
   cd tests
   bun run setup
   # Edit .env.local with your API keys
   ```

2. **Run All Tests**:
   ```bash
   bun test
   ```

3. **Run Specific Test Suite**:
   ```bash
   bun test:basic      # Basic Composio operations
   bun test:langgraph  # LangGraph integration  
   bun test:advanced   # Advanced scenarios
   ```

## 📁 Test Structure

```
tests/
├── basic-composio-test.ts        # Direct tool execution with userId
├── langgraph-integration-test.ts # LangGraph patterns (from example)
├── advanced-scenarios-test.ts    # Complex workflows and edge cases
├── run-all-tests.ts             # Comprehensive test runner
├── utils/
│   └── test-helpers.ts          # Shared utilities and helpers
├── package.json                 # Test dependencies and scripts
├── README.md                    # Basic documentation
├── TESTING_GUIDE.md            # This comprehensive guide
├── .env.example                # Environment template
└── setup-tests.sh              # Setup script
```

## 🔧 Environment Configuration

Required environment variables:

```bash
# Required
COMPOSIO_API_KEY=your_composio_api_key_here

# Optional (for LangGraph tests)
OPENAI_API_KEY=your_openai_api_key_here
```

Get your Composio API key from: https://app.composio.dev/api-keys

## 🧪 Test Scenarios

### 1. Basic Composio Tests (`basic-composio-test.ts`)

Tests direct tool execution patterns:

```typescript
// Example: Tool execution with userId
await composio.tools.execute('HACKERNEWS_GET_USER', {
  userId: TEST_USER_ID,
  arguments: { username: 'pg' },
});
```

**Scenarios Covered**:
- HackerNews user lookups
- GitHub user queries  
- Slack channel operations
- Invalid tool actions
- Missing arguments
- Empty userId handling

### 2. LangGraph Integration (`langgraph-integration-test.ts`)

Based on the provided example, tests full LangGraph workflows:

```typescript
// Example: LangGraph with Composio tools
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new LangchainProvider(),
});

const tools = await composio.tools.get(userId, 'HACKERNEWS_GET_USER');
const toolNode = new ToolNode(tools);

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  // ... workflow definition
```

**Scenarios Covered**:
- Single user lookups with LangGraph
- Multi-turn conversations
- Tool chaining workflows
- Multiple tool types in workflows
- Context preservation across calls

### 3. Advanced Scenarios (`advanced-scenarios-test.ts`)

Complex and edge case testing:

**Scenarios Covered**:
- Tool availability across platforms
- Concurrent tool execution
- User context isolation
- Performance benchmarking
- Error recovery patterns
- Rate limiting behavior

## 📊 Understanding Test Output

### Test Runner Output
```
🧪🧪🧪 STARTING BASIC COMPOSIO TESTS 🧪🧪🧪
✅ HackerNews Result: { successful: true, data: 'Data received', userId: 'test_user_basic' }
...
✅✅✅ COMPLETED BASIC COMPOSIO TESTS (2847ms) ✅✅✅

📊 COMPREHENSIVE TEST SUMMARY
================================================================================
📈 Overall Results:
   Total Test Suites: 3
   Successful: 3
   Failed: 0
   Total Duration: 15234ms (15.23s)
   Success Rate: 100.0%
```

### Key Metrics
- **Success Rate**: Percentage of passing tests
- **Duration**: Time for each test suite
- **User Context**: Different userIds tested for isolation
- **Tool Coverage**: Which platforms/tools are available

## 🔍 Debugging Failed Tests

### Common Issues

1. **Missing API Key**:
   ```
   ❌ COMPOSIO_API_KEY environment variable is required
   ```
   **Solution**: Set up your `.env.local` file with valid API key

2. **Tool Not Available**:
   ```
   ⚠️ GitHub tools not available: Tool not found or not authenticated
   ```
   **Solution**: Check tool authentication in Composio dashboard

3. **Rate Limiting**:
   ```
   ❌ Tool execution failed: Rate limit exceeded
   ```
   **Solution**: Wait between test runs or reduce concurrent calls

4. **Network Issues**:
   ```
   ❌ Connection timeout
   ```
   **Solution**: Check internet connection and Composio service status

### Debug Tips

1. **Run Individual Tests**:
   ```bash
   bun test:basic  # Start with simplest tests
   ```

2. **Check Environment**:
   ```bash
   echo $COMPOSIO_API_KEY  # Verify API key is loaded
   ```

3. **Verbose Logging**: Tests include detailed logging by default

## 🎯 Integration with Main Codebase

These tests validate the same patterns used in the main application:

### API Routes Pattern
```typescript
// From app/api/execute/route.ts
const userId = this.config.userId || "default_user";
const executionResult = await composio.tools.execute(toolAction, {
  userId: userId,
  arguments: toolInput,
});
```

### Standalone Executor Pattern  
```typescript
// From lib/workflow-export/standalone-executor.ts
const executionResult = await composio.tools.execute(toolAction, {
  userId: this.config.userId || "default_user",
  arguments: toolInput,
});
```

### LangGraph Integration Pattern
```typescript
// From provided example
const tools = await composio.tools.get(userId, 'HACKERNEWS_GET_USER');
const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode);
```

## 🚀 Production Readiness Checklist

Before deploying userId integration:

- [ ] All basic tests pass
- [ ] LangGraph integration tests pass  
- [ ] User isolation verified
- [ ] Error handling tested
- [ ] Performance is acceptable
- [ ] Required tools are authenticated
- [ ] Environment variables configured

## 📈 Extending the Test Suite

To add new test scenarios:

1. **Add to Basic Tests**: Simple tool execution patterns
2. **Add to LangGraph Tests**: Workflow and conversation patterns
3. **Add to Advanced Tests**: Complex scenarios and edge cases

Example new test:
```typescript
async function testNewTool() {
  const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
  });

  const result = await composio.tools.execute('NEW_TOOL_ACTION', {
    userId: TEST_USER_ID,
    arguments: { /* tool-specific args */ },
  });

  console.log('✅ New tool result:', result);
}
```

## 🤝 Contributing

When contributing to the test suite:

1. Follow the established userId patterns
2. Include comprehensive error handling
3. Add descriptive logging
4. Test both success and failure cases
5. Update this guide with new scenarios

## 📞 Support

If tests fail consistently:

1. Check Composio service status
2. Verify API key permissions
3. Ensure tool authentication in Composio dashboard
4. Review rate limiting settings
5. Check network connectivity

The test suite is designed to be comprehensive and reliable, providing confidence in the userId integration across all Composio tool usage patterns.

