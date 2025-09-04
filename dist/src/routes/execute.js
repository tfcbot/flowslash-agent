"use strict";
/**
 * Stateless Workflow Execution Route
 * Single /execute endpoint for AI-generated LangGraph workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRoutes = executeRoutes;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const zod_1 = require("zod");
const simple_1 = require("@/types/simple");
const auth_1 = require("@/middleware/auth");
const workflow_executor_1 = require("@/lib/workflow-executor");
// Execute request schema - simplified for stateless operation
const ExecuteRequestSchema = zod_1.z.object({
    input: zod_1.z.record(zod_1.z.unknown()),
    userId: zod_1.z.string().optional(), // Optional - extracted from bearer token if not provided
});
function executeRoutes(composio) {
    const router = new hono_1.Hono();
    // Main execution endpoint - stateless microservice
    router.post('/execute', (0, auth_1.bearerAuth)(), (0, zod_validator_1.zValidator)('json', ExecuteRequestSchema), async (c) => {
        const startTime = Date.now();
        try {
            const userContext = (0, auth_1.getUserContext)(c);
            const executeData = c.req.valid('json');
            const { input, userId } = executeData;
            // Use userId from bearer token, fallback to request body
            const effectiveUserId = userContext.userId || userId;
            // AI-Generated Workflow Definition
            // This is where AI will write the specific workflow
            const workflowDefinition = getWorkflowDefinition();
            // Execute workflow using LangGraph
            const executor = new workflow_executor_1.WorkflowExecutor(workflowDefinition.nodes, workflowDefinition.edges, {
                userId: effectiveUserId,
            });
            const result = await executor.execute(JSON.stringify(input));
            const endTime = Date.now();
            const duration = endTime - startTime;
            const responseData = {
                status: 'completed',
                result,
                duration,
                message: 'Workflow executed successfully',
                timestamp: new Date().toISOString(),
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (executionError) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.error('Workflow execution error:', executionError);
            const responseData = {
                status: 'failed',
                error: 'Workflow execution failed',
                message: executionError instanceof Error ? executionError.message : String(executionError),
                duration,
                timestamp: new Date().toISOString(),
            };
            return c.json((0, simple_1.createErrorResponse)('Workflow execution failed', JSON.stringify(responseData)), 500);
        }
    });
    return router;
}
/**
 * AI-Generated Workflow Definition
 * This function will be replaced/modified by AI agents
 */
function getWorkflowDefinition() {
    // Default example workflow - AI will replace this
    return {
        nodes: [
            {
                id: "input_1",
                type: "customInput",
                data: {
                    label: "User Input",
                    query: ""
                }
            },
            {
                id: "llm_1",
                type: "llm",
                data: {
                    provider: "openai",
                    modelName: "gpt-4o",
                    systemPrompt: "You are a helpful assistant. Respond to the user's input.",
                    temperature: 0.7,
                    maxTokens: 500
                }
            },
            {
                id: "output_1",
                type: "customOutput",
                data: {
                    format: "text",
                    label: "Assistant Response"
                }
            }
        ],
        edges: [
            {
                id: "edge_1",
                source: "input_1",
                target: "llm_1"
            },
            {
                id: "edge_2",
                source: "llm_1",
                target: "output_1"
            }
        ]
    };
}
//# sourceMappingURL=execute.js.map