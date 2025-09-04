import { Hono } from 'hono';
interface DatabaseClient {
    query: (query: any) => Promise<any>;
    transact: (transactions: any[]) => Promise<any>;
    tx: any;
}
interface ComposioClient {
    authConfigs: {
        create: (provider: string) => Promise<{
            id: string;
        }>;
    };
}
export declare function authRoutes(db: DatabaseClient, _composio: ComposioClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=auth.d.ts.map