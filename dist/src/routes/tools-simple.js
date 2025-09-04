"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRoutes = toolRoutes;
const hono_1 = require("hono");
const simple_1 = require("@/types/simple");
function toolRoutes(db, composio) {
    const router = new hono_1.Hono();
    // Get available tools
    router.get('/available/:userId', async (c) => {
        try {
            const userId = c.req.param('userId');
            const toolkitsQuery = c.req.query('toolkits');
            const searchQuery = c.req.query('search');
            // Get user's active connections
            const connectionsData = await db.query({
                connections: {
                    $: { where: { userId, status: 'active' } }
                }
            });
            const activeProviders = connectionsData.connections.map((conn) => conn.provider);
            // Get tools from Composio
            let tools = [];
            try {
                const filters = {};
                if (toolkitsQuery) {
                    filters.toolkits = toolkitsQuery.split(',').filter(Boolean);
                }
                else if (activeProviders.length > 0) {
                    filters.toolkits = activeProviders;
                }
                else {
                    filters.toolkits = [];
                }
                tools = await composio.tools.get(userId, filters);
            }
            catch (error) {
                console.warn('Failed to fetch tools:', error);
                tools = [];
            }
            // Transform to our format
            let availableTools = tools.map(tool => {
                const toolkit = (0, simple_1.extractToolkitFromTool)(tool);
                return {
                    name: tool.function.name,
                    description: tool.function.description,
                    toolkit,
                    parameters: tool.function.parameters,
                    requiresAuth: tool.requiresAuth !== false,
                    isConnected: activeProviders.includes(toolkit),
                    tags: tool.tags || [],
                    examples: tool.examples,
                };
            });
            // Apply search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                availableTools = availableTools.filter(tool => tool.name.toLowerCase().includes(searchLower) ||
                    tool.description.toLowerCase().includes(searchLower) ||
                    tool.tags.some(tag => tag.toLowerCase().includes(searchLower)));
            }
            const responseData = {
                tools: availableTools,
                meta: {
                    total: availableTools.length,
                    connectedProviders: activeProviders,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Tools fetch error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch available tools'), 500);
        }
    });
    // Get tools by toolkit
    router.get('/toolkit/:toolkit', async (c) => {
        try {
            const toolkit = c.req.param('toolkit');
            const userId = c.req.query('userId');
            if (!userId) {
                return c.json((0, simple_1.createErrorResponse)('userId query parameter is required'), 400);
            }
            // Check connection
            const connectionData = await db.query({
                connections: {
                    $: { where: { userId, provider: toolkit, status: 'active' } }
                }
            });
            const isConnected = connectionData.connections.length > 0;
            // Get toolkit tools
            let tools = [];
            try {
                tools = await composio.tools.get(userId, { toolkits: [toolkit] });
            }
            catch (error) {
                console.warn(`Failed to fetch ${toolkit} tools:`, error);
            }
            const responseData = {
                toolkit,
                isConnected,
                tools: tools.map(tool => ({
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters,
                    tags: tool.tags || [],
                }))
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Toolkit tools fetch error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to fetch toolkit tools'), 500);
        }
    });
    // Search tools
    router.get('/search', async (c) => {
        try {
            const query = c.req.query('q');
            const userId = c.req.query('userId');
            const limit = parseInt(c.req.query('limit') || '20');
            if (!userId) {
                return c.json((0, simple_1.createErrorResponse)('userId query parameter is required'), 400);
            }
            if (!query) {
                return c.json((0, simple_1.createErrorResponse)('search query (q) is required'), 400);
            }
            // Get all tools and filter
            let tools = [];
            try {
                tools = await composio.tools.get(userId, { toolkits: [] });
            }
            catch (error) {
                console.warn('Failed to search tools:', error);
            }
            // Filter by search query
            const searchLower = query.toLowerCase();
            const filteredTools = tools.filter(tool => tool.function.name.toLowerCase().includes(searchLower) ||
                tool.function.description.toLowerCase().includes(searchLower)).slice(0, limit);
            const responseData = {
                query,
                results: filteredTools.map(tool => {
                    const toolkit = (0, simple_1.extractToolkitFromTool)(tool);
                    return {
                        name: tool.function.name,
                        description: tool.function.description,
                        toolkit,
                        isConnected: false, // Simplified for now
                        tags: tool.tags || [],
                    };
                }),
                meta: {
                    total: filteredTools.length,
                    limit,
                }
            };
            return c.json((0, simple_1.createSuccessResponse)(responseData));
        }
        catch (error) {
            console.error('Tool search error:', error);
            return c.json((0, simple_1.createErrorResponse)('Failed to search tools'), 500);
        }
    });
    return router;
}
//# sourceMappingURL=tools-simple.js.map