export interface WorkflowError {
    type: 'network' | 'validation' | 'execution' | 'timeout' | 'auth' | 'unknown';
    message: string;
    nodeId?: string;
    nodeType?: string;
    recoverable: boolean;
    retryable: boolean;
    details?: any;
    timestamp: string;
}
export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}
export declare class WorkflowErrorHandler {
    private static defaultRetryConfig;
    static categorizeError(error: any, nodeId?: string, nodeType?: string): WorkflowError;
    static withRetry<T>(operation: () => Promise<T>, config?: Partial<RetryConfig>, onRetry?: (attempt: number, error: any) => void): Promise<T>;
    static getRecoveryActions(error: WorkflowError): string[];
    static formatErrorForUser(error: WorkflowError): string;
    static createErrorReport(error: WorkflowError, context?: any): any;
}
//# sourceMappingURL=errorHandling.d.ts.map