"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIdeaLikeTrpcRoute = void 0;
const trpc_1 = require("../../../lib/trpc");
const input_1 = require("./input");
exports.setIdeaLikeTrpcRoute = trpc_1.trpcLoggedProcedure
    .input(input_1.zSetIdeaLikeIdeaTrpcInput)
    .mutation(async ({ ctx, input }) => {
    const { ideaId, isLikedByMe } = input;
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
    if (isLikedByMe) {
        await ctx.prisma.ideaLike.upsert({
            where: {
                ideaId_userId: {
                    ideaId,
                    userId: ctx.me.id,
                },
            },
            create: {
                userId: ctx.me.id,
                ideaId,
            },
            update: {},
        });
    }
    else {
        await ctx.prisma.ideaLike.delete({
            where: {
                ideaId_userId: {
                    ideaId,
                    userId: ctx.me.id,
                },
            },
        });
    }
    const likesCount = await ctx.prisma.ideaLike.count({
        where: {
            ideaId,
        },
    });
    return {
        idea: {
            id: idea.id,
            likesCount,
            isLikedByMe,
        },
    };
});
//# sourceMappingURL=index.js.map