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
// Load environment variables with priority order:
// 1. .env.local (highest priority - local development)
// 2. .env.development (if NODE_ENV=development)
// 3. .env (general environment file)
// 4. process.env (system environment variables)
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load in priority order - later files don't override existing variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env.development') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
const hono_1 = require("hono");
const swagger_ui_1 = require("@hono/swagger-ui");
const cors_1 = require("hono/cors");
const logger_1 = require("hono/logger");
const node_server_1 = require("@hono/node-server");
const fs = __importStar(require("fs"));
// Import simplified types
const simple_1 = require("@/types/simple");
// Import middleware (authCors removed - using Hono CORS instead)
// Import route handlers
const execute_1 = require("./routes/execute");
// Import OpenAPI specification
const openapi_spec_1 = require("../openapi-spec");
// Composio API key validation - initialized per-workflow execution
if (!process.env.COMPOSIO_API_KEY) {
    console.warn('⚠️ COMPOSIO_API_KEY not set - Composio tools will not work');
}
// Create Hono app
const app = new hono_1.Hono();
// Middleware
app.use('*', (0, cors_1.cors)({
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
app.use('*', (0, logger_1.logger)());
// Root endpoint - API Documentation
app.get('/', (0, swagger_ui_1.swaggerUI)({
    url: '/api/openapi.json',
}));
// Also serve docs at /docs/* for compatibility
app.get('/docs/*', (0, swagger_ui_1.swaggerUI)({
    url: '/api/openapi.json',
}));
// Health check endpoint
app.get('/health', c => {
    const healthData = {
        name: 'FlowSlash Agent Microservice',
        version: '1.0.0',
        status: 'healthy',
        endpoints: {
            documentation: '/',
            execute: '/execute',
            health: '/health',
            llms: '/llms.txt',
        },
    };
    return c.json((0, simple_1.createSuccessResponse)(healthData));
});
app.get('/api/openapi.json', c => {
    return c.json(openapi_spec_1.openApiSpec);
});
// Serve llms.txt file
app.get('/llms.txt', async (c) => {
    try {
        const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
        const content = fs.readFileSync(llmsPath, 'utf-8');
        return c.text(content, 200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'inline; filename="llms.txt"',
        });
    }
    catch {
        return c.text('LLMs.txt file not found. Run "npm run export:llms" to generate it.', 404);
    }
});
// Main execution endpoint - stateless microservice
app.route('/', (0, execute_1.executeRoutes)()); // Main execution endpoint: /execute
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
app.notFound(c => {
    return c.json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: ['/', '/execute', '/health', '/llms.txt'],
        timestamp: new Date().toISOString(),
    }, 404);
});
// Start server
const port = parseInt(process.env.PORT || '3000');
console.log('🚀 Starting FlowSlash Agent Microservice...');
console.log(`📖 API Documentation: http://localhost:${port}/`);
console.log(`⚡ Execute Endpoint: http://localhost:${port}/execute`);
console.log(`💚 Health Check: http://localhost:${port}/health`);
console.log(`📄 LLMs.txt: http://localhost:${port}/llms.txt`);
console.log(`🌐 CORS: Configured for localhost, *.freestyle.sh, and *.flowslash.com domains`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: port,
});
exports.default = app;
//# sourceMappingURL=index.js.map