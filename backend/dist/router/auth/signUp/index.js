"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpTrpcRoute = void 0;
const emails_1 = require("../../../lib/emails");
const error_1 = require("../../../lib/error");
const trpc_1 = require("../../../lib/trpc");
const getPasswordHash_1 = require("../../../utils/getPasswordHash");
const signJWT_1 = require("../../../utils/signJWT");
const input_1 = require("./input");
exports.signUpTrpcRoute = trpc_1.trpcLoggedProcedure.input(input_1.zSignUpTrpcInput).mutation(async ({ ctx, input }) => {
    const exUserWithNick = await ctx.prisma.user.findUnique({
        where: {
            nick: input.nick,
        },
    });
    if (exUserWithNick) {
        throw new error_1.ExpectedError('User with this nick already exists');
    }
    const exUserWithEmail = await ctx.prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (exUserWithEmail) {
        throw new error_1.ExpectedError('User with this email already exists');
    }
    const user = await ctx.prisma.user.create({
        data: {
            nick: input.nick,
            email: input.email,
            password: (0, getPasswordHash_1.getPasswordHash)(input.password),
        },
    });
    void (0, emails_1.sendWelcomeEmail)({ user });
    const token = (0, signJWT_1.signJWT)(user.id);
    return { token };
});
//# sourceMappingURL=index.js.map