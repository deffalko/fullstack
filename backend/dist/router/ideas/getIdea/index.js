"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdeaTrpcRoute = void 0;
const lodash_1 = __importDefault(require("lodash"));
const input_1 = require("./input");
const trpc_1 = require("../../../lib/trpc");
const error_1 = require("../../../lib/error");
exports.getIdeaTrpcRoute = trpc_1.trpcLoggedProcedure.input(input_1.zGetIdeaTrpcInput).query(async ({ ctx, input }) => {
    const rawIdea = await ctx.prisma.idea.findUnique({
        where: {
            nick: input.ideaNick,
        },
        include: {
            author: {
                select: {
                    id: true,
                    nick: true,
                    name: true,
                    avatar: true,
                },
            },
            ideasLikes: {
                select: {
                    id: true,
                },
                where: {
                    userId: ctx.me?.id,
                },
            },
            _count: {
                select: {
                    ideasLikes: true,
                },
            },
        },
    });
    if (rawIdea?.blockedAt) {
        throw new error_1.ExpectedError('Idea is blocked by administrator');
    }
    const isLikedByMe = !!rawIdea?.ideasLikes.length;
    const likesCount = rawIdea?._count.ideasLikes || 0;
    const idea = rawIdea && { ...lodash_1.default.omit(rawIdea, ['ideasLikes', '_count']), isLikedByMe, likesCount };
    return { idea };
});
//# sourceMappingURL=index.js.map