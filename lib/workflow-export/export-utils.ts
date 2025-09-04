import { Node, Edge } from "reactflow";
import { WorkflowDefinition, WorkflowNode, WorkflowEdge } from "./standalone-executor";

/**
 * Convert ReactFlow nodes and edges to a standalone workflow definition
 */
export function exportWorkflowFromUI(
  nodes: Node[],
  edges: Edge[],
  metadata: {
    name: string;
    description?: string;
    version?: string;
  }
): WorkflowDefinition {
  const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: workflowId,
    name: metadata.name,
    description: metadata.description,
    version: metadata.version || "1.0.0",
    nodes: nodes.map(convertReactFlowNodeToWorkflowNode),
    edges: edges.map(convertReactFlowEdgeToWorkflowEdge),
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedFrom: "UI",
      originalNodeCount: nodes.length,
      originalEdgeCount: edges.length,
    },
  };
}

/**
 * Convert ReactFlow node to workflow node
 */
function convertReactFlowNodeToWorkflowNode(node: Node): WorkflowNode {
  let nodeType: WorkflowNode['type'];
  let config: Record<string, any> = {};

  switch (node.type) {
    case "customInput":
      nodeType = "input";
      config = {
        defaultValue: node.data?.query || "",
        label: node.data?.label || "Input",
      };
      break;

    case "llm":
      nodeType = "llm";
      config = {
        provider: node.data?.modelProvider || "openai",
        modelName: node.data?.modelName || "gpt-4",
        systemPrompt: node.data?.systemPrompt || "",
        temperature: node.data?.temperature || 0.7,
        maxTokens: node.data?.maxTokens || 1000,
        label: node.data?.label || "LLM",
      };
      break;

    case "composio":
      nodeType = "composio";
      config = {
        toolAction: node.data?.toolAction || "",
        inputMapping: node.data?.inputMapping || {},
        parameters: node.data?.parameters || {},
        label: node.data?.label || "Tool",
      };
      break;

    case "agent":
      nodeType = "agent";
      config = {
        agentType: node.data?.agentType || "react",
        systemPrompt: node.data?.systemPrompt || "",
        tools: node.data?.tools || [],
        label: node.data?.label || "Agent",
      };
      break;

    case "customOutput":
      nodeType = "output";
      config = {
        format: node.data?.format || "text",
        template: node.data?.template || "",
        label: node.data?.label || "Output",
      };
      break;

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }

  return {
    id: node.id,
    type: nodeType,
    config,
    position: node.position,
  };
}

/**
 * Convert ReactFlow edge to workflow edge
 */
function convertReactFlowEdgeToWorkflowEdge(edge: Edge): WorkflowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    condition: edge.data?.condition,
  };
}

/**
 * Generate a standalone JavaScript function from workflow definition
 */
export function generateStandaloneFunction(
  workflow: WorkflowDefinition,
  options: {
    functionName?: string;
    includeTypes?: boolean;
    includeComments?: boolean;
  } = {}
): string {
  const {
    functionName = "executeWorkflow",
    includeTypes = true,
    includeComments = true,
  } = options;

  const typeAnnotations = includeTypes ? ": Promise<WorkflowResult>" : "";
  const comments = includeComments ? generateComments(workflow) : "";

  return `${comments}
import { 
  StandaloneWorkflowExecutor, 
  WorkflowDefinition, 
  WorkflowConfig, 
  WorkflowResult 
} from './standalone-executor';

// Workflow definition exported from UI
const workflowDefinition${includeTypes ? ": WorkflowDefinition" : ""} = ${JSON.stringify(workflow, null, 2)};

/**
 * Execute the "${workflow.name}" workflow
 * 
 * @param input - The input string to process
 * @param config - Configuration including API keys
 * @returns Promise<WorkflowResult> - The execution result
 */
export async function ${functionName}(
  input: string,
  config: WorkflowConfig
)${typeAnnotations} {
  const executor = new StandaloneWorkflowExecutor(workflowDefinition, config);
  return await executor.execute(input);
}

/**
 * Execute the "${workflow.name}" workflow with streaming
 * 
 * @param input - The input string to process
 * @param config - Configuration including API keys
 * @returns AsyncGenerator - Stream of execution events
 */
export async function* ${functionName}Stream(
  input: string,
  config: WorkflowConfig
) {
  const executor = new StandaloneWorkflowExecutor(workflowDefinition, config);
  yield* executor.executeStream(input);
}

// Example usage:
/*
const result = await ${functionName}("Hello world!", {
  apiKeys: {
    openai_api_key: "your-key-here",
    composio_api_key: "your-key-here",
  },
  userId: "user123"
});

console.log(result.output);
*/`;
}

/**
 * Generate comments for the workflow
 */
function generateComments(workflow: WorkflowDefinition): string {
  const nodeTypes = [...new Set(workflow.nodes.map(n => n.type))];
  const hasLLM = nodeTypes.includes('llm');
  const hasComposio = nodeTypes.includes('composio');
  
  let requiredKeys = [];
  if (hasLLM) requiredKeys.push('openai_api_key (or anthropic_api_key, google_api_key)');
  if (hasComposio) requiredKeys.push('composio_api_key');

  return `/**
 * Standalone Workflow: ${workflow.name}
 * ${workflow.description ? `Description: ${workflow.description}` : ''}
 * Version: ${workflow.version}
 * 
 * This workflow contains:
 * - ${workflow.nodes.length} nodes (${nodeTypes.join(', ')})
 * - ${workflow.edges.length} connections
 * 
 * Required API Keys:
 * ${requiredKeys.map(key => `- ${key}`).join('\n * ')}
 * 
 * Generated on: ${new Date().toISOString()}
 */`;
}

/**
 * Generate a complete package.json for the standalone workflow
 */
export function generatePackageJson(workflow: WorkflowDefinition): any {
  const hasLLM = workflow.nodes.some(n => n.type === 'llm');
  const hasComposio = workflow.nodes.some(n => n.type === 'composio');

  const dependencies: Record<string, string> = {
    "@langchain/langgraph": "^0.2.74",
    "@langchain/core": "^0.3.55",
  };

  if (hasLLM) {
    dependencies["@langchain/openai"] = "^0.5.10";
    dependencies["@langchain/anthropic"] = "^0.3.20";
    dependencies["@langchain/google-genai"] = "^0.2.8";
  }

  if (hasComposio) {
    dependencies["@composio/core"] = "^0.1.8-alpha.0";
  }

  return {
    name: `workflow-${workflow.id}`,
    version: workflow.version,
    description: workflow.description || `Standalone workflow: ${workflow.name}`,
    main: "index.js",
    type: "module",
    scripts: {
      build: "tsc",
      start: "node dist/index.js",
      dev: "ts-node src/index.ts",
      test: "node test.js"
    },
    dependencies,
    devDependencies: {
      typescript: "^5.0.0",
      "ts-node": "^10.9.0",
      "@types/node": "^20.0.0"
    }
  };
}

/**
 * Generate a simple test file for the workflow
 */
export function generateTestFile(workflow: WorkflowDefinition, functionName: string = "executeWorkflow"): string {
  return `import { ${functionName} } from './index.js';

// Test configuration
const config = {
  apiKeys: {
    openai_api_key: process.env.OPENAI_API_KEY,
    anthropic_api_key: process.env.ANTHROPIC_API_KEY,
    google_api_key: process.env.GOOGLE_API_KEY,
    composio_api_key: process.env.COMPOSIO_API_KEY,
  },
  userId: "test-user"
};

// Test cases
const testCases = [
  "Hello, world!",
  "What is the weather like today?",
  "Help me write a professional email",
];

async function runTests() {
  console.log('Testing workflow: ${workflow.name}');
  console.log('='.repeat(50));
  
  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i];
    console.log(\`\\nTest \${i + 1}: "\${input}"\`);
    console.log('-'.repeat(30));
    
    try {
      const result = await ${functionName}(input, config);
      
      if (result.success) {
        console.log('✅ Success');
        console.log('Output:', result.output);
        console.log('Duration:', result.metadata.duration + 'ms');
      } else {
        console.log('❌ Failed');
        console.log('Error:', result.error);
      }
    } catch (error) {
      console.log('💥 Exception:', error.message);
    }
  }
}

runTests().catch(console.error);`;
}

/**
 * Generate a complete standalone package
 */
export function generateStandalonePackage(
  workflow: WorkflowDefinition,
  options: {
    functionName?: string;
    includeTypes?: boolean;
    includeComments?: boolean;
    includeTests?: boolean;
  } = {}
): {
  'package.json': string;
  'index.ts': string;
  'test.js': string;
  'README.md': string;
  '.env.example': string;
} {
  const functionName = options.functionName || "executeWorkflow";
  
  return {
    'package.json': JSON.stringify(generatePackageJson(workflow), null, 2),
    'index.ts': generateStandaloneFunction(workflow, options),
    'test.js': generateTestFile(workflow, functionName),
    'README.md': generateReadme(workflow, functionName),
    '.env.example': generateEnvExample(workflow),
  };
}

/**
 * Generate README for the standalone workflow
 */
function generateReadme(workflow: WorkflowDefinition, functionName: string): string {
  return `# ${workflow.name}

${workflow.description || 'Standalone workflow exported from Flowslash Agent'}

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Copy \`.env.example\` to \`.env\` and fill in your API keys:

\`\`\`bash
cp .env.example .env
\`\`\`

## Usage

\`\`\`typescript
import { ${functionName} } from './index.js';

const result = await ${functionName}("Your input here", {
  apiKeys: {
    openai_api_key: process.env.OPENAI_API_KEY,
    composio_api_key: process.env.COMPOSIO_API_KEY,
  },
  userId: "your-user-id"
});

console.log(result.output);
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Workflow Details

- **Nodes**: ${workflow.nodes.length}
- **Connections**: ${workflow.edges.length}
- **Version**: ${workflow.version}
- **Exported**: ${new Date().toISOString()}

### Node Types
${workflow.nodes.map(node => `- **${node.id}** (${node.type})`).join('\n')}
`;
}

/**
 * Generate .env.example file
 */
function generateEnvExample(workflow: WorkflowDefinition): string {
  const hasLLM = workflow.nodes.some(n => n.type === 'llm');
  const hasComposio = workflow.nodes.some(n => n.type === 'composio');

  let envVars = [];
  
  if (hasLLM) {
    envVars.push('OPENAI_API_KEY=your_openai_api_key_here');
    envVars.push('ANTHROPIC_API_KEY=your_anthropic_api_key_here');
    envVars.push('GOOGLE_API_KEY=your_google_api_key_here');
  }
  
  if (hasComposio) {
    envVars.push('COMPOSIO_API_KEY=your_composio_api_key_here');
  }

  return envVars.join('\n') + '\n';
}
