# Composio Tests with UserId

This directory contains comprehensive tests for Composio tool integration with userId support.

## ✅ UserId is Properly Required

**The tests demonstrate that userId MUST be provided** - tools fail when no userId is given, which is the expected behavior since users are pre-authenticated elsewhere.

**Fixed**: Workflow executors now properly reject missing userId:
```typescript
if (!this.config.userId) {
  throw new Error("UserId is required but not provided. Users must be pre-authenticated.");
}
const userId = this.config.userId; // ✅ No fallback - secure by design
```

## Prerequisites

1. Set `COMPOSIO_API_KEY` in your `.env.local` file
2. Ensure users have pre-authenticated with Composio (handled elsewhere)
3. Install dependencies: `bun install`

## Test Structure

### No UserId Failure Tests (`no-userid-failure-test.ts`) ✅
- **Demonstrates required failures when userId is missing**
- Shows that tools properly reject operations without userId
- Confirms workflow executors properly enforce userId requirement

### Basic Tests (`basic-composio-test.ts`)
- Direct tool execution with userId
- Tool fetching patterns
- Basic error handling

### LangGraph Integration Tests (`langgraph-integration-test.ts`)
- LangGraph StateGraph with Composio tools
- Multi-turn conversations
- Tool chaining with userId

### Advanced Scenarios (`advanced-scenarios-test.ts`)
- Multiple tool types (HackerNews, GitHub, Slack)
- Error scenarios and edge cases
- Performance and concurrency tests

## Running Tests

```bash
# Run all tests (includes failure scenarios)
bun test

# Run specific test suite
bun test:no-userid     # Show expected failures without userId
bun test:basic         # Basic Composio operations
bun test:langgraph     # LangGraph integration
bun test:advanced      # Advanced scenarios

# Run single test file
bun test:single [filename]
```

## Test Data

Each test uses a different userId to simulate different user scenarios:
- `test_user_basic` - Basic tool execution tests
- `test_user_langgraph` - LangGraph integration tests  
- `test_user_advanced` - Advanced scenario tests

## Key Patterns Tested

1. **Tool Fetching with UserId**:
   ```typescript
   const tools = await composio.tools.get(userId, 'TOOL_NAME');
   ```

2. **Tool Execution with UserId**:
   ```typescript
   await composio.tools.execute(toolAction, {
     userId: userId,
     arguments: toolInput,
   });
   ```

3. **LangGraph Integration**:
   ```typescript
   const workflow = new StateGraph(MessagesAnnotation)
     .addNode('agent', callModel)
     .addNode('tools', toolNode);
   ```

## Environment Variables

- `COMPOSIO_API_KEY` - Required for all tests
- `OPENAI_API_KEY` - Required for LangGraph tests (optional, will use default)
