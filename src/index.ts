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
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import * as fs from 'fs';

// Import simplified types
import { createSuccessResponse } from '@/types/simple';

// Import middleware (authCors removed - using Hono CORS instead)

// Import route handlers
import { executeRoutes } from './routes/execute';

// Import OpenAPI specification
import { openApiSpec } from '../openapi-spec';

// Composio API key validation - initialized per-workflow execution
if (!process.env.COMPOSIO_API_KEY) {
  console.warn('⚠️ COMPOSIO_API_KEY not set - Composio tools will not work');
}

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', cors({
  origin: (origin) => {
    console.log(`🌐 CORS request from origin: ${origin || 'no-origin'}`);
    
    // Allow no origin (same-origin requests)
    if (!origin) {
      console.log('✅ CORS: Allowing same-origin request');
      return '*';
    }
    
    // Allow all localhost variations (localhost, 127.0.0.1, any port)
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      console.log('✅ CORS: Allowing localhost');
      return origin;
    }
    
    // Allow all freestyle.sh subdomains (HTTP and HTTPS)
    if (origin.endsWith('.freestyle.sh')) {
      console.log('✅ CORS: Allowing freestyle.sh domain');
      return origin;
    }
    
    // Allow all flowslash.com subdomains (HTTP and HTTPS)
    if (origin.endsWith('.flowslash.com')) {
      console.log('✅ CORS: Allowing flowslash.com domain');
      return origin;
    }
    
    // Allow any freestyle.sh or flowslash.com domain patterns
    if (/^https?:\/\/.*\.freestyle\.sh$/.test(origin) || /^https?:\/\/.*\.flowslash\.com$/.test(origin)) {
      console.log('✅ CORS: Allowing domain pattern match');
      return origin;
    }
    
    console.log('❌ CORS: Rejecting origin');
    return null;
  },
  credentials: true,
}));
app.use('*', logger());

// Root endpoint - API Documentation
app.get('/', swaggerUI({
  url: '/api/openapi.json',
}));

// Also serve docs at /docs/* for compatibility
app.get('/docs/*', swaggerUI({
  url: '/api/openapi.json',
}));

// Health check endpoint
app.get('/health', c => {
  const healthData = {
    name: 'FlowSlash Agent Microservice',
    version: '1.0.0',
    status: 'healthy' as const,
    endpoints: {
      documentation: '/',
      execute: '/execute',
      health: '/health',
      llms: '/llms.txt',
    },
  };
  return c.json(createSuccessResponse(healthData));
});

app.get('/api/openapi.json', c => {
  return c.json(openApiSpec);
});

// Serve llms.txt file
app.get('/llms.txt', async c => {
  try {
    const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
    const content = fs.readFileSync(llmsPath, 'utf-8');
    return c.text(content, 200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline; filename="llms.txt"',
    });
  } catch {
    return c.text(
      'LLMs.txt file not found. Run "npm run export:llms" to generate it.',
      404
    );
  }
});

// Main execution endpoint - stateless microservice
app.route('/', executeRoutes()); // Main execution endpoint: /execute

// Global error handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
      timestamp: new Date().toISOString(),
    },
    500
  );
});

// 404 handler
app.notFound(c => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      availableEndpoints: ['/', '/execute', '/health', '/llms.txt'],
      timestamp: new Date().toISOString(),
    },
    404
  );
});

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log('🚀 Starting FlowSlash Agent Microservice...');
console.log(`📖 API Documentation: http://localhost:${port}/`);
console.log(`⚡ Execute Endpoint: http://localhost:${port}/execute`);
console.log(`💚 Health Check: http://localhost:${port}/health`);
console.log(`📄 LLMs.txt: http://localhost:${port}/llms.txt`);
console.log(`🌐 CORS: Configured for localhost, *.freestyle.sh, and *.flowslash.com domains`);

serve({
  fetch: app.fetch,
  port: port,
});

export default app;
