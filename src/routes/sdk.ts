import { Hono } from 'hono';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createSuccessResponse, createErrorResponse } from '@/types/simple';

const execAsync = promisify(exec);

export function sdkRoutes() {
  const router = new Hono();

  // Download SDK
  router.get('/download', async (c) => {
    try {
      const sdkPath = path.join(process.cwd(), 'generated/sdk');
      
      if (!fs.existsSync(sdkPath)) {
        return c.json(
          createErrorResponse(
            'SDK not generated',
            'Run "npm run generate:sdk" to generate the TypeScript SDK first'
          ), 
          404
        );
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

    } catch (error) {
      console.error('SDK download error:', error);
      return c.json(createErrorResponse('Failed to download SDK'), 500);
    }
  });

  // Get SDK info
  router.get('/info', async (c) => {
    try {
      const sdkPath = path.join(process.cwd(), 'generated/sdk');
      
      if (!fs.existsSync(sdkPath)) {
        return c.json(createErrorResponse('SDK not generated'), 404);
      }

      const files: string[] = [];
      const getFiles = (dir: string, basePath = '') => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const relativePath = path.join(basePath, item);
          
          if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, relativePath);
          } else {
            files.push(relativePath);
          }
        }
      };
      
      getFiles(sdkPath);

      // Get generation timestamp
      const openApiPath = path.join(process.cwd(), 'openapi.json');
      let generatedAt: string | null = null;
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

      return c.json(createSuccessResponse(responseData));

    } catch (error) {
      console.error('SDK info error:', error);
      return c.json(createErrorResponse('Failed to get SDK info'), 500);
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

      return c.json(createSuccessResponse(responseData));

    } catch (error) {
      console.error('SDK regeneration error:', error);
      return c.json(createErrorResponse('Failed to regenerate SDK'), 500);
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

    return c.json(createSuccessResponse(responseData));
  });

  return router;
}
