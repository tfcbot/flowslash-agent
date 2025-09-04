#!/usr/bin/env node
/**
 * Example AI Agent that monitors workflows and provides optimizations
 * 
 * This agent demonstrates how external AI systems can collaborate
 * in real-time with human users through InstantDB.
 * 
 * Usage:
 *   npx tsx examples/agent-integration/optimization-agent.ts <workflow-id>
 */

import { createWorkflowAgent } from '../../lib/agents/WorkflowAgent';

// Configuration
const AGENT_ID = 'optimization-agent-v1';
const WORKFLOW_ID = process.argv[2];

if (!WORKFLOW_ID) {
  console.error('Usage: npx tsx optimization-agent.ts <workflow-id>');
  process.exit(1);
}

async function main() {
  console.log(`🤖 Starting optimization agent for workflow: ${WORKFLOW_ID}`);
  
  try {
    // Create agent instance
    const agent = createWorkflowAgent(AGENT_ID);
    
    // Get current workflow state
    const workflowData = await agent.getWorkflow(WORKFLOW_ID);
    const workflow = workflowData.workflows?.[0];
    
    if (!workflow) {
      console.error(`❌ Workflow ${WORKFLOW_ID} not found`);
      process.exit(1);
    }
    
    console.log(`📊 Found workflow: "${workflow.name}" with ${workflow.workflowNodes?.length || 0} nodes`);
    
    // Analyze and suggest optimizations
    console.log('🔍 Analyzing workflow for optimization opportunities...');
    const analysis = await agent.optimizeWorkflow(WORKFLOW_ID);
    
    if (analysis.suggestions.length === 0) {
      console.log('✅ Workflow is already optimized!');
    } else {
      console.log(`💡 Found ${analysis.suggestions.length} optimization suggestions:`);
      
      for (let i = 0; i < analysis.suggestions.length; i++) {
        const suggestion = analysis.suggestions[i];
        console.log(`  ${i + 1}. ${suggestion.type.toUpperCase()} ${suggestion.target}: ${suggestion.reason}`);
      }
      
      // Auto-apply first suggestion as demonstration
      if (analysis.suggestions.length > 0) {
        console.log('\n🚀 Applying first optimization...');
        await analysis.suggestions[0].action();
        console.log('✅ Optimization applied! Check your workflow editor for changes.');
      }
    }
    
    // Start monitoring for real-time collaboration
    console.log('\n👁️  Starting real-time monitoring...');
    console.log('   - Watching for new nodes from human users');
    console.log('   - Will suggest optimizations automatically');
    console.log('   - Press Ctrl+C to stop\n');
    
    const stopMonitoring = await agent.startMonitoring(WORKFLOW_ID, (change) => {
      console.log(`📢 Detected change:`, change);
      
      if (change.type === 'optimization_suggestions') {
        console.log(`💡 New optimization suggestions available:`);
        change.suggestions.forEach((suggestion: any, i: number) => {
          console.log(`  ${i + 1}. ${suggestion.reason}`);
        });
      }
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping agent...');
      stopMonitoring();
      process.exit(0);
    });
    
    // Keep the process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Agent error:', error);
    process.exit(1);
  }
}

// Example optimization strategies
async function demonstrateOptimizations() {
  const agent = createWorkflowAgent('demo-agent');
  
  // Example 1: Add error handling
  await agent.addNode('workflow-123', {
    type: 'llm',
    position: { x: 400, y: 200 },
    data: {
      label: 'Agent: Error Handler',
      model: 'gpt-4o-mini',
      systemPrompt: 'Catch and handle errors gracefully, providing helpful fallback responses.',
      temperature: 0.1,
    }
  });
  
  // Example 2: Optimize existing LLM node
  await agent.updateNode('workflow-123', 'existing-llm-node-id', {
    data: {
      temperature: 0.3, // Reduce for more consistent outputs
      maxTokens: 150,   // Optimize for efficiency
    }
  });
  
  // Example 3: Add performance monitoring
  await agent.addNode('workflow-123', {
    type: 'agent',
    position: { x: 600, y: 300 },
    data: {
      label: 'Agent: Performance Monitor',
      modelProvider: 'openai',
      modelName: 'gpt-4o-mini',
      systemPrompt: 'Monitor workflow performance and suggest improvements.',
      allowedTools: 'MATH,CODE_INTERPRETER',
    }
  });
}

// Run the agent
if (require.main === module) {
  main().catch(console.error);
}