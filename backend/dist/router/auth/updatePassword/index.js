"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordTrpcRoute = void 0;
const error_1 = require("../../../lib/error");
const trpc_1 = require("../../../lib/trpc");
const getPasswordHash_1 = require("../../../utils/getPasswordHash");
const input_1 = require("./input");
exports.updatePasswordTrpcRoute = trpc_1.trpcLoggedProcedure
    .input(input_1.zUpdatePasswordTrpcInput)
    .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
        throw new Error('UNAUTHORIZED');
    }
    if (ctx.me.password !== (0, getPasswordHash_1.getPasswordHash)(input.oldPassword)) {
        throw new error_1.ExpectedError('Wrong old password');
    }
    const updatedMe = await ctx.prisma.user.update({
        where: {
            id: ctx.me.id,
        },
        data: {
            password: (0, getPasswordHash_1.getPasswordHash)(input.newPassword),
        },
    });
    ctx.me = updatedMe;
    return true;
});
//# sourceMappingURL=index.js.map