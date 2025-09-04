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
exports.sdkRoutes = sdkRoutes;
const hono_1 = require("hono");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const simple_1 = require("@/types/simple");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function sdkRoutes() {
    const router = new hono_1.Hono();
    // Download SDK
    router.get('/download', async (c) => {
        try {
            const sdkPath = path.join(process.cwd(), 'generated/sdk');
            if (!fs.existsSync(sdkPath)) {
                return c.json((0, simple_1.createErrorResponse)('SDK not generated', 'Run "npm run generate:sdk" to generate the TypeScript SDK first'), 404);
            }
            // Create archive
            const archiveName = `flowslash-agent-sdk-${new Date().toISOString().split('T')[0]}.tar.gz`;
            const archivePath = path.join(process.cwd(), 'generated', archiveName);
            await execAsync(`tar -czf "${archivePath}" -C "${sdkPath}" .`);
            const buffer = fs.readFileSync(archivePath);
            fs.unlinkSync(archivePath); // Cleanup
            return c.body(buffer, 200, {
                'Content-Type': 'application/gzip',
                'Content-Disposition': `attachment; filename="${archiveName}"`,
                'Content-Length': buffer.length.toString(),
            });
        }
        catch (error) {
            console.error('SDK download error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to download SDK'), 500);
        }
    });
    // Get SDK info
    router.get('/info', async (c) => {
        try {
            const sdkPath = path.join(process.cwd(), 'generated/sdk');
            if (!fs.existsSync(sdkPath)) {
                return c.json((0, simple_1.createErrorResponse)('SDK not generated'), 404);
            }
            const files = [];
            const getFiles = (dir, basePath = '') => {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const relativePath = path.join(basePath, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        getFiles(fullPath, relativePath);
                    }
                    else {
                        files.push(relativePath);
                    }
                }
            };
            getFiles(sdkPath);
            // Get generation timestamp
            const openApiPath = path.join(process.cwd(), 'openapi.json');
            let generatedAt = null;
            if (fs.existsSync(openApiPath)) {
                const stats = fs.statSync(openApiPath);
                generatedAt = stats.mtime.toISOString();
            }
            const responseData = {
                sdk: {
                    generatedAt,
                    files: files.sort(),
                    totalFiles: files.length,
                    installInstructions: {
                        npm: 'npm install ./path/to/extracted/sdk',
                        yarn: 'yarn add ./path/to/extracted/sdk',
                    },
                    usage: {
                        import: "import { ApiClient } from 'flowslash-agent-sdk';",
                        initialization: `const client = new ApiClient({ BASE: 'http://localhost:3000' });`,
                        example: `const result = await client.execute({ input: { message: 'Hello World' } }, { headers: { Authorization: 'Bearer your_token' } });`,
                    }
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('SDK info error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to get SDK info'), 500);
        }
    });
    // Regenerate SDK
    router.post('/regenerate', async (c) => {
        try {
            await execAsync('npm run generate:openapi');
            await execAsync('npm run generate:sdk');
            const responseData = {
                message: 'SDK regenerated successfully',
                timestamp: new Date().toISOString(),
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('SDK regeneration error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to regenerate SDK'), 500);
        }
    });
    // Get examples
    router.get('/examples', async (c) => {
        const responseData = {
            examples: {
                basic: {
                    title: 'Basic Usage',
                    description: 'Simple workflow execution',
                    code: `
import { ApiClient } from 'flowslash-agent-sdk';

const client = new ApiClient({ BASE: 'http://localhost:3000' });

const result = await client.execute({
  input: {
    message: 'Hello, please help me with my task!'
  }
}, {
  headers: {
    Authorization: 'Bearer user_123_1234567890_demo'
  }
});

console.log('Workflow Result:', result);`.trim()
                }
            }
        };
        return c.json((0, simple_1.createSuccessResponse)(responseData));
    });
    return router;
}
//# sourceMappingURL=sdk.js.map