"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockIdeaTrpcRoute = void 0;
const emails_1 = require("../../../lib/emails");
const trpc_1 = require("../../../lib/trpc");
const can_1 = require("../../../utils/can");
const input_1 = require("./input");
exports.blockIdeaTrpcRoute = trpc_1.trpcLoggedProcedure.input(input_1.zBlockIdeaTrpcInput).mutation(async ({ ctx, input }) => {
    const { ideaId } = input;
    if (!(0, can_1.canBlockIdeas)(ctx.me)) {
        throw new Error('PERMISSION_DENIED');
    }
    const idea = await ctx.prisma.idea.findUnique({
        where: {
            id: ideaId,
        },
        include: {
            author: true,
        },
    });
    if (!idea) {
        throw new Error('NOT_FOUND');
    }
    await ctx.prisma.idea.update({
        where: {
            id: ideaId,
        },
        data: {
            blockedAt: new Date(),
        },
    });
    void (0, emails_1.sendIdeaBlockedEmail)({ user: idea.author, idea });
    return true;
});
//# sourceMappingURL=index.js.map