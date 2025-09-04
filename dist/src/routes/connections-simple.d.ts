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
    connectedAccounts: {
        initiate: (userId: string, authConfigId: string) => Promise<{
            id: string;
            redirectUrl: string;
        }>;
        get: (connectionId: string) => Promise<{
            status: string;
            id: string;
        }>;
        delete: (connectionId: string) => Promise<void>;
    };
}
export declare function connectionRoutes(db: DatabaseClient, composio: ComposioClient): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=connections-simple.d.ts.map