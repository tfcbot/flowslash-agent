"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultsRoutes = resultsRoutes;
const hono_1 = require("hono");
const simple_1 = require("@/types/simple");
function resultsRoutes(db, _composio) {
    const router = new hono_1.Hono();
    // Get execution result
    router.get('/execution/:executionId', async (c) => {
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
                    parameters: execution.parameters,
                    status: execution.status,
                    result: execution.result,
                    error: execution.error,
                    duration: execution.duration,
                    retryCount: execution.retryCount || 0,
                    createdAt: execution.createdAt,
                    completedAt: execution.completedAt,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Execution result fetch error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch execution result'), 500);
        }
    });
    // Get user analytics
    router.get('/analytics/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const days = parseInt(c.req.query('days') || '30');
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            const analyticsData = await db.query({
                analytics: {
                    $: {
                        where: {
                            userId,
                            // Note: InstantDB doesn't support date range queries directly
                            // This is a simplified version
                        },
                        order: { date: 'asc' }
                    }
                }
            });
            // Aggregate analytics
            let totalExecutions = 0;
            let successfulExecutions = 0;
            let failedExecutions = 0;
            let totalDuration = 0;
            const topTools = {};
            for (const analytics of analyticsData.analytics) {
                // Simple date filter (since InstantDB doesn't support range queries well)
                if (analytics.date >= startDateStr && analytics.date <= endDateStr) {
                    totalExecutions += analytics.totalExecutions;
                    successfulExecutions += analytics.successfulExecutions;
                    failedExecutions += analytics.failedExecutions;
                    totalDuration += (analytics.averageExecutionTime || 0) * analytics.totalExecutions;
                    if (analytics.topTools) {
                        for (const [tool, count] of Object.entries(analytics.topTools)) {
                            topTools[tool] = (topTools[tool] || 0) + count;
                        }
                    }
                }
            }
            const averageExecutionTime = totalExecutions > 0 ? totalDuration / totalExecutions : 0;
            const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
            const responseData = {
                analytics: {
                    dateRange: { start: startDateStr, end: endDateStr, days },
                    summary: {
                        totalExecutions,
                        successfulExecutions,
                        failedExecutions,
                        successRate,
                        averageExecutionTime,
                    },
                    topTools: Object.entries(topTools)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([tool, count]) => ({ tool, count })),
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Analytics fetch error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch analytics'), 500);
        }
    });
    // Export results
    router.get('/export/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const format = c.req.query('format') || 'json';
            const limit = parseInt(c.req.query('limit') || '1000');
            const executionsData = await db.query({
                executions: {
                    $: {
                        where: { userId },
                        order: { createdAt: 'desc' },
                        limit,
                    }
                }
            });
            if (format === 'csv') {
                let csv = 'ID,Tool Name,Toolkit,Status,Duration,Created At,Completed At,Error\n';
                for (const exec of executionsData.executions) {
                    const row = [
                        exec.id,
                        exec.toolName,
                        exec.toolKit,
                        exec.status,
                        exec.duration || '',
                        new Date(exec.createdAt).toISOString(),
                        exec.completedAt ? new Date(exec.completedAt).toISOString() : '',
                        exec.error || ''
                    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
                    csv += row + '\n';
                }
                return c.text(csv, 200, {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="executions_${userId}_${new Date().toISOString().split('T')[0]}.csv"`
                });
            }
            const responseData = {
                executions: executionsData.executions.map((exec) => ({
                    id: exec.id,
                    toolName: exec.toolName,
                    toolkit: exec.toolKit,
                    parameters: exec.parameters,
                    status: exec.status,
                    result: exec.result,
                    error: exec.error,
                    duration: exec.duration,
                    createdAt: exec.createdAt,
                    completedAt: exec.completedAt,
                })),
                meta: {
                    total: executionsData.executions.length,
                    exportedAt: new Date().toISOString(),
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Export error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to export results'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=results-simple.js.map