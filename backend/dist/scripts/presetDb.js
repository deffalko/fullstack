"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetDb = void 0;
const env_1 = require("../lib/env");
const getPasswordHash_1 = require("../utils/getPasswordHash");
const presetDb = async (ctx) => {
    await ctx.prisma.user.upsert({
        where: {
            nick: 'admin',
        },
        create: {
            nick: 'admin',
            email: 'admin@example.com',
            password: (0, getPasswordHash_1.getPasswordHash)(env_1.env.INITIAL_ADMIN_PASSWORD),
            permissions: ['ALL'],
        },
        update: {
            permissions: ['ALL'],
        },
    });
};
exports.presetDb = presetDb;
//# sourceMappingURL=presetDb.js.map