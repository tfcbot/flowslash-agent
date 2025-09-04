// Import the generated OpenAPI specification
import * as fs from 'fs';
import * as path from 'path';

interface OpenAPISpecification {
  openapi: string;
  info: Record<string, unknown>;
  paths: Record<string, unknown>;
  components?: Record<string, unknown>;
}

let cachedSpec: OpenAPISpecification | null = null;

export const openApiSpec = (() => {
  if (cachedSpec) {
    return cachedSpec;
  }

  try {
    const specPath = path.join(process.cwd(), 'openapi.json');
    const specContent = fs.readFileSync(specPath, 'utf-8');
    cachedSpec = JSON.parse(specContent);
    return cachedSpec;
  } catch (error) {
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
