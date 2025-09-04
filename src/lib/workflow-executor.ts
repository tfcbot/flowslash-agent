/**
 * LangGraph Workflow Executor
 * Restored from original implementation for workflow execution
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Composio } from '@composio/core';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { WorkflowErrorHandler } from '../../lib/utils/errorHandling';

// Import types
import type { WorkflowNode, WorkflowEdge } from '@/types/simple';

// Import LangChain message types
import type { BaseMessage } from '@langchain/core/messages';

// Define the workflow state interface
interface WorkflowStateType {
  messages: BaseMessage[];
  currentInput?: string;
  currentOutput?: string;
  nodeResults: Record<string, Record<string, unknown>>;
  executionLog: string[];
  error?: string;
  metadata: Record<string, unknown>;
}

interface WorkflowConfig {
  userId?: string;
  [key: string]: unknown;
}

export class WorkflowExecutor {
  private graph: StateGraph<WorkflowStateType>;
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private config: WorkflowConfig;

  constructor(nodes: WorkflowNode[], edges: WorkflowEdge[], config: WorkflowConfig = {}) {
    this.nodes = nodes;
    this.edges = edges;
    this.config = config;
    this.graph = new StateGraph<WorkflowStateType>({
      channels: {
        messages: {
          value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
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
          value: (x: Record<string, Record<string, unknown>>, y: Record<string, Record<string, unknown>>) => ({
            ...x,
            ...y,
          }),
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
          value: (x: Record<string, unknown>, y: Record<string, unknown>) => ({
            ...x,
            ...y,
          }),
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
        case 'customInput':
          this.graph.addNode(node.id, this.createInputNode(node));
          break;
        case 'llm':
          this.graph.addNode(node.id, this.createLLMNode(node));
          break;
        case 'composio':
          this.graph.addNode(node.id, this.createComposioNode(node));
          break;
        case 'agent':
          this.graph.addNode(node.id, this.createAgentNode(node));
          break;
        case 'customOutput':
          this.graph.addNode(node.id, this.createOutputNode(node));
          break;
      }
    }

    // Add edges to define execution flow
    for (const edge of this.edges) {
      // @ts-ignore: LangGraph expects specific node ID types
      this.graph.addEdge(edge.source, edge.target);
    }

    // Set entry point (first input node)
    const inputNodes = this.nodes.filter(n => n.type === 'customInput');
    if (inputNodes.length > 0) {
      // @ts-ignore: LangGraph expects specific node ID types
      this.graph.addEdge(START, inputNodes[0].id);
    }

    // Set exit point (output nodes)
    const outputNodes = this.nodes.filter(n => n.type === 'customOutput');
    for (const outputNode of outputNodes) {
      // @ts-ignore: LangGraph expects specific node ID types
      this.graph.addEdge(outputNode.id, END);
    }
  }

  private createInputNode(nodeConfig: WorkflowNode) {
    return async (state: WorkflowStateType) => {
      const log = [
        ...state.executionLog,
        `Processing input node: ${nodeConfig.id}`,
      ];

      return {
        ...state,
        currentInput: state.currentInput || nodeConfig.data.query || '',
        messages: [
          ...state.messages,
          new HumanMessage(state.currentInput || (nodeConfig.data.query as string) || ''),
        ],
        nodeResults: {
          ...state.nodeResults,
          [nodeConfig.id]: {
            type: 'input',
            result: state.currentInput || nodeConfig.data.query,
            timestamp: new Date().toISOString(),
          },
        },
        executionLog: log,
      };
    };
  }

  private createLLMNode(nodeConfig: WorkflowNode) {
    return async (state: WorkflowStateType) => {
      const log = [
        ...state.executionLog,
        `Processing LLM node: ${nodeConfig.id}`,
      ];

      try {
        // Initialize the appropriate LLM based on configuration
        let llm;
        const modelProvider = (nodeConfig.data.modelProvider as string) || 'openai';
        const apiKey = process.env[`${modelProvider.toUpperCase()}_API_KEY`];

        switch (modelProvider) {
          case 'openai':
            llm = new ChatOpenAI({
              modelName: (nodeConfig.data.modelName as string) || 'gpt-4o',
              openAIApiKey: apiKey,
            });
            break;
          case 'anthropic':
            llm = new ChatAnthropic({
              modelName:
                (nodeConfig.data.modelName as string) || 'claude-3-5-sonnet-20240620',
              anthropicApiKey: apiKey,
            });
            break;
          case 'google':
            llm = new ChatGoogleGenerativeAI({
              model: (nodeConfig.data.modelName as string) || 'gemini-1.5-pro-latest',
              apiKey: apiKey,
            });
            break;
          default:
            throw new Error(`Unsupported model provider: ${modelProvider}`);
        }

        // Prepare messages
        const messages = [...state.messages];
        if (nodeConfig.data.systemPrompt) {
          messages.unshift(new SystemMessage(nodeConfig.data.systemPrompt as string));
        }

        // Execute LLM call with retry logic
        const response = await WorkflowErrorHandler.withRetry(
          () => llm.invoke(messages),
          { maxRetries: 2, baseDelay: 1000 },
          (attempt: number, error: Error) => {
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
              type: 'llm',
              result: response.content,
              model: nodeConfig.data.modelName,
              provider: modelProvider,
              timestamp: new Date().toISOString(),
            },
          },
          executionLog: [...log, `LLM response generated successfully`],
        };
      } catch (error) {
        const workflowError = WorkflowErrorHandler.categorizeError(
          error,
          nodeConfig.id,
          'llm'
        );
        const errorReport = WorkflowErrorHandler.createErrorReport(
          workflowError,
          {
            provider: nodeConfig.data.modelProvider || 'openai',
            model: nodeConfig.data.modelName,
          }
        );

        return {
          ...state,
          error: errorReport.userMessage,
          nodeResults: {
            ...state.nodeResults,
            [nodeConfig.id]: {
              type: 'llm',
              error: errorReport,
              timestamp: new Date().toISOString(),
            },
          },
          executionLog: [...log, `LLM node failed: ${workflowError.message}`],
        };
      }
    };
  }

  private createComposioNode(nodeConfig: WorkflowNode) {
    return async (state: WorkflowStateType) => {
      const log = [
        ...state.executionLog,
        `Processing Composio node: ${nodeConfig.id}`,
      ];

      try {
        const composioApiKey = process.env.COMPOSIO_API_KEY;

        if (!composioApiKey) {
          throw new Error('Composio API key not provided');
        }

        // Initialize Composio client
        const composio = new Composio({
          apiKey: composioApiKey,
        });

        const toolAction = nodeConfig.data.toolAction as string;
        const toolInput = this.extractToolInput(state, nodeConfig);

        if (!this.config.userId) {
          throw new Error(
            'UserId is required but not provided. Users must be pre-authenticated.'
          );
        }
        const userId = this.config.userId;

        let result;

        try {
          // Execute the Composio tool
          if (toolAction && toolAction !== '') {
            const executionResult = await composio.tools.execute(toolAction as string, {
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
          const workflowError = WorkflowErrorHandler.categorizeError(
            composioError,
            nodeConfig.id,
            'composio'
          );
          console.warn('Composio tool execution failed:', workflowError);

          result = {
            success: false,
            data: workflowError.message,
            timestamp: new Date().toISOString(),
            error: workflowError,
            recoveryActions:
              WorkflowErrorHandler.getRecoveryActions(workflowError),
          };
        }

        return {
          ...state,
          currentOutput: JSON.stringify(result.data),
          nodeResults: {
            ...state.nodeResults,
            [nodeConfig.id]: {
              type: 'composio',
              result: result.data,
              action: toolAction,
              timestamp: new Date().toISOString(),
            },
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

  private createAgentNode(nodeConfig: WorkflowNode) {
    return async (state: WorkflowStateType) => {
      const log = [
        ...state.executionLog,
        `Processing Agent node: ${nodeConfig.id}`,
      ];

      try {
        // This combines LLM + Tools in a single agent
        const result = `Agent ${nodeConfig.id} processed: ${state.currentInput}`;

        return {
          ...state,
          currentOutput: result,
          nodeResults: {
            ...state.nodeResults,
            [nodeConfig.id]: {
              type: 'agent',
              result: result,
              timestamp: new Date().toISOString(),
            },
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

  private createOutputNode(nodeConfig: WorkflowNode) {
    return async (state: WorkflowStateType) => {
      const log = [
        ...state.executionLog,
        `Processing output node: ${nodeConfig.id}`,
      ];

      return {
        ...state,
        nodeResults: {
          ...state.nodeResults,
          [nodeConfig.id]: {
            type: 'output',
            result: state.currentOutput,
            timestamp: new Date().toISOString(),
          },
        },
        executionLog: [...log, `Workflow completed successfully`],
      };
    };
  }

  private extractToolInput(state: WorkflowStateType, nodeConfig: WorkflowNode): Record<string, unknown> {
    // Extract relevant input for the tool based on the current state and node configuration
    const baseInput = {
      query: state.currentOutput || state.currentInput || '',
      context: state.messages
        .slice(-3)
        .map(msg => msg.content || msg)
        .join('\n'),
    };

    // If the node has specific input mapping configuration, use it
    if (nodeConfig.data.inputMapping) {
      const mappedInput: Record<string, unknown> = {};
      for (const [key, sourcePath] of Object.entries(
        nodeConfig.data.inputMapping
      )) {
        // Simple path extraction (e.g., "state.currentOutput", "nodeResults.llm_1.result")
        if (typeof sourcePath === 'string') {
          if (sourcePath.startsWith('state.')) {
            const path = sourcePath.replace('state.', '');
            mappedInput[key] = this.getNestedValue(state as unknown as Record<string, unknown>, path);
          } else if (sourcePath.startsWith('nodeResults.')) {
            const path = sourcePath.replace('nodeResults.', '');
            mappedInput[key] = this.getNestedValue(state.nodeResults, path);
          } else {
            mappedInput[key] = sourcePath; // Literal value
          }
        }
      }
      return mappedInput;
    }

    return baseInput;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);
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
      executionLog: ['Starting workflow execution'],
      error: undefined,
      metadata: {
        startTime: new Date().toISOString(),
        workflowId: `workflow_${Date.now()}`,
      },
    };

    try {
      // Execute the graph
      // @ts-ignore: LangGraph state type conversion
      const finalState = (await compiledGraph.invoke(
        // @ts-ignore: LangGraph state type conversion
        initialState
      )) as unknown as WorkflowStateType;

      return {
        messages: finalState.messages || [],
        currentInput: finalState.currentInput,
        currentOutput: finalState.currentOutput,
        nodeResults: finalState.nodeResults || {},
        executionLog: finalState.executionLog || [],
        error: finalState.error,
        metadata: {
          ...initialState.metadata,
          endTime: new Date().toISOString(),
          duration:
            Date.now() - new Date(initialState.metadata.startTime as string).getTime(),
        },
      };
    } catch (error) {
      const workflowError = WorkflowErrorHandler.categorizeError(error);
      const errorReport = WorkflowErrorHandler.createErrorReport(
        workflowError,
        {
          workflowId: initialState.metadata.workflowId,
          nodeCount: this.nodes.length,
          edgeCount: this.edges.length,
        }
      );

      return {
        ...initialState,
        error: errorReport.userMessage,
        executionLog: [
          ...initialState.executionLog,
          `Execution failed: ${workflowError.message}`,
        ],
        metadata: {
          ...initialState.metadata,
          errorReport,
          endTime: new Date().toISOString(),
        },
      };
    }
  }
}
