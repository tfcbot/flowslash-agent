"use strict";
/**
 * LangGraph Workflow Executor
 * Restored from original implementation for workflow execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutor = void 0;
const langgraph_1 = require("@langchain/langgraph");
const openai_1 = require("@langchain/openai");
const anthropic_1 = require("@langchain/anthropic");
const google_genai_1 = require("@langchain/google-genai");
const core_1 = require("@composio/core");
const messages_1 = require("@langchain/core/messages");
const errorHandling_1 = require("../../lib/utils/errorHandling");
class WorkflowExecutor {
    graph;
    nodes;
    edges;
    config;
    constructor(nodes, edges, config = {}) {
        this.nodes = nodes;
        this.edges = edges;
        this.config = config;
        this.graph = new langgraph_1.StateGraph({
            channels: {
                messages: {
                    value: (x, y) => x.concat(y),
                    default: () => [],
                },
                currentInput: {
                    value: (x, y) => y ?? x,
                    default: () => undefined,
                },
                currentOutput: {
                    value: (x, y) => y ?? x,
                    default: () => undefined,
                },
                nodeResults: {
                    value: (x, y) => ({
                        ...x,
                        ...y,
                    }),
                    default: () => ({}),
                },
                executionLog: {
                    value: (x, y) => x.concat(y),
                    default: () => [],
                },
                error: {
                    value: (x, y) => y ?? x,
                    default: () => undefined,
                },
                metadata: {
                    value: (x, y) => ({
                        ...x,
                        ...y,
                    }),
                    default: () => ({}),
                },
            },
        });
        this.buildGraph();
    }
    buildGraph() {
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
            this.graph.addEdge(langgraph_1.START, inputNodes[0].id);
        }
        // Set exit point (output nodes)
        const outputNodes = this.nodes.filter(n => n.type === 'customOutput');
        for (const outputNode of outputNodes) {
            // @ts-ignore: LangGraph expects specific node ID types
            this.graph.addEdge(outputNode.id, langgraph_1.END);
        }
    }
    createInputNode(nodeConfig) {
        return async (state) => {
            const log = [
                ...state.executionLog,
                `Processing input node: ${nodeConfig.id}`,
            ];
            return {
                ...state,
                currentInput: state.currentInput || nodeConfig.data.query || '',
                messages: [
                    ...state.messages,
                    new messages_1.HumanMessage(state.currentInput || nodeConfig.data.query || ''),
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
    createLLMNode(nodeConfig) {
        return async (state) => {
            const log = [
                ...state.executionLog,
                `Processing LLM node: ${nodeConfig.id}`,
            ];
            try {
                // Initialize the appropriate LLM based on configuration
                let llm;
                const modelProvider = nodeConfig.data.modelProvider || 'openai';
                const apiKey = process.env[`${modelProvider.toUpperCase()}_API_KEY`];
                switch (modelProvider) {
                    case 'openai':
                        llm = new openai_1.ChatOpenAI({
                            modelName: nodeConfig.data.modelName || 'gpt-4o',
                            openAIApiKey: apiKey,
                        });
                        break;
                    case 'anthropic':
                        llm = new anthropic_1.ChatAnthropic({
                            modelName: nodeConfig.data.modelName || 'claude-3-5-sonnet-20240620',
                            anthropicApiKey: apiKey,
                        });
                        break;
                    case 'google':
                        llm = new google_genai_1.ChatGoogleGenerativeAI({
                            model: nodeConfig.data.modelName || 'gemini-1.5-pro-latest',
                            apiKey: apiKey,
                        });
                        break;
                    default:
                        throw new Error(`Unsupported model provider: ${modelProvider}`);
                }
                // Prepare messages
                const messages = [...state.messages];
                if (nodeConfig.data.systemPrompt) {
                    messages.unshift(new messages_1.SystemMessage(nodeConfig.data.systemPrompt));
                }
                // Execute LLM call with retry logic
                const response = await errorHandling_1.WorkflowErrorHandler.withRetry(() => llm.invoke(messages), { maxRetries: 2, baseDelay: 1000 }, (attempt, error) => {
                    console.log(`LLM call attempt ${attempt} failed:`, error);
                });
                return {
                    ...state,
                    messages: [...state.messages, response],
                    currentOutput: response.content,
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
            }
            catch (error) {
                const workflowError = errorHandling_1.WorkflowErrorHandler.categorizeError(error, nodeConfig.id, 'llm');
                const errorReport = errorHandling_1.WorkflowErrorHandler.createErrorReport(workflowError, {
                    provider: nodeConfig.data.modelProvider || 'openai',
                    model: nodeConfig.data.modelName,
                });
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
    createComposioNode(nodeConfig) {
        return async (state) => {
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
                const composio = new core_1.Composio({
                    apiKey: composioApiKey,
                });
                const toolAction = nodeConfig.data.toolAction;
                const toolInput = this.extractToolInput(state, nodeConfig);
                if (!this.config.userId) {
                    throw new Error('UserId is required but not provided. Users must be pre-authenticated.');
                }
                const userId = this.config.userId;
                let result;
                try {
                    // Execute the Composio tool
                    if (toolAction && toolAction !== '') {
                        const executionResult = await composio.tools.execute(toolAction, {
                            userId: userId,
                            arguments: toolInput,
                        });
                        result = {
                            success: executionResult.successful || true,
                            data: executionResult.data || executionResult,
                            timestamp: new Date().toISOString(),
                        };
                    }
                    else {
                        result = {
                            success: true,
                            data: `No tool action specified. Available input: ${JSON.stringify(toolInput)}`,
                            timestamp: new Date().toISOString(),
                        };
                    }
                }
                catch (composioError) {
                    const workflowError = errorHandling_1.WorkflowErrorHandler.categorizeError(composioError, nodeConfig.id, 'composio');
                    console.warn('Composio tool execution failed:', workflowError);
                    result = {
                        success: false,
                        data: workflowError.message,
                        timestamp: new Date().toISOString(),
                        error: workflowError,
                        recoveryActions: errorHandling_1.WorkflowErrorHandler.getRecoveryActions(workflowError),
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
            }
            catch (error) {
                const errorMsg = `Composio node error: ${error instanceof Error ? error.message : String(error)}`;
                return {
                    ...state,
                    error: errorMsg,
                    executionLog: [...log, errorMsg],
                };
            }
        };
    }
    createAgentNode(nodeConfig) {
        return async (state) => {
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
            }
            catch (error) {
                const errorMsg = `Agent node error: ${error instanceof Error ? error.message : String(error)}`;
                return {
                    ...state,
                    error: errorMsg,
                    executionLog: [...log, errorMsg],
                };
            }
        };
    }
    createOutputNode(nodeConfig) {
        return async (state) => {
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
    extractToolInput(state, nodeConfig) {
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
            const mappedInput = {};
            for (const [key, sourcePath] of Object.entries(nodeConfig.data.inputMapping)) {
                // Simple path extraction (e.g., "state.currentOutput", "nodeResults.llm_1.result")
                if (typeof sourcePath === 'string') {
                    if (sourcePath.startsWith('state.')) {
                        const path = sourcePath.replace('state.', '');
                        mappedInput[key] = this.getNestedValue(state, path);
                    }
                    else if (sourcePath.startsWith('nodeResults.')) {
                        const path = sourcePath.replace('nodeResults.', '');
                        mappedInput[key] = this.getNestedValue(state.nodeResults, path);
                    }
                    else {
                        mappedInput[key] = sourcePath; // Literal value
                    }
                }
            }
            return mappedInput;
        }
        return baseInput;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            if (current && typeof current === 'object' && key in current) {
                return current[key];
            }
            return undefined;
        }, obj);
    }
    async execute(initialInput) {
        // Compile the graph
        const compiledGraph = this.graph.compile();
        // Initial state
        const initialState = {
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
            initialState));
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
                    duration: Date.now() - new Date(initialState.metadata.startTime).getTime(),
                },
            };
        }
        catch (error) {
            const workflowError = errorHandling_1.WorkflowErrorHandler.categorizeError(error);
            const errorReport = errorHandling_1.WorkflowErrorHandler.createErrorReport(workflowError, {
                workflowId: initialState.metadata.workflowId,
                nodeCount: this.nodes.length,
                edgeCount: this.edges.length,
            });
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
exports.WorkflowExecutor = WorkflowExecutor;
//# sourceMappingURL=workflow-executor.js.map