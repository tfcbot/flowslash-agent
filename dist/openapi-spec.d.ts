interface OpenAPISpecification {
    openapi: string;
    info: Record<string, unknown>;
    paths: Record<string, unknown>;
    components?: Record<string, unknown>;
}
export declare const openApiSpec: OpenAPISpecification | {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
    }[];
    paths: {
        '/': {
            get: {
                summary: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} | null;
export {};
//# sourceMappingURL=openapi-spec.d.ts.map