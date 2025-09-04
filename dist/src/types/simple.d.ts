/**
 * Simplified TypeScript-native types
 * Clean, working type definitions without over-engineering
 */
import { z } from 'zod';
export declare enum Provider {
    GMAIL = "GMAIL",
    SLACK = "SLACK",
    GITHUB = "GITHUB",
    NOTION = "NOTION",
    TRELLO = "TRELLO",
    DISCORD = "DISCORD",
    TELEGRAM = "TELEGRAM",
    TWITTER = "TWITTER",
    LINKEDIN = "LINKEDIN",
    DROPBOX = "DROPBOX",
    GOOGLE_DRIVE = "GOOGLE_DRIVE"
}
export declare enum ConnectionStatus {
    PENDING = "pending",
    ACTIVE = "active",
    EXPIRED = "expired",
    FAILED = "failed",
    INACTIVE = "inactive"
}
export declare enum ExecutionStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: string;
    message?: string;
    timestamp: string;
}
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
export interface WorkflowNode {
    id: string;
    type: 'customInput' | 'llm' | 'composio' | 'agent' | 'customOutput';
    data: Record<string, unknown>;
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}
export interface WorkflowDefinition {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    config?: Record<string, unknown>;
}
export interface ExecutionResult {
    status: 'completed' | 'failed';
    result?: Record<string, unknown>;
    error?: string;
    duration: number;
    nodeResults?: Record<string, unknown>;
    executionLog?: string[];
    timestamp: string;
}
export declare const ExecuteRequestSchema: z.ZodObject<{
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    input: Record<string, unknown>;
    userId?: string | undefined;
}, {
    input: Record<string, unknown>;
    userId?: string | undefined;
}>;
export interface ToolMetadata {
    name: string;
    description: string;
    toolkit: Provider;
    parameters: Record<string, unknown>;
    requiresAuth: boolean;
    isConnected: boolean;
    tags: string[];
    examples?: Record<string, unknown>[];
}
export interface ComposioTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
    toolkit?: string;
    integration?: string;
    tags?: string[];
    examples?: Record<string, unknown>[];
    requiresAuth?: boolean;
}
export type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>;
export declare const createSuccessResponse: <T>(data: T, message?: string) => ApiSuccessResponse<T> & {
    message?: string;
};
export declare const createErrorResponse: (error: string, message?: string) => ApiErrorResponse & {
    message?: string;
};
export declare const extractToolkitFromTool: (tool: ComposioTool) => Provider;
export declare const isApiSuccessResponse: <T>(response: ApiResponse<T>) => response is ApiSuccessResponse<T>;
export declare const isApiErrorResponse: <T>(response: ApiResponse<T>) => response is ApiErrorResponse;
//# sourceMappingURL=simple.d.ts.map