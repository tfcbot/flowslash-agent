// Load environment variables with priority order:
// 1. .env.local (highest priority - local development)
// 2. .env.development (if NODE_ENV=development)  
// 3. .env (general environment file)
// 4. process.env (system environment variables)
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load in priority order - later files don't override existing variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env.development') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Hono } from 'hono';
import { Composio } from '@composio/core';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import * as fs from 'fs';

// Import simplified types
import { createSuccessResponse, createErrorResponse } from '@/types/simple';

// Import middleware
import { authCors } from '@/middleware/auth';

// Import route handlers  
import { executeRoutes } from './routes/execute';
import { sdkRoutes } from './routes/sdk';

// Import OpenAPI specification
import { openApiSpec } from '../openapi-spec';

// Initialize Composio
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
});

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', authCors());

// Health check endpoint
app.get('/', (c) => {
  const healthData = {
    name: 'FlowSlash Agent Microservice',
    version: '1.0.0',
    status: 'healthy' as const,
    endpoints: {
      execute: '/execute',
      documentation: '/docs',
      sdk: '/api/sdk',
      llms: '/llms.txt'
    },
  };
  return c.json(createSuccessResponse(healthData));
});

// API Documentation
app.get('/docs/*', swaggerUI({ 
  url: '/api/openapi.json'
}));

app.get('/api/openapi.json', (c) => {
  return c.json(openApiSpec);
});

// Serve llms.txt file
app.get('/llms.txt', async (c) => {
  try {
    const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
    const content = fs.readFileSync(llmsPath, 'utf-8');
    return c.text(content, 200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline; filename="llms.txt"'
    });
  } catch (error) {
    return c.text('LLMs.txt file not found. Run "npm run export:llms" to generate it.', 404);
  }
});

// Main execution endpoint - stateless microservice
app.route('/', executeRoutes(composio)); // Main execution endpoint: /execute
app.route('/api/sdk', sdkRoutes());

// Global error handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/execute', '/docs', '/api/sdk', '/llms.txt'],
    timestamp: new Date().toISOString(),
  }, 404);
});

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log('🚀 Starting FlowSlash Agent Microservice...');
console.log(`⚡ Execute Endpoint: http://localhost:${port}/execute`);
console.log(`📖 API Documentation: http://localhost:${port}/docs`);
console.log(`📋 SDK Download: http://localhost:${port}/api/sdk/download`);
console.log(`📄 LLMs.txt: http://localhost:${port}/llms.txt`);

serve({
  fetch: app.fetch,
  port: port,
});

export default app;
