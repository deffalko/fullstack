"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIdeaTrpcRoute = void 0;
const error_1 = require("../../../lib/error");
const trpc_1 = require("../../../lib/trpc");
const can_1 = require("../../../utils/can");
const input_1 = require("./input");
exports.updateIdeaTrpcRoute = trpc_1.trpcLoggedProcedure.input(input_1.zUpdateIdeaTrpcInput).mutation(async ({ ctx, input }) => {
    const { ideaId, ...ideaInput } = input;
    if (!ctx.me) {
        throw new Error('UNAUTHORIZED');
    }
    const idea = await ctx.prisma.idea.findUnique({
        where: {
            id: ideaId,
        },
    });
    if (!idea) {
        throw new Error('NOT_FOUND');
    }
    if (!(0, can_1.canEditIdea)(ctx.me, idea)) {
        throw new Error('NOT_YOUR_IDEA');
    }
    if (idea.nick !== input.nick) {
        const exIdea = await ctx.prisma.idea.findUnique({
            where: {
                nick: input.nick,
            },
        });
        if (exIdea) {
            throw new error_1.ExpectedError('Idea with this nick already exists');
        }
    }
    await ctx.prisma.idea.update({
        where: {
            id: ideaId,
        },
        data: {
            ...ideaInput,
        },
    });
    return true;
});
//# sourceMappingURL=index.js.map