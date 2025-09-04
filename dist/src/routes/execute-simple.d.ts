import { Hono } from 'hono';
interface DatabaseClient {
    query: (query: any) => Promise<any>;
    transact: (transactions: any[]) => Promise<any>;
    tx: any;
}
interface ComposioClient {
    tools: {
        get: (userId: string, filters: any) => Promise<any[]>;
        execute: (toolName: string, request: {
            userId: string;
            arguments: any;
        }) => Promise<{
            data?: any;
            successful?: boolean;
        }>;
    };
}
export declare function executeRoutes(db: DatabaseClient, composio: ComposioClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=execute-simple.d.ts.map