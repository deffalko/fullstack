"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppContext = void 0;
const prisma_1 = require("./prisma");
const createAppContext = () => {
    const prisma = (0, prisma_1.createPrismaClient)();
    return {
        prisma,
        stop: async () => {
            await prisma.$disconnect();
        },
    };
};
exports.createAppContext = createAppContext;
//# sourceMappingURL=ctx.js.map