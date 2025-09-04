/**
 * Simplified TypeScript-native types
 * Clean, working type definitions without over-engineering
 */

import { z } from 'zod';

// =============================================================================
// CORE TYPES
// =============================================================================

export enum Provider {
  GMAIL = 'GMAIL',
  SLACK = 'SLACK',
  GITHUB = 'GITHUB',
  NOTION = 'NOTION',
  TRELLO = 'TRELLO',
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  DROPBOX = 'DROPBOX',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
}

export enum ConnectionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed',
  INACTIVE = 'inactive',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

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

// =============================================================================
// WORKFLOW TYPES (No Database - Stateless)
// =============================================================================

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

// =============================================================================
// API REQUEST/RESPONSE SCHEMAS
// =============================================================================

// Execute workflow request - stateless microservice
export const ExecuteRequestSchema = z.object({
  input: z.record(z.unknown()),
  userId: z.string().optional(), // Optional - extracted from bearer token if not provided
});

// =============================================================================
// TOOL TYPES
// =============================================================================

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

// =============================================================================
// TYPE INFERENCE
// =============================================================================

export type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> & { message?: string } => {
  const response: ApiSuccessResponse<T> & { message?: string } = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  if (message) {
    response.message = message;
  }
  return response;
};

export const createErrorResponse = (
  error: string,
  message?: string
): ApiErrorResponse & { message?: string } => {
  const response: ApiErrorResponse & { message?: string } = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
  if (message) {
    response.message = message;
  }
  return response;
};

export const extractToolkitFromTool = (tool: ComposioTool): Provider => {
  const toolkitName = tool.function.name.split('_')[0];
  if (toolkitName && toolkitName in Provider) {
    return Provider[toolkitName as keyof typeof Provider];
  }
  return Provider.GITHUB; // Fallback
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

export const isApiSuccessResponse = <T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> => response.success === true;

export const isApiErrorResponse = <T>(
  response: ApiResponse<T>
): response is ApiErrorResponse => response.success === false;
