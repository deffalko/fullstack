"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdeaTrpcRoute = void 0;
const error_1 = require("../../../lib/error");
const trpc_1 = require("../../../lib/trpc");
const input_1 = require("./input");
exports.createIdeaTrpcRoute = trpc_1.trpcLoggedProcedure.input(input_1.zCreateIdeaTrpcInput).mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
        throw Error('UNAUTHORIZED');
    }
    const exIdea = await ctx.prisma.idea.findUnique({
        where: {
            nick: input.nick,
        },
    });
    if (exIdea) {
        throw new error_1.ExpectedError('Idea with this nick already exists');
    }
    await ctx.prisma.idea.create({
        data: { ...input, authorId: ctx.me.id },
    });
    return true;
});
//# sourceMappingURL=index.js.map