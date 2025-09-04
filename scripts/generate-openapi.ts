#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables with priority order
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import types for type safety (unused but kept for future type validation)

// OpenAPI 3.0 Specification with proper TypeScript typing
interface OpenAPISpec {
  readonly openapi: string;
  readonly info: {
    readonly title: string;
    readonly version: string;
    readonly description: string;
    readonly contact: {
      readonly name: string;
      readonly url: string;
    };
    readonly license: {
      readonly name: string;
    };
  };
  readonly servers: readonly {
    readonly url: string;
    readonly description: string;
  }[];
  readonly security?: readonly Record<string, string[]>[];
  readonly paths: Record<string, Record<string, unknown>>;
  readonly components: {
    readonly securitySchemes?: Record<string, Record<string, unknown>>;
    readonly schemas: Record<string, Record<string, unknown>>;
  };
}

const openApiSpec: OpenAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'FlowSlash Agent API',
    version: '1.0.0',
    description:
      'Stateless LangGraph microservice for AI-generated workflow execution with 15 curated tool integrations. Uses environment variables for API keys and bearer token authentication.',
    contact: {
      name: 'FlowSlash Agent API',
      url: 'http://localhost:3000/docs',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
    {
      url: 'https://api.flowslash-agent.com',
      description: 'Production server',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'API Health Check',
        description: 'Get API status and available endpoints',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                        status: { type: 'string' },
                        endpoints: { type: 'object' },
                      },
                    },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/execute': {
      post: {
        summary: 'Execute AI-Generated Workflow',
        description:
          'Execute the embedded LangGraph workflow with user input. UserId extracted from bearer token or optionally provided in request body.',
        tags: ['Workflow Execution'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  input: {
                    type: 'object',
                    additionalProperties: true,
                    description: 'Input data for the workflow',
                    example: {
                      message:
                        'Send email to john@example.com about project completion',
                    },
                  },
                  userId: {
                    type: 'string',
                    description:
                      'Optional user ID override - if not provided, extracted from bearer token',
                    example: 'user123',
                  },
                },
                required: ['input'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workflow executed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WorkflowExecutionResponse',
                },
              },
            },
          },
          '500': {
            description: 'Workflow execution failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/llms.txt': {
      get: {
        summary: 'Get LLMs.txt file',
        description:
          'Download endpoint list in LLMs.txt format for AI consumption - NO userId required',
        tags: ['Documentation', 'Public'],
        responses: {
          '200': {
            description: 'LLMs.txt file content',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
          '404': {
            description: 'LLMs.txt file not found',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'token',
        description:
          'Bearer token authentication. UserId extracted from token, or optionally override in request body.',
      },
    },
    schemas: {
      WorkflowExecutionResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['completed', 'failed'],
                description: 'Workflow execution status',
              },
              result: {
                type: 'object',
                description: 'Workflow execution result',
                properties: {
                  currentOutput: { type: 'string' },
                  nodeResults: {
                    type: 'object',
                    additionalProperties: true,
                  },
                  executionLog: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
              duration: {
                type: 'number',
                description: 'Execution time in milliseconds',
              },
              message: { type: 'string' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['success', 'data', 'timestamp'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', description: 'Error type or category' },
          message: { type: 'string', description: 'Detailed error message' },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['success', 'error', 'timestamp'],
      },
    },
  },
} as const;

// Write OpenAPI spec to file with proper error handling
const generateOpenApiSpec = (): void => {
  try {
    const outputPath = path.join(process.cwd(), 'openapi.json');
    const specContent = JSON.stringify(openApiSpec, null, 2);

    fs.writeFileSync(outputPath, specContent, 'utf-8');

    console.log('✅ OpenAPI specification generated successfully!');
    console.log(`📄 Generated: ${outputPath}`);
    console.log(
      `🔗 View docs at: http://localhost:${process.env.PORT || 3000}/docs`
    );
    console.log(`📊 Total endpoints: ${Object.keys(openApiSpec.paths).length}`);
    console.log('');

    // Endpoint analysis
    const publicEndpoints = [
      '/health',
      '/llms.txt',
    ];

    const workflowEndpoints = ['/execute'];

    const totalEndpoints = Object.keys(openApiSpec.paths).length;

    console.log(`📊 Endpoint Analysis:`);
    console.log(`   🌍 Public endpoints: ${publicEndpoints.length}`);
    console.log(`   🤖 Workflow endpoints: ${workflowEndpoints.length}`);
    console.log(`   📖 Documentation: / (root)`);
    console.log(`   📈 Total endpoints: ${totalEndpoints}`);
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI specification:', error);
    process.exit(1);
  }
};

// Run the generation
generateOpenApiSpec();
