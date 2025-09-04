import { Hono } from 'hono';
interface DatabaseClient {
    query: (query: any) => Promise<any>;
}
export declare function resultsRoutes(db: DatabaseClient, _composio: any): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=results-simple.d.ts.map