/**
 * LangGraph Workflow Executor
 * Restored from original implementation for workflow execution
 */
interface WorkflowStateType {
    messages: any[];
    currentInput?: string;
    currentOutput?: string;
    nodeResults: Record<string, any>;
    executionLog: string[];
    error?: string;
    metadata: Record<string, any>;
}
export declare class WorkflowExecutor {
    private graph;
    private nodes;
    private edges;
    private config;
    constructor(nodes: any[], edges: any[], config?: any);
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