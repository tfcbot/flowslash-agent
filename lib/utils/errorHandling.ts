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

export class WorkflowErrorHandler {
  private static defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  static categorizeError(error: any, nodeId?: string, nodeType?: string): WorkflowError {
    const timestamp = new Date().toISOString();
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        nodeId,
        nodeType,
        recoverable: true,
        retryable: true,
        details: error,
        timestamp,
      };
    }

    // HTTP errors
    if (error.status) {
      if (error.status === 401 || error.status === 403) {
        return {
          type: 'auth',
          message: 'Authentication failed. Please check your API keys.',
          nodeId,
          nodeType,
          recoverable: true,
          retryable: false,
          details: error,
          timestamp,
        };
      }
      
      if (error.status === 429) {
        return {
          type: 'execution',
          message: 'Rate limit exceeded. Please wait before retrying.',
          nodeId,
          nodeType,
          recoverable: true,
          retryable: true,
          details: error,
          timestamp,
        };
      }

      if (error.status >= 500) {
        return {
          type: 'execution',
          message: 'Server error occurred. This may be temporary.',
          nodeId,
          nodeType,
          recoverable: true,
          retryable: true,
          details: error,
          timestamp,
        };
      }
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Operation timed out. The request took too long to complete.',
        nodeId,
        nodeType,
        recoverable: true,
        retryable: true,
        details: error,
        timestamp,
      };
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return {
        type: 'validation',
        message: 'Invalid input or configuration. Please check your settings.',
        nodeId,
        nodeType,
        recoverable: true,
        retryable: false,
        details: error,
        timestamp,
      };
    }

    // API key errors
    if (error.message.includes('API key') || error.message.includes('unauthorized')) {
      return {
        type: 'auth',
        message: 'API key is missing or invalid. Please check your configuration.',
        nodeId,
        nodeType,
        recoverable: true,
        retryable: false,
        details: error,
        timestamp,
      };
    }

    // Default unknown error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      nodeId,
      nodeType,
      recoverable: false,
      retryable: false,
      details: error,
      timestamp,
    };
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    onRetry?: (attempt: number, error: any) => void
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === retryConfig.maxRetries) {
          break;
        }

        // Check if error is retryable
        const workflowError = this.categorizeError(error);
        if (!workflowError.retryable) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
          retryConfig.maxDelay
        );

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static getRecoveryActions(error: WorkflowError): string[] {
    const actions: string[] = [];

    switch (error.type) {
      case 'network':
        actions.push('Check your internet connection');
        actions.push('Try again in a few moments');
        actions.push('Check if the service is experiencing downtime');
        break;
        
      case 'auth':
        actions.push('Verify your API keys are correct');
        actions.push('Check if your API keys have the required permissions');
        actions.push('Ensure your API keys haven\'t expired');
        break;
        
      case 'validation':
        actions.push('Review your input data and node configurations');
        actions.push('Check that all required fields are filled');
        actions.push('Verify data formats match expected schemas');
        break;
        
      case 'timeout':
        actions.push('Try reducing the complexity of your workflow');
        actions.push('Check if external services are responding slowly');
        actions.push('Consider breaking large workflows into smaller parts');
        break;
        
      case 'execution':
        actions.push('Check the service status page');
        actions.push('Try again after a short delay');
        actions.push('Reduce the load on your requests');
        break;
        
      default:
        actions.push('Review the error details for more information');
        actions.push('Try simplifying your workflow to isolate the issue');
        actions.push('Contact support if the problem persists');
    }

    return actions;
  }

  static formatErrorForUser(error: WorkflowError): string {
    let message = error.message;
    
    if (error.nodeId) {
      message = `Node "${error.nodeId}" (${error.nodeType}): ${message}`;
    }

    if (error.recoverable) {
      message += '\n\nThis error may be recoverable. Try the suggested actions below.';
    }

    return message;
  }

  static createErrorReport(error: WorkflowError, context?: any): any {
    return {
      error: {
        type: error.type,
        message: error.message,
        nodeId: error.nodeId,
        nodeType: error.nodeType,
        recoverable: error.recoverable,
        retryable: error.retryable,
        timestamp: error.timestamp,
      },
      context: context || {},
      recoveryActions: this.getRecoveryActions(error),
      userMessage: this.formatErrorForUser(error),
    };
  }
}
