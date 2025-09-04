bun# LangGraph Execution Architecture

## Overview

This document explains how LangGraph computes execution graphs under the hood and how we've wrapped it behind an API for the Next.js workflow builder.

## How LangGraph Works Under the Hood

### 1. Graph Construction Phase

```typescript
// LangGraph builds a computational graph where:
const graph = new StateGraph({
  channels: {
    // Define state schema - this is the data that flows through nodes
    messages: [],      // Conversation history
    currentInput: "",  // Current processing input
    nodeResults: {},   // Results from each node
    executionLog: [],  // Execution trace
    metadata: {}       // Additional context
  }
});
```

**Key Concepts:**
- **Nodes**: Functions that transform state
- **Edges**: Define execution flow between nodes
- **State**: Immutable data structure passed between nodes
- **Channels**: Named fields in the state schema

### 2. Execution Engine

LangGraph's execution engine performs these steps:

#### a) **Graph Compilation**
```typescript
const compiledGraph = graph.compile();
```
- Validates the graph structure (no cycles, valid connections)
- Performs topological sorting to determine execution order
- Optimizes parallel execution paths
- Creates execution plan

#### b) **State Management**
```typescript
// State flows immutably through the graph
State₀ → Node₁(State₀) → State₁ → Node₂(State₁) → State₂ → ... → StateN
```
- Each node receives the current state
- Nodes return updated state (immutable)
- State history is maintained for debugging/rollback

#### c) **Parallel Execution**
```typescript
// Independent branches execute concurrently
     ┌─── Node B ───┐
Node A              Node D
     └─── Node C ───┘
```
- LangGraph identifies independent execution paths
- Runs parallel branches concurrently
- Merges results when branches converge

#### d) **Conditional Routing**
```typescript
graph.addConditionalEdges("llm_node", shouldUseTool, {
  "use_tool": "composio_node",
  "finish": "output_node"
});
```
- Evaluates conditions at runtime
- Routes execution based on state/results
- Enables dynamic workflow behavior

### 3. Error Handling & Recovery

```typescript
// Built-in error handling
try {
  const result = await node.execute(state);
  return { ...state, ...result };
} catch (error) {
  return { ...state, error: error.message };
}
```

## Our Implementation Architecture

### API Layer (`/app/api/execute/route.ts`)

```typescript
class WorkflowExecutor {
  private graph: StateGraph<WorkflowStateType>;
  
  constructor(nodes: Node[], edges: Edge[], config: Config) {
    this.buildGraph(); // Convert ReactFlow graph to LangGraph
  }
  
  private buildGraph() {
    // Map ReactFlow nodes to LangGraph nodes
    for (const node of this.nodes) {
      switch (node.type) {
        case "llm": this.graph.addNode(node.id, this.createLLMNode(node));
        case "composio": this.graph.addNode(node.id, this.createComposioNode(node));
        // ... other node types
      }
    }
    
    // Map ReactFlow edges to LangGraph edges
    for (const edge of this.edges) {
      this.graph.addEdge(edge.source, edge.target);
    }
  }
}
```

### Node Implementations

#### LLM Node
```typescript
private createLLMNode(nodeConfig: any) {
  return async (state: WorkflowStateType) => {
    // Initialize LLM based on provider (OpenAI, Anthropic, Google)
    const llm = this.createLLM(nodeConfig.data.modelProvider);
    
    // Prepare messages with system prompt
    const messages = [...state.messages];
    if (nodeConfig.data.systemPrompt) {
      messages.unshift(new SystemMessage(nodeConfig.data.systemPrompt));
    }
    
    // Execute LLM call
    const response = await llm.invoke(messages);
    
    // Return updated state
    return {
      ...state,
      messages: [...state.messages, response],
      currentOutput: response.content,
      nodeResults: {
        ...state.nodeResults,
        [nodeConfig.id]: { type: "llm", result: response.content }
      }
    };
  };
}
```

#### Composio Tool Node
```typescript
private createComposioNode(nodeConfig: any) {
  return async (state: WorkflowStateType) => {
    // Initialize Composio toolset
    const toolset = new ComposioToolSet({
      apiKey: this.config.apiKeys.composio_api_key,
      entityId: this.config.userId
    });
    
    // Get and execute tool
    const tools = await toolset.getTools({
      actions: [nodeConfig.data.toolAction]
    });
    
    const result = await tools[0].invoke({
      query: state.currentOutput || state.currentInput
    });
    
    return {
      ...state,
      currentOutput: JSON.stringify(result),
      nodeResults: {
        ...state.nodeResults,
        [nodeConfig.id]: { type: "composio", result }
      }
    };
  };
}
```

### Client Integration (`useWorkflowExecution` Hook)

```typescript
export function useWorkflowExecution() {
  const executeWorkflow = useCallback(async (
    nodes: Node[],
    edges: Edge[],
    input: string,
    config?: ExecutionConfig
  ) => {
    const response = await fetch("/api/execute", {
      method: "POST",
      body: JSON.stringify({ nodes, edges, input, config })
    });
    
    return await response.json();
  }, []);
  
  return { executeWorkflow, isExecuting, result, error };
}
```

## Execution Flow

### 1. User Interaction
```
User builds workflow in ReactFlow → Clicks "Run Test" → Provides input
```

### 2. API Processing
```
Next.js API receives:
├── ReactFlow nodes & edges
├── User input
└── Configuration (API keys, etc.)

WorkflowExecutor:
├── Converts ReactFlow graph to LangGraph
├── Maps node types to execution functions
├── Compiles and executes the graph
└── Returns results with execution log
```

### 3. State Flow Example
```typescript
// Initial State
{
  messages: [],
  currentInput: "What's the weather in NYC?",
  nodeResults: {},
  executionLog: ["Starting workflow"]
}

// After Input Node
{
  messages: [HumanMessage("What's the weather in NYC?")],
  currentInput: "What's the weather in NYC?",
  nodeResults: { "input_1": { type: "input", result: "..." } },
  executionLog: ["Starting workflow", "Processing input node"]
}

// After LLM Node
{
  messages: [HumanMessage("..."), AIMessage("I'll help you check the weather...")],
  currentOutput: "I'll help you check the weather in NYC using a weather tool.",
  nodeResults: { 
    "input_1": {...}, 
    "llm_1": { type: "llm", result: "I'll help you..." }
  },
  executionLog: ["...", "LLM response generated"]
}

// After Composio Tool Node
{
  messages: [...],
  currentOutput: '{"temperature": 72, "condition": "sunny"}',
  nodeResults: { 
    "input_1": {...}, 
    "llm_1": {...},
    "composio_1": { type: "composio", result: {...} }
  },
  executionLog: ["...", "Weather tool executed successfully"]
}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- **Frontend**: Visual workflow building (ReactFlow)
- **Backend**: Execution engine (LangGraph)
- **API**: Translation layer between UI and execution

### 2. **Scalability**
- Execution runs server-side (no client resource limits)
- Can handle long-running workflows
- Supports streaming responses (future enhancement)

### 3. **Flexibility**
- Easy to add new node types
- Configurable execution environment
- Support for different AI providers

### 4. **Debugging & Monitoring**
- Complete execution logs
- State snapshots at each step
- Error tracking and recovery

### 5. **Security**
- API keys stored server-side
- Sandboxed execution environment
- Request validation and rate limiting

## Usage Example

```typescript
// In your React component
const { executeWorkflow, isExecuting, result } = useWorkflowExecution();

const handleRunWorkflow = async () => {
  try {
    const result = await executeWorkflow(
      nodes,    // ReactFlow nodes
      edges,    // ReactFlow edges
      "Hello!", // User input
      {         // Configuration
        apiKeys: {
          openai_api_key: "sk-...",
          composio_api_key: "comp_..."
        },
        userId: "user_123"
      }
    );
    
    console.log("Workflow completed:", result);
  } catch (error) {
    console.error("Execution failed:", error);
  }
};
```

## Future Enhancements

1. **Streaming Execution**: Real-time updates during execution
2. **Workflow Persistence**: Save and resume long-running workflows
3. **Conditional Branching**: Dynamic routing based on LLM decisions
4. **Parallel Execution**: Multiple independent workflow branches
5. **Workflow Templates**: Pre-built patterns for common use cases
6. **Monitoring Dashboard**: Execution metrics and performance analytics

This architecture provides a robust foundation for building complex AI workflows while maintaining simplicity for end users.
