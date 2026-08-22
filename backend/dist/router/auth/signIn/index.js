"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInTrpcRoute = void 0;
const error_1 = require("../../../lib/error");
const trpc_1 = require("../../../lib/trpc");
const getPasswordHash_1 = require("../../../utils/getPasswordHash");
const signJWT_1 = require("../../../utils/signJWT");
const input_1 = require("./input");
exports.signInTrpcRoute = trpc_1.trpcLoggedProcedure.input(input_1.zSignInTrpcInput).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findFirst({
        where: {
            nick: input.nick,
            password: (0, getPasswordHash_1.getPasswordHash)(input.password),
        },
    });
    if (!user) {
        throw new error_1.ExpectedError('Wrong nick or password');
    }
    const token = (0, signJWT_1.signJWT)(user.id);
    return { token };
});
//# sourceMappingURL=index.js.map