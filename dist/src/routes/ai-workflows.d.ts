/**
 * AI Workflow Management Routes
 * Allows AI agents to create, modify, and manage workflows
 */
import { Hono } from 'hono';
interface DatabaseClient {
    query: (query: any) => Promise<any>;
    transact: (transactions: any[]) => Promise<any>;
    tx: any;
}
export declare function aiWorkflowRoutes(db: DatabaseClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=ai-workflows.d.ts.map