"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRollbarInstance = exports.rollbarTrpcError = exports.rollbarMiddleware = exports.rollbarCaptureExceptionWithContext = exports.rollbarCaptureException = exports.initRollbar = void 0;
const rollbar_1 = __importDefault(require("rollbar"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ROLLBAR_ACCESS_TOKEN = process.env.ROLLBAR_SERVER_ACCESS_TOKEN;
const SOURCE_VERSION = process.env.SOURCE_VERSION || '1.0.0';
let rollbarInstance = null;
const initRollbar = () => {
    const isRollbarEnabled = ROLLBAR_ACCESS_TOKEN;
    if (isRollbarEnabled) {
        rollbarInstance = new rollbar_1.default({
            accessToken: ROLLBAR_ACCESS_TOKEN,
            captureUncaught: true,
            captureUnhandledRejections: true,
            environment: process.env.HOST_ENV || 'local',
            payload: {
                client: {
                    javascript: {
                        source_map_enabled: true,
                        code_version: SOURCE_VERSION,
                    },
                },
                code_version: SOURCE_VERSION,
                server: {
                    host: process.env.HOSTNAME || 'localhost',
                    root: process.cwd(),
                },
            },
        });
    }
};
exports.initRollbar = initRollbar;
const rollbarCaptureException = (error, metadata) => {
    if (!rollbarInstance) {
        return;
    }
    if (typeof error === 'string') {
        rollbarInstance.error(error, metadata);
    }
    else {
        rollbarInstance.error(error, metadata);
    }
};
exports.rollbarCaptureException = rollbarCaptureException;
const rollbarCaptureExceptionWithContext = (error, context, metadata) => {
    if (!rollbarInstance)
        return;
    const enhancedError = new Error(error.message);
    enhancedError.stack = error.stack;
    Object.assign(enhancedError, { context });
    rollbarInstance.error(enhancedError, { ...metadata, context });
};
exports.rollbarCaptureExceptionWithContext = rollbarCaptureExceptionWithContext;
const rollbarMiddleware = (err, req, res, next) => {
    if (!rollbarInstance) {
        return next(err);
    }
    rollbarInstance.error(err, {
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query,
            ip: req.ip,
            user: req.user,
        },
    });
    next(err);
};
exports.rollbarMiddleware = rollbarMiddleware;
const rollbarTrpcError = (error, context) => {
    if (!rollbarInstance)
        return;
    const err = error instanceof Error ? error : new Error(String(error));
    rollbarInstance.error(err, {
        trpc: true,
        ...context,
    });
};
exports.rollbarTrpcError = rollbarTrpcError;
// Экспортируем экземпляр для прямого доступа (опционально)
const getRollbarInstance = () => rollbarInstance;
exports.getRollbarInstance = getRollbarInstance;
// Для обратной совместимости
exports.default = rollbarInstance;
//# sourceMappingURL=rollbar.js.map