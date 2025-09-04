import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { WorkflowExecutor, StreamingWorkflowExecutor } from './workflow'
import { ExecuteRequestSchema } from './schemas'

type Bindings = {
  OPENAI_API_KEY: string
  ANTHROPIC_API_KEY: string
  GOOGLE_API_KEY: string
  COMPOSIO_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost for development
    if (origin?.includes('localhost')) return origin
    // Allow your production domains
    if (origin?.includes('your-app.vercel.app')) return origin
    if (origin?.includes('your-domain.com')) return origin
    return null
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
}))

// Health check
app.get('/', (c) => {
  return c.json({
    service: 'Flowslash LangGraph API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      execute: 'POST /api/execute',
      stream: 'POST /api/execute/stream',
      health: 'GET /health'
    }
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Standard execution endpoint
app.post('/api/execute', async (c) => {
  try {
    const body = await c.req.json()
    const { nodes, edges, input, config } = ExecuteRequestSchema.parse(body)

    // Merge environment variables with config
    const executionConfig = {
      ...config,
      apiKeys: {
        ...config?.apiKeys,
        openai_api_key: config?.apiKeys?.openai_api_key || c.env.OPENAI_API_KEY,
        anthropic_api_key: config?.apiKeys?.anthropic_api_key || c.env.ANTHROPIC_API_KEY,
        google_api_key: config?.apiKeys?.google_api_key || c.env.GOOGLE_API_KEY,
        composio_api_key: config?.apiKeys?.composio_api_key || c.env.COMPOSIO_API_KEY,
      }
    }

    const executor = new WorkflowExecutor(nodes, edges, executionConfig)
    const result = await executor.execute(input)

    return c.json({
      success: !result.error,
      data: result,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Workflow execution error:', error)
    
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      500
    )
  }
})

// Streaming execution endpoint
app.post('/api/execute/stream', async (c) => {
  try {
    const body = await c.req.json()
    const { nodes, edges, input, config } = ExecuteRequestSchema.parse(body)

    // Merge environment variables with config
    const executionConfig = {
      ...config,
      apiKeys: {
        ...config?.apiKeys,
        openai_api_key: config?.apiKeys?.openai_api_key || c.env.OPENAI_API_KEY,
        anthropic_api_key: config?.apiKeys?.anthropic_api_key || c.env.ANTHROPIC_API_KEY,
        google_api_key: config?.apiKeys?.google_api_key || c.env.GOOGLE_API_KEY,
        composio_api_key: config?.apiKeys?.composio_api_key || c.env.COMPOSIO_API_KEY,
      }
    }

    const executor = new StreamingWorkflowExecutor(nodes, edges, executionConfig)

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of executor.executeStream(input)) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`
            controller.enqueue(new TextEncoder().encode(data))
          }
          controller.close()
        } catch (error) {
          const errorChunk = {
            type: 'error',
            data: { error: error instanceof Error ? error.message : String(error) },
            timestamp: new Date().toISOString(),
          }
          const data = `data: ${JSON.stringify(errorChunk)}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('Streaming workflow execution error:', error)
    
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      500
    )
  }
})

// Error handling
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json(
    {
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    },
    500
  )
})

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Endpoint not found',
      timestamp: new Date().toISOString(),
    },
    404
  )
})

export default app
