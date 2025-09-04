"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRoutes = executeRoutes;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_1 = require("@instantdb/admin");
const simple_1 = require("@/types/simple");
function executeRoutes(db, composio) {
    const router = new hono_1.Hono();
    // Execute tool
    router.post('/tool', (0, zod_validator_1.zValidator)('json', simple_1.ExecuteToolRequestSchema), async (c) => {
        const executionId = (0, admin_1.id)();
        const startTime = Date.now();
        try {
            const executeData = c.req.valid('json');
            const { userId, toolName, parameters } = executeData;
            const toolkit = toolName.split('_')[0];
            // Verify connection
            const connectionData = await db.query({
                connections: {
                    $: {
                        where: { userId, provider: toolkit, status: 'active' }
                    }
                }
            });
            if (connectionData.connections.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('No active connection found', `Please connect your ${toolkit} account first`), 400);
            }
            const connection = connectionData.connections[0];
            // Create execution record
            await db.transact([
                db.tx.executions[executionId].update({
                    userId,
                    connectionId: connection.id,
                    toolName,
                    toolKit: toolkit,
                    parameters,
                    status: simple_1.ExecutionStatus.RUNNING,
                    createdAt: startTime,
                })
            ]);
            try {
                // Execute tool
                const result = await composio.tools.execute(toolName, {
                    userId,
                    arguments: parameters,
                });
                const endTime = Date.now();
                const duration = endTime - startTime;
                // Update execution record
                await db.transact([
                    db.tx.executions[executionId].update({
                        status: simple_1.ExecutionStatus.COMPLETED,
                        result: result.data || result,
                        duration,
                        completedAt: endTime,
                    })
                ]);
                const responseData = {
                    executionId,
                    result: result.data || result,
                    duration,
                    message: 'Tool executed successfully'
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
                    error: 'Tool execution failed',
                    message: executionError instanceof Error ? executionError.message : String(executionError),
                    duration
                };
                return c.json((0, simple_1.createErrorResponse)('Tool execution failed', JSON.stringify(responseData)), 500);
            }
        }
        catch (error) {
            console.error('Execution error:', error);
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
    // Get execution status
    router.get('/status/:executionId', async (c) => {
        try {
            const executionId = c.req.param('executionId');
            const executionData = await db.query({
                executions: { $: { where: { id: executionId } } }
            });
            if (executionData.executions.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Execution not found'), 404);
            }
            const execution = executionData.executions[0];
            const responseData = {
                execution: {
                    id: execution.id,
                    toolName: execution.toolName,
                    toolkit: execution.toolKit,
                    status: execution.status,
                    result: execution.result,
                    error: execution.error,
                    duration: execution.duration,
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
    // Get execution history
    router.get('/history/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const limit = parseInt(c.req.query('limit') || '50');
            const status = c.req.query('status');
            const executions = await db.query({
                executions: {
                    $: {
                        where: {
                            userId,
                            ...(status && { status })
                        },
                        order: { createdAt: 'desc' },
                        limit,
                    }
                }
            });
            const responseData = {
                executions: executions.executions.map((exec) => ({
                    id: exec.id,
                    toolName: exec.toolName,
                    toolkit: exec.toolKit,
                    status: exec.status,
                    duration: exec.duration,
                    createdAt: exec.createdAt,
                    completedAt: exec.completedAt,
                    hasError: !!exec.error,
                })),
                meta: {
                    total: executions.executions.length,
                    limit,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Execution history error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch execution history'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=execute-simple.js.map