/**
 * Example: Using an Exported Standalone Workflow
 * 
 * This demonstrates how to use a workflow exported from the Flowslash Agent UI
 * as a completely headless, standalone function.
 */

import { 
  StandaloneWorkflowExecutor, 
  WorkflowDefinition, 
  WorkflowConfig, 
  executeWorkflow 
} from '../../lib/workflow-export/standalone-executor';

// Example workflow definition (exported from UI)
const exampleWorkflow: WorkflowDefinition = {
  id: "workflow_example_123",
  name: "Email Assistant",
  description: "Helps write professional emails using AI",
  version: "1.0.0",
  nodes: [
    {
      id: "input_1",
      type: "input",
      config: {
        defaultValue: "",
        label: "Email Request"
      }
    },
    {
      id: "llm_1", 
      type: "llm",
      config: {
        provider: "openai",
        modelName: "gpt-4",
        systemPrompt: "You are a professional email writing assistant. Help the user write clear, professional emails.",
        temperature: 0.7,
        maxTokens: 500
      }
    },
    {
      id: "output_1",
      type: "output", 
      config: {
        format: "text",
        label: "Professional Email"
      }
    }
  ],
  edges: [
    {
      id: "edge_1",
      source: "input_1",
      target: "llm_1"
    },
    {
      id: "edge_2", 
      source: "llm_1",
      target: "output_1"
    }
  ]
};

// Configuration with API keys
const config: WorkflowConfig = {
  apiKeys: {
    openai_api_key: process.env.OPENAI_API_KEY || "your-openai-key-here",
  },
  userId: "user123",
  environment: "production",
  timeout: 30000,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000
  }
};

// Example 1: Simple function call
async function example1_SimpleUsage() {
  console.log("🚀 Example 1: Simple Usage");
  console.log("=" .repeat(40));

  try {
    const result = await executeWorkflow(
      exampleWorkflow,
      "Help me write an email to my boss asking for a raise",
      config
    );

    if (result.success) {
      console.log("✅ Success!");
      console.log("📧 Generated Email:");
      console.log(result.output);
      console.log(`⏱️  Execution time: ${result.metadata.duration}ms`);
    } else {
      console.log("❌ Failed:", result.error);
    }
  } catch (error) {
    console.error("💥 Exception:", error);
  }
}

// Example 2: Using the executor class directly
async function example2_ExecutorClass() {
  console.log("\n🔧 Example 2: Using Executor Class");
  console.log("=" .repeat(40));

  const executor = new StandaloneWorkflowExecutor(exampleWorkflow, config);

  try {
    const result = await executor.execute(
      "Write a follow-up email to a client about a project update"
    );

    if (result.success) {
      console.log("✅ Success!");
      console.log("📧 Generated Email:");
      console.log(result.output);
      
      console.log("\n📊 Execution Details:");
      console.log("- Workflow ID:", result.metadata.workflowId);
      console.log("- Execution ID:", result.metadata.executionId);
      console.log("- Duration:", result.metadata.duration + "ms");
      console.log("- Nodes processed:", Object.keys(result.nodeResults).length);
    } else {
      console.log("❌ Failed:", result.error);
    }
  } catch (error) {
    console.error("💥 Exception:", error);
  }
}

// Example 3: Streaming execution
async function example3_StreamingExecution() {
  console.log("\n📡 Example 3: Streaming Execution");
  console.log("=" .repeat(40));

  const executor = new StandaloneWorkflowExecutor(exampleWorkflow, config);

  try {
    for await (const event of executor.executeStream(
      "Help me write a thank you email to my team"
    )) {
      const timestamp = new Date(event.timestamp).toLocaleTimeString();
      
      switch (event.type) {
        case 'log':
          console.log(`[${timestamp}] 📝 ${event.data}`);
          break;
        case 'nodeStart':
          console.log(`[${timestamp}] ▶️  Starting ${event.data.nodeType} node: ${event.data.nodeId}`);
          break;
        case 'nodeComplete':
          console.log(`[${timestamp}] ✅ Completed node: ${event.data.nodeId}`);
          break;
        case 'error':
          console.log(`[${timestamp}] ❌ Error: ${event.data.error}`);
          break;
        case 'complete':
          console.log(`[${timestamp}] 🎉 Workflow completed!`);
          console.log("📧 Final Result:");
          console.log(event.data.output);
          break;
      }
    }
  } catch (error) {
    console.error("💥 Streaming error:", error);
  }
}

// Example 4: Batch processing multiple inputs
async function example4_BatchProcessing() {
  console.log("\n📦 Example 4: Batch Processing");
  console.log("=" .repeat(40));

  const inputs = [
    "Write a meeting invitation for next Tuesday",
    "Draft an apology email for a delayed delivery", 
    "Create a welcome email for new team members"
  ];

  const executor = new StandaloneWorkflowExecutor(exampleWorkflow, config);

  for (let i = 0; i < inputs.length; i++) {
    console.log(`\n📝 Processing email ${i + 1}/${inputs.length}:`);
    console.log(`Input: "${inputs[i]}"`);
    
    try {
      const result = await executor.execute(inputs[i]);
      
      if (result.success) {
        console.log("✅ Generated:");
        console.log(result.output?.substring(0, 100) + "...");
      } else {
        console.log("❌ Failed:", result.error);
      }
    } catch (error) {
      console.log("💥 Error:", error);
    }
  }
}

// Example 5: Integration with Express.js API
function example5_ExpressIntegration() {
  console.log("\n🌐 Example 5: Express.js Integration");
  console.log("=" .repeat(40));

  // This would be in a separate Express.js server file
  const expressCode = `
import express from 'express';
import { StandaloneWorkflowExecutor } from './standalone-executor';

const app = express();
app.use(express.json());

const executor = new StandaloneWorkflowExecutor(workflowDefinition, config);

app.post('/api/generate-email', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await executor.execute(prompt);
    
    if (result.success) {
      res.json({
        success: true,
        email: result.output,
        executionTime: result.metadata.duration
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Email API running on port 3000');
});
  `;

  console.log("📄 Express.js integration code:");
  console.log(expressCode);
}

// Example 6: CLI tool
async function example6_CLITool() {
  console.log("\n💻 Example 6: CLI Tool Usage");
  console.log("=" .repeat(40));

  // Simulate command line arguments
  const args = process.argv.slice(2);
  const prompt = args.join(' ') || "Write a professional email template";

  console.log(`📝 CLI Input: "${prompt}"`);

  const executor = new StandaloneWorkflowExecutor(exampleWorkflow, config);

  try {
    const result = await executor.execute(prompt);
    
    if (result.success) {
      console.log("\n📧 Generated Email:");
      console.log("=" .repeat(50));
      console.log(result.output);
      console.log("=" .repeat(50));
      console.log(`✅ Completed in ${result.metadata.duration}ms`);
    } else {
      console.error("❌ Error:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Run all examples
async function runAllExamples() {
  console.log("🎯 Flowslash Agent - Standalone Workflow Examples");
  console.log("=" .repeat(60));
  
  await example1_SimpleUsage();
  await example2_ExecutorClass();
  await example3_StreamingExecution();
  await example4_BatchProcessing();
  example5_ExpressIntegration();
  await example6_CLITool();
  
  console.log("\n🎉 All examples completed!");
}

// Export for use in other files
export {
  exampleWorkflow,
  config,
  example1_SimpleUsage,
  example2_ExecutorClass,
  example3_StreamingExecution,
  example4_BatchProcessing,
  example6_CLITool
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
