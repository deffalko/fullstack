"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileTrpcRoute = void 0;
const error_1 = require("../../../lib/error");
const models_1 = require("../../../lib/models");
const trpc_1 = require("../../../lib/trpc");
const input_1 = require("./input");
exports.updateProfileTrpcRoute = trpc_1.trpcLoggedProcedure
    .input(input_1.zUpdateProfileTrpcInput)
    .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
        throw new Error('UNAUTHORIZED');
    }
    if (ctx.me.nick !== input.nick) {
        const exUser = await ctx.prisma.user.findUnique({
            where: {
                nick: input.nick,
            },
        });
        if (exUser) {
            throw new error_1.ExpectedError('User with this nick already exists');
        }
    }
    const updatedMe = await ctx.prisma.user.update({
        where: {
            id: ctx.me.id,
        },
        data: input,
    });
    ctx.me = updatedMe;
    return (0, models_1.toClientMe)(updatedMe);
});
//# sourceMappingURL=index.js.map