"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTrpcToExpressApp = exports.trpcLoggedProcedure = exports.createTrpcRouter = exports.getCreateTrpcContext = exports.getTrpcContext = void 0;
const server_1 = require("@trpc/server");
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const superjson_1 = __importDefault(require("superjson"));
const express_1 = require("trpc-playground/handlers/express");
const logger_1 = require("./logger");
const error_1 = require("./error");
const getTrpcContext = ({ appContext, req }) => ({
    ...appContext,
    me: req.user || null,
});
exports.getTrpcContext = getTrpcContext;
const getCreateTrpcContext = (appContext) => ({ req }) => (0, exports.getTrpcContext)({ appContext, req: req });
exports.getCreateTrpcContext = getCreateTrpcContext;
const trpc = server_1.initTRPC.context().create({
    transformer: superjson_1.default,
    errorFormatter: ({ shape, error }) => {
        // Проверяем, является ли ошибка ожидаемой
        const isExpected = error.cause instanceof error_1.ExpectedError;
        return {
            ...shape,
            data: {
                ...shape.data,
                isExpected, // ← Добавляем флаг в ответ
            },
        };
    },
});
exports.createTrpcRouter = trpc.router;
exports.trpcLoggedProcedure = trpc.procedure.use(trpc.middleware(async ({ path, type, next, ctx, rawInput }) => {
    const start = Date.now();
    const result = await next();
    const durationMs = Date.now() - start;
    const meta = {
        path,
        type,
        userId: ctx.me?.id || null,
        durationMs,
        rawInput: rawInput || null,
    };
    if (result.ok) {
        logger_1.logger.info(`trpc:${type}:success`, 'Successfull request', { ...meta, output: result.data });
    }
    else {
        // ✅ Используем result.error напрямую с утверждением типа
        logger_1.logger.error(`trpc:${type}:error`, result.error, meta);
        // logger.error(`trpc:${type}:error`, result.error, meta)
    }
    return result;
}));
const applyTrpcToExpressApp = async (expressApp, appContext, trpcRouter) => {
    expressApp.use('/trpc', trpcExpress.createExpressMiddleware({
        router: trpcRouter,
        createContext: (0, exports.getCreateTrpcContext)(appContext),
    }));
    expressApp.use('/trpc-playground', await (0, express_1.expressHandler)({
        trpcApiEndpoint: '/trpc',
        playgroundEndpoint: '/trpc-playground',
        router: trpcRouter,
        request: {
            superjson: true,
        },
    }));
};
exports.applyTrpcToExpressApp = applyTrpcToExpressApp;
//# sourceMappingURL=trpc.js.map