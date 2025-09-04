import { Composio } from "@composio/core";
/**
 * Composio client instance for server-side operations
 * This should only be used in server-side code (API routes, server components)
 * For client-side operations, use the API endpoints in /app/api/
 */
declare const composio: Composio<import("@composio/core").OpenAIProvider>;
export default composio;
//# sourceMappingURL=composio.d.ts.map