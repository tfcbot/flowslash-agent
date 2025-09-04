"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRoutes = connectionRoutes;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_1 = require("@instantdb/admin");
const simple_1 = require("@/types/simple");
function connectionRoutes(db, composio) {
    const router = new hono_1.Hono();
    // Create connection
    router.post('/create', (0, zod_validator_1.zValidator)('json', simple_1.CreateConnectionRequestSchema), async (c) => {
        try {
            const connectionData = c.req.valid('json');
            const { userId, provider } = connectionData;
            // Check for existing auth config
            const existingConfigs = await db.query({
                authConfigs: {
                    $: { where: { userId, provider, isActive: true } }
                }
            });
            let authConfigId;
            const now = Date.now();
            if (existingConfigs.authConfigs.length > 0) {
                authConfigId = existingConfigs.authConfigs[0].configId;
            }
            else {
                // Create new auth config
                const authConfig = await composio.authConfigs.create(provider);
                authConfigId = authConfig.id;
                await db.transact([
                    db.tx.authConfigs[(0, admin_1.id)()].update({
                        userId,
                        provider,
                        configId: authConfigId,
                        name: `${provider} Connection`,
                        isActive: true,
                        createdAt: now,
                        updatedAt: now,
                    })
                ]);
            }
            // Initiate the connection
            const connection = await composio.connectedAccounts.initiate(userId, authConfigId);
            // Store connection in database
            const connectionId = (0, admin_1.id)();
            await db.transact([
                db.tx.connections[connectionId].update({
                    userId,
                    provider,
                    authConfigId: connection.id,
                    status: simple_1.ConnectionStatus.PENDING,
                    createdAt: now,
                    updatedAt: now,
                })
            ]);
            const responseData = {
                connection: {
                    id: connectionId,
                    provider,
                    status: simple_1.ConnectionStatus.PENDING,
                    createdAt: now,
                    redirectUrl: connection.redirectUrl,
                },
                message: 'Connection initiated. Please complete authorization via redirectUrl.'
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Connection creation error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to create connection', error instanceof Error ? error.message : 'Unknown error'), 500);
        }
    });
    // List user connections
    router.get('/list/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const connectionsData = await db.query({
                connections: {
                    $: {
                        where: { userId },
                        order: { createdAt: 'desc' }
                    }
                }
            });
            const responseData = {
                connections: connectionsData.connections.map((conn) => ({
                    id: conn.id,
                    provider: conn.provider,
                    status: conn.status,
                    createdAt: conn.createdAt,
                    expiresAt: conn.expiresAt,
                }))
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Connections list error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch connections'), 500);
        }
    });
    // Get connection status
    router.get('/status/:connectionId', async (c) => {
        try {
            const connectionId = c.req.param('connectionId');
            const connectionData = await db.query({
                connections: { $: { where: { id: connectionId } } }
            });
            if (connectionData.connections.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Connection not found'), 404);
            }
            const connection = connectionData.connections[0];
            try {
                const composioConnection = await composio.connectedAccounts.get(connection.authConfigId);
                // Update status if changed
                if (composioConnection.status !== connection.status) {
                    await db.transact([
                        db.tx.connections[connectionId].update({
                            status: composioConnection.status,
                            updatedAt: Date.now(),
                        })
                    ]);
                }
                const responseData = {
                    connection: {
                        id: connection.id,
                        provider: connection.provider,
                        status: composioConnection.status,
                        createdAt: connection.createdAt,
                        expiresAt: connection.expiresAt,
                    }
                };
                return c.json((0, simple_1.createSuccessResponse)(responseData));
            }
            catch (composioError) {
                // Return stored status if Composio call fails
                const responseData = {
                    connection: {
                        id: connection.id,
                        provider: connection.provider,
                        status: connection.status,
                        createdAt: connection.createdAt,
                        expiresAt: connection.expiresAt,
                    },
                    warning: 'Status might not be current'
                };
                return c.json((0, simple_1.createSuccessResponse)(responseData));
            }
        }
        catch (error) {
            console.error('Connection status error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch connection status'), 500);
        }
    });
    // Delete connection
    router.delete('/:connectionId', async (c) => {
        try {
            const connectionId = c.req.param('connectionId');
            const connectionData = await db.query({
                connections: { $: { where: { id: connectionId } } }
            });
            if (connectionData.connections.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('Connection not found'), 404);
            }
            const connection = connectionData.connections[0];
            try {
                await composio.connectedAccounts.delete(connection.authConfigId);
            }
            catch (composioError) {
                console.warn('Failed to revoke Composio connection:', composioError);
            }
            await db.transact([db.tx.connections[connectionId].delete()]);
            return c.json((0, simple_1.createSuccessResponse)({ message: 'Connection deleted successfully' }));
        }
        catch (error) {
            console.error('Connection deletion error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to delete connection'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=connections-simple.js.map