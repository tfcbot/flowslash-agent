import { Hono } from 'hono';
import { type ComposioTool } from '@/types/simple';
interface DatabaseClient {
    query: (query: any) => Promise<any>;
}
interface ComposioClient {
    tools: {
        get: (userId: string, filters: any) => Promise<ComposioTool[]>;
    };
}
export declare function toolRoutes(db: DatabaseClient, composio: ComposioClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=tools-simple.d.ts.map