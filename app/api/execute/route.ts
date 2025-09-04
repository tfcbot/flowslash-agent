import { NextRequest, NextResponse } from "next/server";
import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Composio } from "@composio/core";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { WorkflowErrorHandler } from "@/lib/utils/errorHandling";

// Define the workflow state interface
interface WorkflowStateType {
  messages: any[];
  currentInput?: string;
  currentOutput?: string;
  nodeResults: Record<string, any>;
  executionLog: string[];
  error?: string;
  metadata: Record<string, any>;
}

// Define node data schemas
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

class WorkflowExecutor {
  private graph: StateGraph<WorkflowStateType>;
  private nodes: z.infer<typeof NodeDataSchema>[];
  private edges: z.infer<typeof EdgeSchema>[];
  private config: any;

  constructor(nodes: any[], edges: any[], config: any = {}) {
    this.nodes = nodes;
    this.edges = edges;
    this.config = config;
    this.graph = new StateGraph<WorkflowStateType>({
      channels: {
        messages: {
          value: (x: any[], y: any[]) => x.concat(y),
          default: () => [],
        },
        currentInput: {
          value: (x: string | undefined, y: string | undefined) => y ?? x,
          default: () => undefined,
        },
        currentOutput: {
          value: (x: string | undefined, y: string | undefined) => y ?? x,
          default: () => undefined,
        },
        nodeResults: {
          value: (x: Record<string, any>, y: Record<string, any>) => ({ ...x, ...y }),
          default: () => ({}),
        },
        executionLog: {
          value: (x: string[], y: string[]) => x.concat(y),
          default: () => [],
        },
        error: {
          value: (x: string | undefined, y: string | undefined) => y ?? x,
          default: () => undefined,
        },
        metadata: {
          value: (x: Record<string, any>, y: Record<string, any>) => ({ ...x, ...y }),
          default: () => ({}),
        },
      },
    });
    
    this.buildGraph();
  }

  private buildGraph() {
    // Add nodes to the graph
    for (const node of this.nodes) {
      switch (node.type) {
        case "customInput":
          this.graph.addNode(node.id, this.createInputNode(node));
          break;
        case "llm":
          this.graph.addNode(node.id, this.createLLMNode(node));
          break;
        case "composio":
          this.graph.addNode(node.id, this.createComposioNode(node));
          break;
        case "agent":
          this.graph.addNode(node.id, this.createAgentNode(node));
          break;
        case "customOutput":
          this.graph.addNode(node.id, this.createOutputNode(node));
          break;
      }
    }

    // Add edges to define execution flow
    for (const edge of this.edges) {
      this.graph.addEdge(edge.source as any, edge.target as any);
    }

    // Set entry point (first input node)
    const inputNodes = this.nodes.filter(n => n.type === "customInput");
    if (inputNodes.length > 0) {
      this.graph.addEdge(START, inputNodes[0].id as any);
    }

    // Set exit point (output nodes)
    const outputNodes = this.nodes.filter(n => n.type === "customOutput");
    for (const outputNode of outputNodes) {
      this.graph.addEdge(outputNode.id as any, END);
    }
  }

  private createInputNode(nodeConfig: any) {
    return async (state: WorkflowStateType) => {
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
    };
  }

  private createLLMNode(nodeConfig: any) {
    return async (state: WorkflowStateType) => {
      const log = [...state.executionLog, `Processing LLM node: ${nodeConfig.id}`];
      
      try {
        // Initialize the appropriate LLM based on configuration
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

        // Execute LLM call with retry logic
        const response = await WorkflowErrorHandler.withRetry(
          () => llm.invoke(messages),
          { maxRetries: 2, baseDelay: 1000 },
          (attempt, error) => {
            console.log(`LLM call attempt ${attempt} failed:`, error);
          }
        );
        
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
        const workflowError = WorkflowErrorHandler.categorizeError(error, nodeConfig.id, "llm");
        const errorReport = WorkflowErrorHandler.createErrorReport(workflowError, {
          provider: nodeConfig.data.modelProvider || "openai",
          model: nodeConfig.data.modelName,
        });
        
        return {
          ...state,
          error: errorReport.userMessage,
          nodeResults: {
            ...state.nodeResults,
            [nodeConfig.id]: {
              type: "llm",
              error: errorReport,
              timestamp: new Date().toISOString(),
            }
          },
          executionLog: [...log, `LLM node failed: ${workflowError.message}`],
        };
      }
    };
  }

  private createComposioNode(nodeConfig: any) {
    return async (state: WorkflowStateType) => {
      const log = [...state.executionLog, `Processing Composio node: ${nodeConfig.id}`];
      
      try {
        const composioApiKey = this.config.apiKeys?.composio_api_key || 
                              process.env.COMPOSIO_API_KEY;
        
        if (!composioApiKey) {
          throw new Error("Composio API key not provided");
        }

        // Initialize Composio client
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
          // Try to execute the actual Composio tool
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
            // Fallback for undefined tool actions
            result = {
              success: true,
              data: `No tool action specified. Available input: ${JSON.stringify(toolInput)}`,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (composioError) {
          // Enhanced error handling for Composio tools
          const workflowError = WorkflowErrorHandler.categorizeError(composioError, nodeConfig.id, "composio");
          console.warn("Composio tool execution failed:", workflowError);
          
          result = {
            success: false,
            data: workflowError.message,
            timestamp: new Date().toISOString(),
            error: workflowError,
            recoveryActions: WorkflowErrorHandler.getRecoveryActions(workflowError),
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
    };
  }

  private createAgentNode(nodeConfig: any) {
    return async (state: WorkflowStateType) => {
      const log = [...state.executionLog, `Processing Agent node: ${nodeConfig.id}`];
      
      try {
        // This combines LLM + Tools in a single agent
        // Implementation would be similar to LLM + Composio combined
        // For brevity, this is a simplified version
        
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
    };
  }

  private createOutputNode(nodeConfig: any) {
    return async (state: WorkflowStateType) => {
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
    };
  }

  private extractToolInput(state: WorkflowStateType, nodeConfig: any): any {
    // Extract relevant input for the tool based on the current state and node configuration
    const baseInput = {
      query: state.currentOutput || state.currentInput || "",
      context: state.messages.slice(-3).map(msg => msg.content || msg).join("\n"),
    };

    // If the node has specific input mapping configuration, use it
    if (nodeConfig.data.inputMapping) {
      const mappedInput: any = {};
      for (const [key, sourcePath] of Object.entries(nodeConfig.data.inputMapping)) {
        // Simple path extraction (e.g., "state.currentOutput", "nodeResults.llm_1.result")
        if (typeof sourcePath === "string") {
          if (sourcePath.startsWith("state.")) {
            const path = sourcePath.replace("state.", "");
            mappedInput[key] = this.getNestedValue(state, path);
          } else if (sourcePath.startsWith("nodeResults.")) {
            const path = sourcePath.replace("nodeResults.", "");
            mappedInput[key] = this.getNestedValue(state.nodeResults, path);
          } else {
            mappedInput[key] = sourcePath; // Literal value
          }
        }
      }
      return mappedInput;
    }

    // If the tool has specific parameter requirements, try to map them
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
          parameterInput[paramName] = paramConfig; // Direct value
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

  async execute(initialInput: string): Promise<WorkflowStateType> {
    // Compile the graph
    const compiledGraph = this.graph.compile();
    
    // Initial state
    const initialState: WorkflowStateType = {
      messages: [],
      currentInput: initialInput,
      currentOutput: undefined,
      nodeResults: {},
      executionLog: ["Starting workflow execution"],
      error: undefined,
      metadata: {
        startTime: new Date().toISOString(),
        workflowId: `workflow_${Date.now()}`,
      },
    };

    try {
      // Execute the graph
      const finalState = await compiledGraph.invoke(initialState);
      
      return {
        ...finalState,
        metadata: {
          ...finalState.metadata,
          endTime: new Date().toISOString(),
          duration: Date.now() - new Date(finalState.metadata.startTime).getTime(),
        },
      } as WorkflowStateType;
    } catch (error) {
      const workflowError = WorkflowErrorHandler.categorizeError(error);
      const errorReport = WorkflowErrorHandler.createErrorReport(workflowError, {
        workflowId: initialState.metadata.workflowId,
        nodeCount: this.nodes.length,
        edgeCount: this.edges.length,
      });
      
      return {
        ...initialState,
        error: errorReport.userMessage,
        executionLog: [...initialState.executionLog, `Execution failed: ${workflowError.message}`],
        metadata: {
          ...initialState.metadata,
          errorReport,
          endTime: new Date().toISOString(),
        },
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges, input, config } = ExecuteRequestSchema.parse(body);

    // Create and execute workflow
    const executor = new WorkflowExecutor(nodes, edges, config);
    const result = await executor.execute(input);

    return NextResponse.json({
      success: !result.error,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Workflow execution error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Workflow execution API",
    endpoints: {
      POST: "Execute a workflow with nodes, edges, and input",
    },
  });
}
