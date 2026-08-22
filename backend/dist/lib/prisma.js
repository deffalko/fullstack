"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrismaClient = void 0;
const env_1 = require("./env");
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const createPrismaClient = () => {
    const prisma = new client_1.PrismaClient({
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            {
                emit: 'event',
                level: 'info',
            },
        ],
    });
    prisma.$on('query', (e) => {
        logger_1.logger.info('prisma:low:query', 'Successfull request', {
            query: e.query,
            duration: e.duration,
            params: env_1.env.HOST_ENV === 'local' ? e.params : '***',
        });
    });
    prisma.$on('info', (e) => {
        logger_1.logger.info('prisma:low:info', e.message);
    });
    const extendedPrisma = prisma.$extends({
        client: {},
        query: {
            $allModels: {
                $allOperations: async ({ model, operation, args, query }) => {
                    const start = Date.now();
                    try {
                        const result = await query(args);
                        const durationMs = Date.now() - start;
                        logger_1.logger.info('prisma:high', 'Successfull request', { model, operation, args, durationMs });
                        return result;
                    }
                    catch (error) {
                        const durationMs = Date.now() - start;
                        logger_1.logger.error('prisma:high', error, { model, operation, args, durationMs });
                        throw error;
                    }
                },
            },
        },
    });
    return extendedPrisma;
};
exports.createPrismaClient = createPrismaClient;
//# sourceMappingURL=prisma.js.map