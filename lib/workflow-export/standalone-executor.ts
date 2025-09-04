import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Composio } from "@composio/core";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { WorkflowErrorHandler } from "@/lib/utils/errorHandling";

// Standalone workflow configuration types
export interface WorkflowConfig {
  apiKeys: {
    openai_api_key?: string;
    anthropic_api_key?: string;
    google_api_key?: string;
    composio_api_key?: string;
  };
  userId?: string;
  environment?: 'development' | 'production';
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    baseDelay: number;
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: 'input' | 'llm' | 'composio' | 'agent' | 'output';
  config: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface WorkflowResult {
  success: boolean;
  output?: any;
  error?: string;
  executionLog: string[];
  nodeResults: Record<string, any>;
  metadata: {
    workflowId: string;
    executionId: string;
    startTime: string;
    endTime?: string;
    duration?: number;
  };
}

interface WorkflowState {
  messages: any[];
  currentInput?: string;
  currentOutput?: string;
  nodeResults: Record<string, any>;
  executionLog: string[];
  error?: string;
  metadata: Record<string, any>;
}

/**
 * Standalone Workflow Executor
 * 
 * This class can execute LangGraph workflows completely independently
 * of the UI, making it perfect for:
 * - Server-side automation
 * - CLI tools
 * - Scheduled jobs
 * - API integrations
 * - Batch processing
 */
export class StandaloneWorkflowExecutor {
  private workflow: WorkflowDefinition;
  private config: WorkflowConfig;
  private graph: StateGraph<WorkflowState>;

  constructor(workflow: WorkflowDefinition, config: WorkflowConfig) {
    this.workflow = workflow;
    this.config = config;
    this.graph = this.buildGraph();
  }

  /**
   * Execute the workflow with the given input
   */
  async execute(input: string): Promise<WorkflowResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();

    const initialState: WorkflowState = {
      messages: [],
      currentInput: input,
      currentOutput: undefined,
      nodeResults: {},
      executionLog: [`Starting workflow execution: ${this.workflow.name}`],
      error: undefined,
      metadata: {
        workflowId: this.workflow.id,
        executionId,
        startTime,
        version: this.workflow.version,
      },
    };

    try {
      const compiledGraph = this.graph.compile();
      const finalState = await compiledGraph.invoke(initialState);
      
      const endTime = new Date().toISOString();
      const duration = Date.now() - new Date(startTime).getTime();

      return {
        success: !finalState.error,
        output: finalState.currentOutput,
        error: finalState.error,
        executionLog: finalState.executionLog,
        nodeResults: finalState.nodeResults,
        metadata: {
          workflowId: this.workflow.id,
          executionId,
          startTime,
          endTime,
          duration,
        },
      };
    } catch (error) {
      const workflowError = WorkflowErrorHandler.categorizeError(error);
      const endTime = new Date().toISOString();
      const duration = Date.now() - new Date(startTime).getTime();

      return {
        success: false,
        error: workflowError.message,
        executionLog: [...initialState.executionLog, `Execution failed: ${workflowError.message}`],
        nodeResults: {},
        metadata: {
          workflowId: this.workflow.id,
          executionId,
          startTime,
          endTime,
          duration,
        },
      };
    }
  }

  /**
   * Execute workflow with streaming updates
   */
  async *executeStream(input: string): AsyncGenerator<{
    type: 'log' | 'nodeStart' | 'nodeComplete' | 'error' | 'complete';
    data: any;
    timestamp: string;
  }> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();

    yield {
      type: 'log',
      data: `Starting workflow: ${this.workflow.name}`,
      timestamp: new Date().toISOString(),
    };

    try {
      // Build execution order
      const executionOrder = this.getExecutionOrder();
      
      let currentState: WorkflowState = {
        messages: [],
        currentInput: input,
        currentOutput: undefined,
        nodeResults: {},
        executionLog: [`Starting workflow execution: ${this.workflow.name}`],
        error: undefined,
        metadata: {
          workflowId: this.workflow.id,
          executionId,
          startTime,
          version: this.workflow.version,
        },
      };

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = this.workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        yield {
          type: 'nodeStart',
          data: { nodeId: node.id, nodeType: node.type },
          timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
          };

        } catch (error) {
          const errorMessage = `Node ${node.id} failed: ${error instanceof Error ? error.message : String(error)}`;
          currentState.error = errorMessage;
          
          yield {
            type: 'error',
            data: { nodeId: node.id, error: errorMessage },
            timestamp: new Date().toISOString(),
          };
          
          break;
        }
      }

      const endTime = new Date().toISOString();
      const duration = Date.now() - new Date(startTime).getTime();

      yield {
        type: 'complete',
        data: {
          success: !currentState.error,
          output: currentState.currentOutput,
          metadata: {
            workflowId: this.workflow.id,
            executionId,
            startTime,
            endTime,
            duration,
          },
        },
        timestamp: endTime,
      };

    } catch (error) {
      yield {
        type: 'error',
        data: { error: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}` },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private buildGraph(): StateGraph<WorkflowState> {
    const graph = new StateGraph<WorkflowState>({
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

    // Add nodes to the graph
    for (const node of this.workflow.nodes) {
      graph.addNode(node.id, this.createNodeFunction(node));
    }

    // Add edges
    for (const edge of this.workflow.edges) {
      graph.addEdge(edge.source as any, edge.target as any);
    }

    // Set entry and exit points
    const inputNodes = this.workflow.nodes.filter(n => n.type === "input");
    if (inputNodes.length > 0) {
      graph.addEdge(START, inputNodes[0].id as any);
    }

    const outputNodes = this.workflow.nodes.filter(n => n.type === "output");
    for (const outputNode of outputNodes) {
      graph.addEdge(outputNode.id as any, END);
    }

    return graph;
  }

  private createNodeFunction(node: WorkflowNode) {
    switch (node.type) {
      case "input":
        return this.createInputNode(node);
      case "llm":
        return this.createLLMNode(node);
      case "composio":
        return this.createComposioNode(node);
      case "agent":
        return this.createAgentNode(node);
      case "output":
        return this.createOutputNode(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private createInputNode(node: WorkflowNode) {
    return async (state: WorkflowState) => {
      const log = [...state.executionLog, `Processing input node: ${node.id}`];
      
      return {
        ...state,
        currentInput: state.currentInput || node.config.defaultValue || "",
        messages: [
          ...state.messages,
          new HumanMessage(state.currentInput || node.config.defaultValue || "")
        ],
        nodeResults: {
          ...state.nodeResults,
          [node.id]: {
            type: "input",
            result: state.currentInput || node.config.defaultValue,
            timestamp: new Date().toISOString(),
          }
        },
        executionLog: log,
      };
    };
  }

  private createLLMNode(node: WorkflowNode) {
    return async (state: WorkflowState) => {
      const log = [...state.executionLog, `Processing LLM node: ${node.id}`];
      
      try {
        // Initialize LLM based on configuration
        const llm = this.createLLM(node.config);
        
        // Prepare messages
        const messages = [...state.messages];
        if (node.config.systemPrompt) {
          messages.unshift(new SystemMessage(node.config.systemPrompt));
        }

        // Execute with retry logic
        const response = await WorkflowErrorHandler.withRetry(
          () => llm.invoke(messages),
          this.config.retryConfig || { maxRetries: 2, baseDelay: 1000 }
        );
        
        return {
          ...state,
          messages: [...state.messages, response],
          currentOutput: response.content as string,
          nodeResults: {
            ...state.nodeResults,
            [node.id]: {
              type: "llm",
              result: response.content,
              model: node.config.modelName,
              provider: node.config.provider,
              timestamp: new Date().toISOString(),
            }
          },
          executionLog: [...log, `LLM response generated successfully`],
        };
      } catch (error) {
        const workflowError = WorkflowErrorHandler.categorizeError(error, node.id, "llm");
        return {
          ...state,
          error: workflowError.message,
          nodeResults: {
            ...state.nodeResults,
            [node.id]: {
              type: "llm",
              error: workflowError,
              timestamp: new Date().toISOString(),
            }
          },
          executionLog: [...log, `LLM node failed: ${workflowError.message}`],
        };
      }
    };
  }

  private createComposioNode(node: WorkflowNode) {
    return async (state: WorkflowState) => {
      const log = [...state.executionLog, `Processing Composio node: ${node.id}`];
      
      try {
        const composioApiKey = this.config.apiKeys.composio_api_key;
        if (!composioApiKey) {
          throw new Error("Composio API key not provided");
        }

        const composio = new Composio({ apiKey: composioApiKey });
        const toolAction = node.config.toolAction;
        const toolInput = this.extractToolInput(state, node);
        
        if (!this.config.userId) {
          throw new Error("UserId is required but not provided. Users must be pre-authenticated.");
        }

        let result;
        if (toolAction && toolAction !== "") {
          const executionResult = await composio.tools.execute(toolAction, {
            userId: this.config.userId,
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

        return {
          ...state,
          currentOutput: JSON.stringify(result.data),
          nodeResults: {
            ...state.nodeResults,
            [node.id]: {
              type: "composio",
              result: result.data,
              action: toolAction,
              timestamp: new Date().toISOString(),
            }
          },
          executionLog: [...log, `Composio tool executed successfully`],
        };
      } catch (error) {
        const workflowError = WorkflowErrorHandler.categorizeError(error, node.id, "composio");
        return {
          ...state,
          error: workflowError.message,
          nodeResults: {
            ...state.nodeResults,
            [node.id]: {
              type: "composio",
              error: workflowError,
              timestamp: new Date().toISOString(),
            }
          },
          executionLog: [...log, `Composio node failed: ${workflowError.message}`],
        };
      }
    };
  }

  private createAgentNode(node: WorkflowNode) {
    return async (state: WorkflowState) => {
      const log = [...state.executionLog, `Processing Agent node: ${node.id}`];
      
      try {
        // Simplified agent implementation - can be enhanced
        const result = `Agent ${node.id} processed: ${state.currentInput}`;
        
        return {
          ...state,
          currentOutput: result,
          nodeResults: {
            ...state.nodeResults,
            [node.id]: {
              type: "agent",
              result: result,
              timestamp: new Date().toISOString(),
            }
          },
          executionLog: [...log, `Agent executed successfully`],
        };
      } catch (error) {
        const workflowError = WorkflowErrorHandler.categorizeError(error, node.id, "agent");
        return {
          ...state,
          error: workflowError.message,
          executionLog: [...log, `Agent node failed: ${workflowError.message}`],
        };
      }
    };
  }

  private createOutputNode(node: WorkflowNode) {
    return async (state: WorkflowState) => {
      const log = [...state.executionLog, `Processing output node: ${node.id}`];
      
      return {
        ...state,
        nodeResults: {
          ...state.nodeResults,
          [node.id]: {
            type: "output",
            result: state.currentOutput,
            timestamp: new Date().toISOString(),
          }
        },
        executionLog: [...log, `Workflow completed successfully`],
      };
    };
  }

  private createLLM(config: any) {
    const provider = config.provider || "openai";
    const apiKeyMap: Record<string, string | undefined> = {
      openai: this.config.apiKeys.openai_api_key,
      anthropic: this.config.apiKeys.anthropic_api_key,
      google: this.config.apiKeys.google_api_key,
    };
    
    const apiKey = apiKeyMap[provider];

    if (!apiKey) {
      throw new Error(`API key not provided for ${provider}`);
    }

    switch (provider) {
      case "openai":
        return new ChatOpenAI({
          modelName: config.modelName || "gpt-4",
          openAIApiKey: apiKey,
        });
      case "anthropic":
        return new ChatAnthropic({
          modelName: config.modelName || "claude-3-sonnet-20240229",
          anthropicApiKey: apiKey,
        });
      case "google":
        return new ChatGoogleGenerativeAI({
          model: config.modelName || "gemini-1.5-pro-latest",
          apiKey: apiKey,
        });
      default:
        throw new Error(`Unsupported model provider: ${provider}`);
    }
  }

  private extractToolInput(state: WorkflowState, node: WorkflowNode): any {
    const baseInput = {
      query: state.currentOutput || state.currentInput || "",
      context: state.messages.slice(-3).map(msg => msg.content || msg).join("\n"),
    };

    // Apply input mapping if configured
    if (node.config.inputMapping) {
      const mappedInput: any = {};
      for (const [key, sourcePath] of Object.entries(node.config.inputMapping)) {
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

    return baseInput;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private getExecutionOrder(): string[] {
    // Simple topological sort
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const dependencies = this.workflow.edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);
      
      for (const dep of dependencies) {
        visit(dep);
      }
      
      order.push(nodeId);
    };

    const inputNodes = this.workflow.nodes.filter(n => n.type === "input");
    for (const inputNode of inputNodes) {
      visit(inputNode.id);
    }

    for (const node of this.workflow.nodes) {
      visit(node.id);
    }

    return order;
  }

  private async executeNode(node: WorkflowNode, state: WorkflowState): Promise<WorkflowState> {
    const nodeFunction = this.createNodeFunction(node);
    return await nodeFunction(state);
  }
}

/**
 * Factory function to create a standalone workflow executor
 */
export function createWorkflowExecutor(
  workflow: WorkflowDefinition, 
  config: WorkflowConfig
): StandaloneWorkflowExecutor {
  return new StandaloneWorkflowExecutor(workflow, config);
}

/**
 * Simple function to execute a workflow (most basic usage)
 */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  input: string,
  config: WorkflowConfig
): Promise<WorkflowResult> {
  const executor = new StandaloneWorkflowExecutor(workflow, config);
  return await executor.execute(input);
}
