#!/usr/bin/env npx tsx
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables with priority order
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'FlowSlash Agent API',
        version: '1.0.0',
        description: 'Stateless LangGraph microservice for AI-generated workflow execution with 15 curated tool integrations. Uses environment variables for API keys and bearer token authentication.',
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
                description: 'Execute the embedded LangGraph workflow with user input. UserId extracted from bearer token or optionally provided in request body.',
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
                                            message: 'Send email to john@example.com about project completion',
                                        },
                                    },
                                    userId: {
                                        type: 'string',
                                        description: 'Optional user ID override - if not provided, extracted from bearer token',
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
        '/api/sdk/download': {
            get: {
                summary: 'Download TypeScript SDK',
                description: 'Download generated TypeScript SDK as tar.gz archive - NO userId required',
                tags: ['SDK', 'Public'],
                responses: {
                    '200': {
                        description: 'SDK archive download',
                        content: {
                            'application/gzip': {
                                schema: { type: 'string', format: 'binary' },
                            },
                        },
                    },
                    '404': {
                        description: 'SDK not generated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/sdk/info': {
            get: {
                summary: 'Get SDK information',
                description: 'Get metadata about the generated TypeScript SDK - NO userId required',
                tags: ['SDK', 'Public'],
                responses: {
                    '200': {
                        description: 'SDK information',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                sdk: {
                                                    type: 'object',
                                                    properties: {
                                                        generatedAt: {
                                                            type: 'string',
                                                            format: 'date-time',
                                                        },
                                                        files: { type: 'array', items: { type: 'string' } },
                                                        totalFiles: { type: 'number' },
                                                        installInstructions: { type: 'object' },
                                                        usage: { type: 'object' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/llms.txt': {
            get: {
                summary: 'Get LLMs.txt file',
                description: 'Download endpoint list in LLMs.txt format for AI consumption - NO userId required',
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
                description: 'Bearer token authentication. UserId extracted from token, or optionally override in request body.',
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
};
// Write OpenAPI spec to file with proper error handling
const generateOpenApiSpec = () => {
    try {
        const outputPath = path.join(process.cwd(), 'openapi.json');
        const specContent = JSON.stringify(openApiSpec, null, 2);
        fs.writeFileSync(outputPath, specContent, 'utf-8');
        console.log('✅ OpenAPI specification generated successfully!');
        console.log(`📄 Generated: ${outputPath}`);
        console.log(`🔗 View docs at: http://localhost:${process.env.PORT || 3000}/docs`);
        console.log(`📊 Total endpoints: ${Object.keys(openApiSpec.paths).length}`);
        console.log('');
        // Endpoint analysis
        const publicEndpoints = [
            '/health',
            '/api/sdk/download',
            '/api/sdk/info',
            '/llms.txt',
        ];
        const workflowEndpoints = ['/execute'];
        const totalEndpoints = Object.keys(openApiSpec.paths).length;
        console.log(`📊 Endpoint Analysis:`);
        console.log(`   🌍 Public endpoints: ${publicEndpoints.length}`);
        console.log(`   🤖 Workflow endpoints: ${workflowEndpoints.length}`);
        console.log(`   📖 Documentation: / (root)`);
        console.log(`   📈 Total endpoints: ${totalEndpoints}`);
    }
    catch (error) {
        console.error('❌ Failed to generate OpenAPI specification:', error);
        process.exit(1);
    }
};
// Run the generation
generateOpenApiSpec();
//# sourceMappingURL=generate-openapi.js.map