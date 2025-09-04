"use strict";
/**
 * AI Workflow Management Routes
 * Allows AI agents to create, modify, and manage workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiWorkflowRoutes = aiWorkflowRoutes;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_1 = require("@instantdb/admin");
const zod_1 = require("zod");
const simple_1 = require("@/types/simple");
const auth_1 = require("@/middleware/auth");
// Workflow creation/update schemas
const CreateWorkflowRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    version: zod_1.z.string().default('1.0.0'),
    definition: zod_1.z.object({
        nodes: zod_1.z.array(zod_1.z.any()),
        edges: zod_1.z.array(zod_1.z.any()),
        config: zod_1.z.record(zod_1.z.unknown()).optional(),
    }),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const UpdateWorkflowRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    definition: zod_1.z.object({
        nodes: zod_1.z.array(zod_1.z.any()),
        edges: zod_1.z.array(zod_1.z.any()),
        config: zod_1.z.record(zod_1.z.unknown()).optional(),
    }).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
});
function aiWorkflowRoutes(db) {
    const router = new hono_1.Hono();
    // Create new workflow (for AI agents to create workflows)
    router.post('/create', (0, auth_1.bearerAuth)(), (0, zod_validator_1.zValidator)('json', CreateWorkflowRequestSchema), async (c) => {
        try {
            const userContext = (0, auth_1.getUserContext)(c);
            const userId = userContext.userId;
            const workflowData = c.req.valid('json');
            const workflowId = (0, admin_1.id)();
            const now = Date.now();
            await db.transact([
                db.tx.workflows[workflowId].update({
                    name: workflowData.name,
                    description: workflowData.description,
                    version: workflowData.version,
                    definition: workflowData.definition,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: userId,
                    tags: workflowData.tags || [],
                })
            ]);
            const responseData = {
                workflow: {
                    id: workflowId,
                    name: workflowData.name,
                    description: workflowData.description,
                    version: workflowData.version,
                    isActive: true,
                    createdAt: now,
                    createdBy: userId,
                    tags: workflowData.tags,
                },
                message: 'Workflow created successfully'
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Workflow creation error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to create workflow', error instanceof Error ? error.message : 'Unknown error'), 500);
        }
    });
    // Update existing workflow (for AI agents to modify workflows)
    router.put('/:workflowId', (0, auth_1.bearerAuth)(), (0, zod_validator_1.zValidator)('json', UpdateWorkflowRequestSchema), async (c) => {
        try {
            const userContext = (0, auth_1.getUserContext)(c);
            const userId = userContext.userId;
            const workflowId = c.req.param('workflowId');
            const updateData = c.req.valid('json');
            // Check if workflow exists
            const workflowData = await db.query({
                workflows: {
                    $: { where: { id: workflowId } }
                }
            });
            if (workflowData.workflows.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Workflow not found'), 404);
            }
            const existingWorkflow = workflowData.workflows[0];
            // Update workflow
            const updateFields = {
                updatedAt: Date.now(),
                createdBy: userId, // Track who last modified
            };
            // Only update provided fields
            if (updateData.name !== undefined)
                updateFields.name = updateData.name;
            if (updateData.description !== undefined)
                updateFields.description = updateData.description;
            if (updateData.version !== undefined)
                updateFields.version = updateData.version;
            if (updateData.definition !== undefined)
                updateFields.definition = updateData.definition;
            if (updateData.tags !== undefined)
                updateFields.tags = updateData.tags;
            if (updateData.isActive !== undefined)
                updateFields.isActive = updateData.isActive;
            await db.transact([
                db.tx.workflows[workflowId].update(updateFields)
            ]);
            const responseData = {
                workflow: {
                    id: workflowId,
                    name: updateData.name || existingWorkflow.name,
                    description: updateData.description || existingWorkflow.description,
                    version: updateData.version || existingWorkflow.version,
                    isActive: updateData.isActive !== undefined ? updateData.isActive : existingWorkflow.isActive,
                    updatedAt: updateFields.updatedAt,
                    createdBy: userId,
                },
                message: 'Workflow updated successfully'
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Workflow update error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to update workflow'), 500);
        }
    });
    // Delete workflow (for AI agents to remove workflows)
    router.delete('/:workflowId', (0, auth_1.bearerAuth)(), async (c) => {
        try {
            const workflowId = c.req.param('workflowId');
            // Check if workflow exists
            const workflowData = await db.query({
                workflows: {
                    $: { where: { id: workflowId } }
                }
            });
            if (workflowData.workflows.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Workflow not found'), 404);
            }
            // Soft delete - mark as inactive
            await db.transact([
                db.tx.workflows[workflowId].update({
                    isActive: false,
                    updatedAt: Date.now(),
                })
            ]);
            return c.json((0, simple_1.createSuccessResponse)({
                message: 'Workflow deactivated successfully'
            }));
        }
        catch (error) {
            console.error('Workflow deletion error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to delete workflow'), 500);
        }
    });
    // Clone workflow (for AI agents to create variations)
    router.post('/:workflowId/clone', (0, auth_1.bearerAuth)(), async (c) => {
        try {
            const userContext = (0, auth_1.getUserContext)(c);
            const userId = userContext.userId;
            const sourceWorkflowId = c.req.param('workflowId');
            const body = await c.req.json().catch(() => ({}));
            const namePrefix = body.namePrefix || 'Copy of ';
            // Get source workflow
            const sourceWorkflowData = await db.query({
                workflows: {
                    $: { where: { id: sourceWorkflowId, isActive: true } }
                }
            });
            if (sourceWorkflowData.workflows.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Source workflow not found'), 404);
            }
            const sourceWorkflow = sourceWorkflowData.workflows[0];
            const newWorkflowId = (0, admin_1.id)();
            const now = Date.now();
            // Clone workflow with new ID
            await db.transact([
                db.tx.workflows[newWorkflowId].update({
                    name: `${namePrefix}${sourceWorkflow.name}`,
                    description: sourceWorkflow.description,
                    version: '1.0.0', // Reset version for clone
                    definition: sourceWorkflow.definition,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: userId,
                    tags: [...(sourceWorkflow.tags || []), 'cloned'],
                })
            ]);
            const responseData = {
                workflow: {
                    id: newWorkflowId,
                    name: `${namePrefix}${sourceWorkflow.name}`,
                    description: sourceWorkflow.description,
                    version: '1.0.0',
                    isActive: true,
                    createdAt: now,
                    createdBy: userId,
                },
                sourceWorkflowId,
                message: 'Workflow cloned successfully'
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Workflow clone error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to clone workflow'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=ai-workflows.js.map