# AI Agent Integration Examples

This directory contains example AI agents that demonstrate real-time collaboration with human users through InstantDB.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp ../../env.example .env
   # Edit .env with your InstantDB credentials
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the optimization agent:**
   ```bash
   npm run optimization-agent <workflow-id>
   ```

## Available Agents

### Optimization Agent (`optimization-agent.ts`)

A smart agent that:
- **Monitors workflows** in real-time for changes
- **Analyzes workflow structure** for optimization opportunities  
- **Suggests improvements** like error handling, parameter tuning
- **Auto-applies optimizations** when beneficial
- **Collaborates transparently** with human users

**Example usage:**
```bash
# Monitor and optimize a specific workflow
npx tsx optimization-agent.ts workflow-abc-123

# The agent will:
# 1. Analyze the current workflow
# 2. Suggest optimizations
# 3. Apply the first suggestion automatically
# 4. Monitor for new changes from humans
# 5. React with additional optimizations
```

**What it does:**
- ✅ Adds error handling nodes when missing
- ✅ Optimizes LLM parameters (temperature, max tokens)
- ✅ Suggests performance improvements
- ✅ Monitors for new human-added nodes
- ✅ Provides real-time collaboration feedback

## How It Works

### Real-Time Collaboration Flow

```
Human User                    InstantDB                    AI Agent
     │                           │                           │
     ├─ Drags LLM Node ─────────▶│◀─ Real-time sync ────────┤
     │                           │                           │
     │◀─ Sees optimization ──────│◀─ Agent adds error node ─┤
     │                           │                           │
     ├─ Continues editing ──────▶│◀─ Monitors changes ──────┤
```

### Agent Architecture

The agents use **InstantDB Admin SDK** for:
- **Direct database access** - No API layers needed
- **Real-time subscriptions** - Instant change detection  
- **Atomic transactions** - Consistent multi-node operations
- **Operation logging** - Full transparency for humans

### Integration Points

1. **Node Operations:**
   ```typescript
   await agent.addNode(workflowId, {
     type: 'llm',
     position: { x: 300, y: 200 },
     data: { label: 'Agent: Optimization' }
   });
   ```

2. **Change Monitoring:**
   ```typescript
   const stopMonitoring = await agent.startMonitoring(workflowId, (change) => {
     console.log('Human made a change:', change);
     // React with optimizations
   });
   ```

3. **Workflow Analysis:**
   ```typescript
   const suggestions = await agent.optimizeWorkflow(workflowId);
   // Apply suggestions automatically or present to user
   ```

## Development

### Creating Custom Agents

```typescript
import { createWorkflowAgent } from '../../lib/agents/WorkflowAgent';

const agent = createWorkflowAgent('my-custom-agent');

// Add your agent logic
await agent.addNode(workflowId, {
  type: 'llm',
  data: { /* your optimization */ }
});
```

### Testing Agents

1. **Start the Next.js app:**
   ```bash
   cd ../..
   npm run dev
   ```

2. **Create a workflow** in the browser

3. **Run your agent:**
   ```bash
   npx tsx your-agent.ts <workflow-id>
   ```

4. **Watch real-time collaboration** in the browser!

## Production Deployment

For production, deploy agents as:
- **Serverless functions** (Vercel, Netlify, AWS Lambda)
- **Background workers** (Railway, Render, Heroku)
- **Kubernetes jobs** for enterprise setups
- **GitHub Actions** for workflow-triggered optimizations

The agents are stateless and only need:
- InstantDB credentials
- Network access to InstantDB
- Node.js runtime

## Security

Agents use **InstantDB Admin tokens** with full database access. In production:
- Use separate admin tokens per agent
- Implement agent authentication
- Add rate limiting and validation
- Monitor agent operations through the `agentOperations` table