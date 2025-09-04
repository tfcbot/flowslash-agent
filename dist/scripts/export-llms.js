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
// Generate llms.txt file with all API endpoints
const exportLlmsFile = () => {
    try {
        // Read OpenAPI specification
        const openApiPath = path.join(process.cwd(), 'openapi.json');
        if (!fs.existsSync(openApiPath)) {
            console.error('❌ OpenAPI specification not found. Run "npm run generate:openapi" first.');
            process.exit(1);
        }
        const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
        const generatedDate = new Date().toISOString();
        let llmsContent = `# FlowSlash Agent API Endpoints
# Generated: ${generatedDate}
# Base URL: ${baseUrl}

## Overview
FlowSlash Agent is a stateless LangGraph microservice for AI-generated workflow execution. It executes custom AI workflows with 15 curated tool integrations via Composio. No database required - purely stateless execution.

## Authentication Model
- **Bearer Token Authentication**: API uses bearer tokens for secure access
- **UserId Extraction**: User ID extracted from bearer token automatically
- **Environment API Keys**: Composio, OpenAI, and other API keys from environment variables
- **Stateless Design**: No persistent storage - perfect for microservices

## Getting Started Flow
1. **Discover**: GET / (health check - no auth needed)
2. **Get Token**: Obtain bearer token from your auth system
3. **Execute**: POST /execute (run AI-generated LangGraph workflow)
4. **Monitor**: Check response for execution results

## Public Endpoints (No Authentication Required)

### GET /
API health check and status - accessible to everyone

### GET /api/sdk/download
Download TypeScript SDK - accessible to everyone

### GET /api/sdk/info  
SDK metadata and examples - accessible to everyone

### GET /llms.txt
This file - accessible to everyone, AI-friendly format

## Authenticated Endpoints (Require Bearer Token)

These endpoints require "Authorization: Bearer {token}" header:
Add header: Authorization: Bearer user_abc123_1234567890_demo

`;
        // Categorize endpoints (removed token generation and connections - both external)
        const publicEndpoints = ['/', '/api/sdk/download', '/api/sdk/info', '/llms.txt'];
        let publicCount = 0;
        let userSpecificCount = 0;
        // Process each endpoint
        Object.entries(openApiSpec.paths).forEach(([endpointPath, methods]) => {
            Object.entries(methods).forEach(([method, details]) => {
                const httpMethod = method.toUpperCase();
                const isPublic = publicEndpoints.includes(endpointPath);
                if (isPublic) {
                    publicCount++;
                }
                else {
                    userSpecificCount++;
                }
                // Skip public endpoints - already documented above
                if (isPublic)
                    return;
                llmsContent += `### ${httpMethod} ${endpointPath}\n`;
                llmsContent += `${details.summary || 'No description'}\n`;
                if (details.description) {
                    llmsContent += `${details.description}\n`;
                }
                // Highlight userId requirement
                if (endpointPath.includes('{userId}')) {
                    llmsContent += `🔒 Requires userId in path parameter\n`;
                }
                else if (details.requestBody?.content?.['application/json']?.schema?.required?.includes('userId')) {
                    llmsContent += `🔒 Requires userId in request body\n`;
                }
                else if (details.parameters?.some(p => p.name === 'userId' && p.required)) {
                    llmsContent += `🔒 Requires userId as query parameter\n`;
                }
                // Add parameters info
                if (details.parameters && details.parameters.length > 0) {
                    llmsContent += `Parameters:\n`;
                    details.parameters.forEach(param => {
                        const required = param.required ? ' (required)' : ' (optional)';
                        const isUserIdParam = param.name === 'userId';
                        const prefix = isUserIdParam ? '🔑 ' : '  - ';
                        llmsContent += `${prefix}${param.name}${required}: ${param.schema?.type || 'string'}\n`;
                    });
                }
                // Add request body info
                if (details.requestBody?.content?.['application/json']?.schema) {
                    const schema = details.requestBody.content['application/json'].schema;
                    llmsContent += `Request Body: JSON\n`;
                    if (schema.properties) {
                        Object.entries(schema.properties).forEach(([prop, propSchema]) => {
                            const required = schema.required?.includes(prop) ? ' (required)' : ' (optional)';
                            const isUserIdProp = prop === 'userId';
                            const prefix = isUserIdProp ? '🔑 ' : '  - ';
                            llmsContent += `${prefix}${prop}${required}: ${propSchema.type || 'any'}\n`;
                        });
                    }
                    // Add example
                    if (schema.example) {
                        llmsContent += `Example: ${JSON.stringify(schema.example, null, 2)}\n`;
                    }
                }
                // Add response codes
                if (details.responses) {
                    const codes = Object.keys(details.responses).join(', ');
                    llmsContent += `Responses: ${codes}\n`;
                }
                llmsContent += `\n`;
            });
        });
        // Add comprehensive usage examples
        llmsContent += `## Complete Usage Flow Examples

### Basic Workflow Execution (cURL)
\`\`\`bash
# Step 1: Obtain Bearer Token from your auth system
# TOKEN="user_123_1234567890_demo"

# Step 2: Execute AI-Generated LangGraph Workflow
curl -X POST ${baseUrl}/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \$TOKEN" \\
  -d '{
    "input": {
      "message": "Send email to john@example.com about project completion"
    }
  }'

# Response includes complete workflow execution results
\`\`\`

### TypeScript SDK Usage
\`\`\`typescript
import { ApiClient } from 'flowslash-agent-sdk';

// Initialize authenticated client with bearer token
const client = new ApiClient({
  BASE: '${baseUrl}',
  HEADERS: {
    Authorization: 'Bearer user_123_1234567890_demo'
  }
});

async function executeWorkflow() {
  // Execute AI-generated LangGraph workflow
  const result = await client.execute({
    input: {
      message: 'Send email to team@company.com about deployment success'
    }
  });
  
  console.log('Workflow executed:', result.data);
  console.log('Duration:', result.data.duration + 'ms');
  console.log('Node Results:', result.data.result.nodeResults);
}
\`\`\`

## Available Tools (15 Total)
FlowSlash Agent supports these curated integrations with full documentation:

### 📧 Communication
- **Gmail** - Email sending, drafts, labels, search
- **Slack** - Messages, channels, notifications

### 🗂️ Productivity & Data
- **Notion** - Pages, databases, content management
- **Airtable** - Records, bases, field management
- **Google Sheets** - Spreadsheet operations
- **Linear** - Issue tracking, project management

### 👥 Social Media Management
- **Twitter** - Posting, engagement, management
- **LinkedIn** - Professional networking posts
- **Instagram** - Content posting and management
- **Ayrshare** - Multi-platform social posting

### 🔧 Development & Files
- **GitHub** - Repository operations, issues, pull requests
- **Google Drive** - File storage and sharing
- **Dropbox** - Cloud file management

### 🤖 Advanced Tools
- **Apify** - Web scraping and automation
- **Replicate** - AI/ML model execution

All tools documented in \`/composio_tools_reference/tools/\`

## Endpoint Statistics
- **Total Endpoints**: ${Object.keys(openApiSpec.paths).length}
- **Public Endpoints**: ${publicCount} (${Math.round((publicCount / Object.keys(openApiSpec.paths).length) * 100)}%)
- **User-Specific Endpoints**: ${userSpecificCount} (${Math.round((userSpecificCount / Object.keys(openApiSpec.paths).length) * 100)}%)

## Why Bearer Token Authentication

### 🔒 Security Benefits
- **Token-Based**: Standard API authentication without user registration
- **Data Isolation**: Users only see their own connections, executions, analytics
- **Access Control**: Tools depend on token holder's authorized connections
- **Rate Limiting**: Track usage and prevent abuse per token
- **Audit Trail**: Know who executed what and when

### ⚡ Performance Benefits  
- **Stateless**: No session management required
- **Personalized Results**: Only show tools token holder can actually use
- **Efficient Queries**: Filter data by user scope from token
- **Composio Compliance**: Third-party APIs require user context

### 🎯 Developer Experience Benefits
- **Simple Auth**: Just generate token and use it
- **No Registration**: Skip user signup/login flows
- **API-First**: Standard bearer token pattern
- **Flexible**: Tokens can represent users, apps, or services

## Rate Limits (Per User)
- **Free Tier**: 100 executions per day
- **Pro Tier**: 1000 executions per day  
- **Enterprise**: Unlimited executions

## Error Handling
All endpoints return standardized TypeScript-typed error responses:
\`\`\`json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error description", 
  "timestamp": "2025-01-XX:XX:XX.XXXZ"
}
\`\`\`

## Support & Resources
- **Interactive Documentation**: ${baseUrl}/docs
- **TypeScript SDK Download**: ${baseUrl}/api/sdk/download
- **SDK Information**: ${baseUrl}/api/sdk/info
- **Health Check**: ${baseUrl}/
- **This File**: ${baseUrl}/llms.txt
`;
        // Ensure public directory exists
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        // Write llms.txt file
        const outputPath = path.join(publicDir, 'llms.txt');
        fs.writeFileSync(outputPath, llmsContent, 'utf-8');
        console.log('✅ llms.txt exported successfully!');
        console.log(`📄 Generated: ${outputPath}`);
        console.log(`📊 Total endpoints documented: ${Object.keys(openApiSpec.paths).length}`);
        console.log(`🔗 Access at: ${baseUrl}/llms.txt`);
        console.log(`📈 Public vs User-specific ratio: ${publicCount}:${userSpecificCount}`);
    }
    catch (error) {
        console.error('❌ Failed to generate llms.txt:', error);
        process.exit(1);
    }
};
// Run the export
exportLlmsFile();
//# sourceMappingURL=export-llms.js.map