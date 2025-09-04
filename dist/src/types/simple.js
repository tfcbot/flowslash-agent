"use strict";
/**
 * Simplified TypeScript-native types
 * Clean, working type definitions without over-engineering
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiErrorResponse = exports.isApiSuccessResponse = exports.extractToolkitFromTool = exports.createErrorResponse = exports.createSuccessResponse = exports.ExecuteRequestSchema = exports.ExecutionStatus = exports.ConnectionStatus = exports.Provider = void 0;
const zod_1 = require("zod");
// =============================================================================
// CORE TYPES
// =============================================================================
var Provider;
(function (Provider) {
    Provider["GMAIL"] = "GMAIL";
    Provider["SLACK"] = "SLACK";
    Provider["GITHUB"] = "GITHUB";
    Provider["NOTION"] = "NOTION";
    Provider["TRELLO"] = "TRELLO";
    Provider["DISCORD"] = "DISCORD";
    Provider["TELEGRAM"] = "TELEGRAM";
    Provider["TWITTER"] = "TWITTER";
    Provider["LINKEDIN"] = "LINKEDIN";
    Provider["DROPBOX"] = "DROPBOX";
    Provider["GOOGLE_DRIVE"] = "GOOGLE_DRIVE";
})(Provider || (exports.Provider = Provider = {}));
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["PENDING"] = "pending";
    ConnectionStatus["ACTIVE"] = "active";
    ConnectionStatus["EXPIRED"] = "expired";
    ConnectionStatus["FAILED"] = "failed";
    ConnectionStatus["INACTIVE"] = "inactive";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["PENDING"] = "pending";
    ExecutionStatus["RUNNING"] = "running";
    ExecutionStatus["COMPLETED"] = "completed";
    ExecutionStatus["FAILED"] = "failed";
})(ExecutionStatus || (exports.ExecutionStatus = ExecutionStatus = {}));
// =============================================================================
// API REQUEST/RESPONSE SCHEMAS
// =============================================================================
// Execute workflow request - stateless microservice
exports.ExecuteRequestSchema = zod_1.z.object({
    input: zod_1.z.record(zod_1.z.unknown()),
    userId: zod_1.z.string().optional(), // Optional - extracted from bearer token if not provided
});
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
const createSuccessResponse = (data, message) => {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    if (message) {
        response.message = message;
    }
    return response;
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (error, message) => {
    const response = {
        success: false,
        error,
        timestamp: new Date().toISOString(),
    };
    if (message) {
        response.message = message;
    }
    return response;
};
exports.createErrorResponse = createErrorResponse;
const extractToolkitFromTool = (tool) => {
    const toolkitName = tool.function.name.split('_')[0];
    if (toolkitName && toolkitName in Provider) {
        return Provider[toolkitName];
    }
    return Provider.GITHUB; // Fallback
};
exports.extractToolkitFromTool = extractToolkitFromTool;
// =============================================================================
// TYPE GUARDS
// =============================================================================
const isApiSuccessResponse = (response) => response.success === true;
exports.isApiSuccessResponse = isApiSuccessResponse;
const isApiErrorResponse = (response) => response.success === false;
exports.isApiErrorResponse = isApiErrorResponse;
//# sourceMappingURL=simple.js.map