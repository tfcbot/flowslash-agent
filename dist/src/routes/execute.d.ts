/**
 * Stateless Workflow Execution Route
 * Single /execute endpoint for AI-generated LangGraph workflows
 */
import { Hono } from 'hono';
interface ComposioClient {
    tools: any;
}
export declare function executeRoutes(composio: ComposioClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=execute.d.ts.map