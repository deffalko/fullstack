"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeTrpcRoute = void 0;
const models_1 = require("../../../lib/models");
const trpc_1 = require("../../../lib/trpc");
exports.getMeTrpcRoute = trpc_1.trpcLoggedProcedure.query(({ ctx }) => {
    return { me: (0, models_1.toClientMe)(ctx.me) };
});
//# sourceMappingURL=index.js.map