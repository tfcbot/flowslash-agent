/**
 * Test Helper Utilities for Composio UserId Integration Tests
 */

export interface TestUser {
  id: string;
  description: string;
  expectedBehavior: string;
}

export const TEST_USERS: TestUser[] = [
  {
    id: 'test_user_basic',
    description: 'Basic operations user',
    expectedBehavior: 'Should handle simple tool executions'
  },
  {
    id: 'test_user_langgraph',
    description: 'LangGraph integration user',
    expectedBehavior: 'Should work with LangGraph workflows'
  },
  {
    id: 'test_user_advanced',
    description: 'Advanced scenarios user', 
    expectedBehavior: 'Should handle complex workflows and error scenarios'
  }
];

export interface ToolTestCase {
  name: string;
  action: string;
  arguments: Record<string, any>;
  expectedSuccess: boolean;
  description: string;
}

export const COMMON_TOOL_TESTS: ToolTestCase[] = [
  {
    name: 'HackerNews User Lookup',
    action: 'HACKERNEWS_GET_USER',
    arguments: { username: 'pg' },
    expectedSuccess: true,
    description: 'Get Paul Graham profile from HackerNews'
  },
  {
    name: 'HackerNews Invalid User',
    action: 'HACKERNEWS_GET_USER', 
    arguments: { username: 'thisuserdoesnotexist12345' },
    expectedSuccess: false,
    description: 'Test handling of non-existent user'
  },
  {
    name: 'GitHub User Lookup',
    action: 'GITHUB_GET_USER',
    arguments: { username: 'octocat' },
    expectedSuccess: true,
    description: 'Get GitHub Octocat profile'
  }
];

/**
 * Utility function to create test report
 */
export function createTestReport(
  testName: string,
  userId: string,
  results: Array<{ success: boolean; duration: number; error?: Error }>
) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  return {
    testName,
    userId,
    totalTests: results.length,
    successful,
    failed,
    successRate: (successful / results.length) * 100,
    averageDuration: totalDuration / results.length,
    totalDuration
  };
}

/**
 * Wait utility with logging
 */
export async function waitWithLogging(ms: number, message?: string) {
  if (message) {
    console.log(`⏳ ${message} (waiting ${ms}ms)`);
  }
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility for flaky operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      console.log(`⚠️  Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await waitWithLogging(delayMs);
    }
  }
  
  throw lastError;
}

/**
 * Validate environment setup
 */
export function validateEnvironment(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!process.env.COMPOSIO_API_KEY) {
    issues.push('COMPOSIO_API_KEY environment variable is required');
  }
  
  // Check if API key has valid format (basic validation)
  if (process.env.COMPOSIO_API_KEY && process.env.COMPOSIO_API_KEY.length < 10) {
    issues.push('COMPOSIO_API_KEY appears to be too short');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Generate unique test user ID
 */
export function generateTestUserId(prefix: string = 'test_user'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Log test progress with consistent formatting
 */
export function logTestProgress(stage: string, message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const emoji = {
    info: '📋',
    warn: '⚠️ ',
    error: '❌'
  };
  
  console.log(`${emoji[level]} [${stage}] ${message}`);
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Safe JSON stringify for logging
 */
export function safeStringify(obj: any, maxLength: number = 200): string {
  try {
    const str = JSON.stringify(obj, null, 2);
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  } catch (error) {
    return '[Unable to stringify object]';
  }
}

