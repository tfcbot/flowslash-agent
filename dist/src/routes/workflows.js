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
exports.workflowRoutes = workflowRoutes;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_1 = require("@instantdb/admin");
const simple_1 = require("@/types/simple");
const auth_1 = require("@/middleware/auth");
// Import from types
const simple_2 = require("@/types/simple");
function workflowRoutes(db, composio) {
    const router = new hono_1.Hono();
    // Execute workflow by ID (main endpoint)
    router.post('/execute/:workflowId', (0, auth_1.bearerAuth)(), (0, zod_validator_1.zValidator)('json', simple_2.ExecuteWorkflowRequestSchema), async (c) => {
        const executionId = (0, admin_1.id)();
        const startTime = Date.now();
        try {
            const userContext = (0, auth_1.getUserContext)(c);
            const userId = userContext.userId;
            const workflowId = c.req.param('workflowId');
            const executeData = c.req.valid('json');
            const { input, config } = executeData;
            // Get workflow definition
            const workflowData = await db.query({
                workflows: {
                    $: { where: { id: workflowId, isActive: true } }
                }
            });
            if (workflowData.workflows.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Workflow not found', `Workflow with ID ${workflowId} not found or inactive`), 404);
            }
            const workflow = workflowData.workflows[0];
            // Create execution record
            await db.transact([
                db.tx.executions[executionId].update({
                    workflowId,
                    userId,
                    input,
                    status: simple_1.ExecutionStatus.RUNNING,
                    createdAt: startTime,
                })
            ]);
            try {
                // Import the original LangGraph executor
                const { WorkflowExecutor } = await Promise.resolve().then(() => __importStar(require('@/lib/workflow-executor')));
                // Extract nodes and edges from workflow definition
                const { nodes, edges } = workflow.definition;
                // Execute workflow using LangGraph
                const executor = new WorkflowExecutor(nodes, edges, {
                    ...config,
                    userId,
                });
                const result = await executor.execute(JSON.stringify(input));
                const endTime = Date.now();
                const duration = endTime - startTime;
                // Update execution record with success
                await db.transact([
                    db.tx.executions[executionId].update({
                        status: simple_1.ExecutionStatus.COMPLETED,
                        result: result,
                        nodeResults: result.nodeResults,
                        executionLog: result.executionLog,
                        duration,
                        completedAt: endTime,
                    })
                ]);
                const responseData = {
                    executionId,
                    workflowId,
                    status: simple_1.ExecutionStatus.COMPLETED,
                    result,
                    duration,
                    message: 'Workflow executed successfully'
                };
                return c.json((0, simple_1.createSuccessResponse)(responseData));
            }
            catch (executionError) {
                const endTime = Date.now();
                const duration = endTime - startTime;
                // Update execution record with error
                await db.transact([
                    db.tx.executions[executionId].update({
                        status: simple_1.ExecutionStatus.FAILED,
                        error: executionError instanceof Error ? executionError.message : String(executionError),
                        duration,
                        completedAt: endTime,
                    })
                ]);
                const responseData = {
                    executionId,
                    workflowId,
                    status: simple_1.ExecutionStatus.FAILED,
                    error: 'Workflow execution failed',
                    message: executionError instanceof Error ? executionError.message : String(executionError),
                    duration
                };
                return c.json((0, simple_1.createErrorResponse)('Workflow execution failed', JSON.stringify(responseData)), 500);
            }
        }
        catch (error) {
            console.error('Workflow execution error:', error);
            try {
                await db.transact([
                    db.tx.executions[executionId].update({
                        status: simple_1.ExecutionStatus.FAILED,
                        error: error instanceof Error ? error.message : String(error),
                        completedAt: Date.now(),
                    })
                ]);
            }
            catch (dbError) {
                console.error('Failed to update execution record:', dbError);
            }
            return c.json((0, simple_1.createErrorResponse)('Execution failed', error instanceof Error ? error.message : 'Unknown error'), 500);
        }
    });
    // Get workflow definition
    router.get('/:workflowId', async (c) => {
        try {
            const workflowId = c.req.param('workflowId');
            const workflowData = await db.query({
                workflows: {
                    $: { where: { id: workflowId, isActive: true } }
                }
            });
            if (workflowData.workflows.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Workflow not found'), 404);
            }
            const workflow = workflowData.workflows[0];
            const responseData = {
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description,
                    version: workflow.version,
                    definition: workflow.definition,
                    createdAt: workflow.createdAt,
                    updatedAt: workflow.updatedAt,
                    createdBy: workflow.createdBy,
                    tags: workflow.tags,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Workflow fetch error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch workflow'), 500);
        }
    });
    // List workflows (public - for discovery)
    router.get('/', async (c) => {
        try {
            const limit = parseInt(c.req.query('limit') || '50');
            const search = c.req.query('search');
            const tags = c.req.query('tags')?.split(',');
            const workflowData = await db.query({
                workflows: {
                    $: {
                        where: { isActive: true },
                        order: { updatedAt: 'desc' },
                        limit,
                    }
                }
            });
            let workflows = workflowData.workflows;
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                workflows = workflows.filter((w) => w.name.toLowerCase().includes(searchLower) ||
                    (w.description && w.description.toLowerCase().includes(searchLower)));
            }
            // Apply tags filter
            if (tags && tags.length > 0) {
                workflows = workflows.filter((w) => w.tags && tags.some((tag) => w.tags.includes(tag)));
            }
            const responseData = {
                workflows: workflows.map((w) => ({
                    id: w.id,
                    name: w.name,
                    description: w.description,
                    version: w.version,
                    createdAt: w.createdAt,
                    updatedAt: w.updatedAt,
                    tags: w.tags,
                })),
                meta: {
                    total: workflows.length,
                    limit,
                    hasMore: workflowData.workflows.length === limit,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Workflows list error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch workflows'), 500);
        }
    });
    // Get execution status
    router.get('/execution/:executionId', async (c) => {
        try {
            const executionId = c.req.param('executionId');
            const executionData = await db.query({
                executions: {
                    $: { where: { id: executionId } }
                }
            });
            if (executionData.executions.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Execution not found'), 404);
            }
            const execution = executionData.executions[0];
            const responseData = {
                execution: {
                    id: execution.id,
                    workflowId: execution.workflowId,
                    userId: execution.userId,
                    status: execution.status,
                    input: execution.input,
                    result: execution.result,
                    error: execution.error,
                    duration: execution.duration,
                    nodeResults: execution.nodeResults,
                    executionLog: execution.executionLog,
                    createdAt: execution.createdAt,
                    completedAt: execution.completedAt,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Execution status error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch execution status'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=workflows.js.map