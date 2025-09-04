import { NextRequest } from "next/server";
import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Composio } from "@composio/core";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

// Reuse the same interfaces and schemas from the main execute route
interface WorkflowStateType {
  messages: any[];
  currentInput?: string;
  currentOutput?: string;
  nodeResults: Record<string, any>;
  executionLog: string[];
  error?: string;
  metadata: Record<string, any>;
}

const NodeDataSchema = z.object({
  id: z.string(),
  type: z.enum(["customInput", "llm", "composio", "agent", "customOutput"]),
  data: z.record(z.any()),
  position: z.object({ x: z.number(), y: z.number() }),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
});

const ExecuteRequestSchema = z.object({
  nodes: z.array(NodeDataSchema),
  edges: z.array(EdgeSchema),
  input: z.string(),
  config: z.object({
    apiKeys: z.record(z.string()).optional(),
    userId: z.string().optional(),
  }).optional(),
});

class StreamingWorkflowExecutor {
  private nodes: z.infer<typeof NodeDataSchema>[];
  private edges: z.infer<typeof EdgeSchema>[];
  private config: any;

  constructor(nodes: any[], edges: any[], config: any = {}) {
    this.nodes = nodes;
    this.edges = edges;
    this.config = config;
  }

  async *executeStream(initialInput: string): AsyncGenerator<{
    type: 'log' | 'nodeStart' | 'nodeComplete' | 'error' | 'complete';
    data: any;
    timestamp: string;
  }> {
    const timestamp = () => new Date().toISOString();
    
    yield {
      type: 'log',
      data: 'Starting workflow execution...',
      timestamp: timestamp(),
    };

    try {
      // Build execution order based on edges
      const executionOrder = this.buildExecutionOrder();
      
      let currentState: WorkflowStateType = {
        messages: [],
        currentInput: initialInput,
        currentOutput: undefined,
        nodeResults: {},
        executionLog: ['Starting workflow execution'],
        error: undefined,
        metadata: {
          startTime: timestamp(),
          workflowId: `workflow_${Date.now()}`,
        },
      };

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        yield {
          type: 'nodeStart',
          data: { nodeId: node.id, nodeType: node.type, nodeName: node.data.label || node.id },
          timestamp: timestamp(),
        };

        try {
          currentState = await this.executeNode(node, currentState);
          
          yield {
            type: 'nodeComplete',
            data: { 
              nodeId: node.id, 
              result: currentState.nodeResults[node.id],
              currentOutput: currentState.currentOutput 
            },
            timestamp: timestamp(),
          };

          // Yield log messages
          for (const logMessage of currentState.executionLog.slice(-1)) {
            yield {
              type: 'log',
              data: logMessage,
              timestamp: timestamp(),
            };
          }

        } catch (error) {
          const errorMessage = `Node ${node.id} failed: ${error instanceof Error ? error.message : String(error)}`;
          currentState.error = errorMessage;
          currentState.executionLog.push(errorMessage);
          
          yield {
            type: 'error',
            data: { nodeId: node.id, error: errorMessage },
            timestamp: timestamp(),
          };
          
          break; // Stop execution on error
        }
      }

      // Final completion
      currentState.metadata.endTime = timestamp();
      currentState.metadata.duration = Date.now() - new Date(currentState.metadata.startTime).getTime();

      yield {
        type: 'complete',
        data: currentState,
        timestamp: timestamp(),
      };

    } catch (error) {
      yield {
        type: 'error',
        data: { error: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}` },
        timestamp: timestamp(),
      };
    }
  }

  private buildExecutionOrder(): string[] {
    // Simple topological sort based on edges
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Visit dependencies first
      const dependencies = this.edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);
      
      for (const dep of dependencies) {
        visit(dep);
      }
      
      order.push(nodeId);
    };

    // Start with input nodes
    const inputNodes = this.nodes.filter(n => n.type === "customInput");
    for (const inputNode of inputNodes) {
      visit(inputNode.id);
    }

    // Visit any remaining nodes
    for (const node of this.nodes) {
      visit(node.id);
    }

    return order;
  }

  private async executeNode(nodeConfig: any, state: WorkflowStateType): Promise<WorkflowStateType> {
    switch (nodeConfig.type) {
      case "customInput":
        return this.executeInputNode(nodeConfig, state);
      case "llm":
        return this.executeLLMNode(nodeConfig, state);
      case "composio":
        return this.executeComposioNode(nodeConfig, state);
      case "agent":
        return this.executeAgentNode(nodeConfig, state);
      case "customOutput":
        return this.executeOutputNode(nodeConfig, state);
      default:
        throw new Error(`Unknown node type: ${nodeConfig.type}`);
    }
  }

  private async executeInputNode(nodeConfig: any, state: WorkflowStateType): Promise<WorkflowStateType> {
    const log = [...state.executionLog, `Processing input node: ${nodeConfig.id}`];
    
    return {
      ...state,
      currentInput: state.currentInput || nodeConfig.data.query || "",
      messages: [
        ...state.messages,
        new HumanMessage(state.currentInput || nodeConfig.data.query || "")
      ],
      nodeResults: {
        ...state.nodeResults,
        [nodeConfig.id]: {
          type: "input",
          result: state.currentInput || nodeConfig.data.query,
          timestamp: new Date().toISOString(),
        }
      },
      executionLog: log,
    };
  }

  private async executeLLMNode(nodeConfig: any, state: WorkflowStateType): Promise<WorkflowStateType> {
    const log = [...state.executionLog, `Processing LLM node: ${nodeConfig.id}`];
    
    try {
      // Initialize the appropriate LLM
      let llm;
      const modelProvider = nodeConfig.data.modelProvider || "openai";
      const apiKey = this.config.apiKeys?.[`${modelProvider}_api_key`] || 
                    process.env[`${modelProvider.toUpperCase()}_API_KEY`];

      switch (modelProvider) {
        case "openai":
          llm = new ChatOpenAI({
            modelName: nodeConfig.data.modelName || "gpt-4",
            openAIApiKey: apiKey,
          });
          break;
        case "anthropic":
          llm = new ChatAnthropic({
            modelName: nodeConfig.data.modelName || "claude-3-sonnet-20240229",
            anthropicApiKey: apiKey,
          });
          break;
        case "google":
          llm = new ChatGoogleGenerativeAI({
            model: nodeConfig.data.modelName || "gemini-1.5-pro-latest",
            apiKey: apiKey,
          });
          break;
        default:
          throw new Error(`Unsupported model provider: ${modelProvider}`);
      }

      // Prepare messages
      const messages = [...state.messages];
      if (nodeConfig.data.systemPrompt) {
        messages.unshift(new SystemMessage(nodeConfig.data.systemPrompt));
      }

      // Execute LLM call
      const response = await llm.invoke(messages);
      
      return {
        ...state,
        messages: [...state.messages, response],
        currentOutput: response.content as string,
        nodeResults: {
          ...state.nodeResults,
          [nodeConfig.id]: {
            type: "llm",
            result: response.content,
            model: nodeConfig.data.modelName,
            provider: modelProvider,
            timestamp: new Date().toISOString(),
          }
        },
        executionLog: [...log, `LLM response generated successfully`],
      };
    } catch (error) {
      const errorMsg = `LLM node error: ${error instanceof Error ? error.message : String(error)}`;
      return {
        ...state,
        error: errorMsg,
        executionLog: [...log, errorMsg],
      };
    }
  }

  private async executeComposioNode(nodeConfig: any, state: WorkflowStateType): Promise<WorkflowStateType> {
    const log = [...state.executionLog, `Processing Composio node: ${nodeConfig.id}`];
    
    try {
      const composioApiKey = this.config.apiKeys?.composio_api_key || 
                            process.env.COMPOSIO_API_KEY;
      
      if (!composioApiKey) {
        throw new Error("Composio API key not provided");
      }

      const composio = new Composio({
        apiKey: composioApiKey,
      });

      const toolAction = nodeConfig.data.toolAction;
      const toolInput = this.extractToolInput(state, nodeConfig);
      
      if (!this.config.userId) {
        throw new Error("UserId is required but not provided. Users must be pre-authenticated.");
      }
      const userId = this.config.userId;
      
      let result;
      
      try {
        if (toolAction && toolAction !== "") {
          const executionResult = await composio.tools.execute(toolAction, {
            userId: userId,
            arguments: toolInput,
          });
          
          result = {
            success: executionResult.successful || true,
            data: executionResult.data || executionResult,
            timestamp: new Date().toISOString(),
          };
        } else {
          result = {
            success: true,
            data: `No tool action specified. Available input: ${JSON.stringify(toolInput)}`,
            timestamp: new Date().toISOString(),
          };
        }
      } catch (composioError) {
        console.warn("Composio tool execution failed:", composioError);
        result = {
          success: false,
          data: `Composio tool execution failed: ${composioError instanceof Error ? composioError.message : String(composioError)}`,
          timestamp: new Date().toISOString(),
          error: composioError,
        };
      }

      return {
        ...state,
        currentOutput: JSON.stringify(result.data),
        nodeResults: {
          ...state.nodeResults,
          [nodeConfig.id]: {
            type: "composio",
            result: result.data,
            action: toolAction,
            timestamp: new Date().toISOString(),
          }
        },
        executionLog: [...log, `Composio tool executed successfully`],
      };
    } catch (error) {
      const errorMsg = `Composio node error: ${error instanceof Error ? error.message : String(error)}`;
      return {
        ...state,
        error: errorMsg,
        executionLog: [...log, errorMsg],
      };
    }
  }

  private async executeAgentNode(nodeConfig: any, state: WorkflowStateType): Promise<WorkflowStateType> {
    const log = [...state.executionLog, `Processing Agent node: ${nodeConfig.id}`];
    
    try {
      const result = `Agent ${nodeConfig.id} processed: ${state.currentInput}`;
      
      return {
        ...state,
        currentOutput: result,
        nodeResults: {
          ...state.nodeResults,
          [nodeConfig.id]: {
            type: "agent",
            result: result,
            timestamp: new Date().toISOString(),
          }
        },
        executionLog: [...log, `Agent executed successfully`],
      };
    } catch (error) {
      const errorMsg = `Agent node error: ${error instanceof Error ? error.message : String(error)}`;
      return {
        ...state,
        error: errorMsg,
        executionLog: [...log, errorMsg],
      };
    }
  }

  private async executeOutputNode(nodeConfig: any, state: WorkflowStateType): Promise<WorkflowStateType> {
    const log = [...state.executionLog, `Processing output node: ${nodeConfig.id}`];
    
    return {
      ...state,
      nodeResults: {
        ...state.nodeResults,
        [nodeConfig.id]: {
          type: "output",
          result: state.currentOutput,
          timestamp: new Date().toISOString(),
        }
      },
      executionLog: [...log, `Workflow completed successfully`],
    };
  }

  private extractToolInput(state: WorkflowStateType, nodeConfig: any): any {
    const baseInput = {
      query: state.currentOutput || state.currentInput || "",
      context: state.messages.slice(-3).map(msg => msg.content || msg).join("\n"),
    };

    if (nodeConfig.data.inputMapping) {
      const mappedInput: any = {};
      for (const [key, sourcePath] of Object.entries(nodeConfig.data.inputMapping)) {
        if (typeof sourcePath === "string") {
          if (sourcePath.startsWith("state.")) {
            const path = sourcePath.replace("state.", "");
            mappedInput[key] = this.getNestedValue(state, path);
          } else if (sourcePath.startsWith("nodeResults.")) {
            const path = sourcePath.replace("nodeResults.", "");
            mappedInput[key] = this.getNestedValue(state.nodeResults, path);
          } else {
            mappedInput[key] = sourcePath;
          }
        }
      }
      return mappedInput;
    }

    if (nodeConfig.data.parameters) {
      const parameterInput: any = {};
      for (const [paramName, paramConfig] of Object.entries(nodeConfig.data.parameters)) {
        if (typeof paramConfig === "object" && paramConfig !== null) {
          const config = paramConfig as any;
          if (config.source === "currentOutput") {
            parameterInput[paramName] = state.currentOutput;
          } else if (config.source === "currentInput") {
            parameterInput[paramName] = state.currentInput;
          } else if (config.source === "literal") {
            parameterInput[paramName] = config.value;
          } else {
            parameterInput[paramName] = config.defaultValue || "";
          }
        } else {
          parameterInput[paramName] = paramConfig;
        }
      }
      return parameterInput;
    }

    return baseInput;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges, input, config } = ExecuteRequestSchema.parse(body);

    // Create streaming executor
    const executor = new StreamingWorkflowExecutor(nodes, edges, config);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of executor.executeStream(input)) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
          controller.close();
        } catch (error) {
          const errorChunk = {
            type: 'error',
            data: { error: error instanceof Error ? error.message : String(error) },
            timestamp: new Date().toISOString(),
          };
          const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Streaming workflow execution error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Streaming workflow execution API",
      endpoints: {
        POST: "Execute a workflow with real-time streaming updates",
      },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
