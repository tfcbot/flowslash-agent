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
exports.openApiSpec = void 0;
// Import the generated OpenAPI specification
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let cachedSpec = null;
exports.openApiSpec = (() => {
    if (cachedSpec) {
        return cachedSpec;
    }
    try {
        const specPath = path.join(process.cwd(), 'openapi.json');
        const specContent = fs.readFileSync(specPath, 'utf-8');
        cachedSpec = JSON.parse(specContent);
        return cachedSpec;
    }
    catch (error) {
        console.warn('OpenAPI spec not found, returning minimal spec. Run "npm run generate:openapi" to generate it.', error);
        // Return minimal spec if file doesn't exist
        return {
            openapi: '3.0.0',
            info: {
                title: 'FlowSlash Agent API',
                version: '1.0.0',
                description: 'OpenAPI specification not generated. Run "bun run generate:openapi"',
            },
            servers: [{ url: 'http://localhost:3000' }],
            paths: {
                '/': {
                    get: {
                        summary: 'API Health Check',
                        responses: {
                            '200': {
                                description: 'API is healthy',
                                content: {
                                    'application/json': {
                                        schema: { type: 'object' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }
})();
//# sourceMappingURL=openapi-spec.js.map