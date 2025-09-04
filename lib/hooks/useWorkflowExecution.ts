import { useState, useCallback } from "react";
import { Node, Edge } from "reactflow";

export interface ExecutionConfig {
  apiKeys?: Record<string, string>;
  userId?: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: {
    messages: any[];
    currentInput?: string;
    currentOutput?: string;
    nodeResults: Record<string, any>;
    executionLog: string[];
    error?: string;
    metadata: Record<string, any>;
  };
  error?: string;
  timestamp: string;
}

export interface StreamingEvent {
  type: 'log' | 'nodeStart' | 'nodeComplete' | 'error' | 'complete';
  data: any;
  timestamp: string;
}

export interface ExecutionState {
  isExecuting: boolean;
  result: ExecutionResult | null;
  error: string | null;
  streamingEvents: StreamingEvent[];
  currentNode: string | null;
}

export function useWorkflowExecution() {
  const [state, setState] = useState<ExecutionState>({
    isExecuting: false,
    result: null,
    error: null,
    streamingEvents: [],
    currentNode: null,
  });

  const executeWorkflow = useCallback(async (
    nodes: Node[],
    edges: Edge[],
    input: string,
    config?: ExecutionConfig
  ) => {
    setState(prev => ({ ...prev, isExecuting: true, error: null }));

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
          input,
          config,
        }),
      });

      const result: ExecutionResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Execution failed");
      }

      setState(prev => ({
        ...prev,
        isExecuting: false,
        result,
        error: null,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const executeWorkflowStreaming = useCallback(async (
    nodes: Node[],
    edges: Edge[],
    input: string,
    config?: ExecutionConfig,
    onEvent?: (event: StreamingEvent) => void
  ) => {
    setState(prev => ({ 
      ...prev, 
      isExecuting: true, 
      error: null, 
      streamingEvents: [],
      currentNode: null 
    }));

    try {
      const response = await fetch("/api/execute/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
          input,
          config,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              const event: StreamingEvent = eventData;
              
              setState(prev => ({
                ...prev,
                streamingEvents: [...prev.streamingEvents, event],
                currentNode: event.type === 'nodeStart' ? event.data.nodeId : 
                           event.type === 'nodeComplete' ? null : prev.currentNode,
              }));

              // Call the optional event handler
              if (onEvent) {
                onEvent(event);
              }

              // Handle completion
              if (event.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  isExecuting: false,
                  result: {
                    success: true,
                    data: event.data,
                    timestamp: event.timestamp,
                  },
                  currentNode: null,
                }));
                return;
              }

              // Handle errors
              if (event.type === 'error') {
                setState(prev => ({
                  ...prev,
                  isExecuting: false,
                  error: event.data.error || "Unknown streaming error",
                  currentNode: null,
                }));
                return;
              }
            } catch (parseError) {
              console.warn("Failed to parse streaming event:", parseError);
            }
          }
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: errorMessage,
        currentNode: null,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      result: null,
      error: null,
      streamingEvents: [],
      currentNode: null,
    });
  }, []);

  return {
    ...state,
    executeWorkflow,
    executeWorkflowStreaming,
    reset,
  };
}
