"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@composio/core");
/**
 * Composio client instance for server-side operations
 * This should only be used in server-side code (API routes, server components)
 * For client-side operations, use the API endpoints in /app/api/
 */
const composio = new core_1.Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
});
exports.default = composio;
//# sourceMappingURL=composio.js.map