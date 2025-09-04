"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_1 = require("@instantdb/admin");
const simple_1 = require("@/types/simple");
function authRoutes(db, _composio) {
    const router = new hono_1.Hono();
    // Login/Register user
    router.post('/login', (0, zod_validator_1.zValidator)('json', simple_1.LoginRequestSchema), async (c) => {
        try {
            const loginData = c.req.valid('json');
            const { email, name, avatar } = loginData;
            // Check if user exists
            const existingUsers = await db.query({
                users: { $: { where: { email } } }
            });
            let user;
            const now = Date.now();
            if (existingUsers.users.length > 0) {
                // Update last login
                user = existingUsers.users[0];
                await db.transact([
                    db.tx.users[user.id].update({ lastLoginAt: now })
                ]);
            }
            else {
                // Create new user
                const userId = (0, admin_1.id)();
                await db.transact([
                    db.tx.users[userId].update({
                        email,
                        name,
                        ...(avatar && { avatar }),
                        createdAt: now,
                        lastLoginAt: now,
                        plan: 'free',
                        usage: { executions: 0, connections: 0 }
                    })
                ]);
                // Fetch the created user
                const newUsers = await db.query({
                    users: { $: { where: { email } } }
                });
                user = newUsers.users[0];
            }
            const responseData = {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    plan: user.plan,
                    usage: user.usage,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData, existingUsers.users.length > 0 ? 'Login successful' : 'User created successfully'));
        }
        catch (error) {
            console.error('Auth error:', error);
            return c.json((0, simple_1.createErrorResponse)('Authentication failed', error instanceof Error ? error.message : 'Unknown error'), 500);
        }
    });
    // Get user profile
    router.get('/profile/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const userData = await db.query({
                users: { $: { where: { id: userId } } }
            });
            if (userData.users.length === 0) {
                return c.json((0, simple_1.createErrorResponse)('User not found'), 404);
            }
            const user = userData.users[0];
            const responseData = {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    plan: user.plan,
                    usage: user.usage,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Profile fetch error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch profile'), 500);
        }
    });
    // Update user API keys
    router.put('/keys/:userId', (0, zod_validator_1.zValidator)('json', simple_1.UpdateApiKeysRequestSchema), async (c) => {
        try {
            const userId = c.req.param('userId');
            const updateData = c.req.valid('json');
            const { apiKeys } = updateData;
            await db.transact([
                db.tx.users[userId].update({
                    apiKeys,
                    updatedAt: Date.now(),
                })
            ]);
            return c.json((0, simple_1.createSuccessResponse)({ message: 'API keys updated successfully' }));
        }
        catch (error) {
            console.error('API keys update error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to update API keys'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=auth.js.map