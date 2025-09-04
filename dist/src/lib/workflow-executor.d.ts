/**
 * LangGraph Workflow Executor
 * Restored from original implementation for workflow execution
 */
import type { WorkflowNode, WorkflowEdge } from '@/types/simple';
import type { BaseMessage } from '@langchain/core/messages';
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
export declare class WorkflowExecutor {
    private graph;
    private nodes;
    private edges;
    private config;
    constructor(nodes: WorkflowNode[], edges: WorkflowEdge[], config?: WorkflowConfig);
    private buildGraph;
    private createInputNode;
    private createLLMNode;
    private createComposioNode;
    private createAgentNode;
    private createOutputNode;
    private extractToolInput;
    private getNestedValue;
    execute(initialInput: string): Promise<WorkflowStateType>;
}
export {};
//# sourceMappingURL=workflow-executor.d.ts.map