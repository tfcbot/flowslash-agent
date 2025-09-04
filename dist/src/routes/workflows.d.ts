import { Hono } from 'hono';
interface DatabaseClient {
    query: (query: any) => Promise<any>;
    transact: (transactions: any[]) => Promise<any>;
    tx: any;
}
interface ComposioClient {
    tools: any;
}
export declare function workflowRoutes(db: DatabaseClient, composio: ComposioClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=workflows.d.ts.map